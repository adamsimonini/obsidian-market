-- =============================================================================
-- Obsidian Market Schema v2
-- Privacy-preserving prediction market on Aleo
-- =============================================================================
--
-- DESIGN PRINCIPLES:
--   1. Private bets: Aleo BetRecords are private. Off-chain DB stores NO trader
--      identities on trades. Users track positions via their own wallet.
--   2. No drift: On-chain reserves are synced to off-chain after every trade.
--      Off-chain is the read source for UI; on-chain is the settlement source.
--   3. Anonymized aggregation: Volume, price, trade count are public.
--      WHO traded is never stored (except opt-in public trades).
--   4. Binary first, multi-outcome ready: outcomes table supports expansion.
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. CATEGORIES
-- ---------------------------------------------------------------------------
create table public.categories (
    id uuid primary key default extensions.uuid_generate_v4(),
    name text not null,
    slug text not null,
    description text,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),

    constraint categories_name_key unique (name),
    constraint categories_slug_key unique (slug)
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
    on public.categories for select to public using (true);

-- Only service_role can manage categories
create policy "Service role manages categories"
    on public.categories for all to service_role using (true) with check (true);

-- Seed default categories
insert into public.categories (name, slug, display_order) values
    ('Politics',  'politics',  1),
    ('Sports',    'sports',    2),
    ('Crypto',    'crypto',    3),
    ('Technology','technology', 4),
    ('Science',   'science',   5),
    ('Culture',   'culture',   6);


-- ---------------------------------------------------------------------------
-- 2. EVENTS (grouping entity for related markets)
-- ---------------------------------------------------------------------------
create table public.events (
    id uuid primary key default extensions.uuid_generate_v4(),
    category_id uuid references public.categories(id),
    title text not null,
    slug text not null,
    description text,
    image_url text,
    start_date timestamptz,
    end_date timestamptz,
    status text not null default 'active',
    metadata jsonb default '{}',  -- flexible: { sport: "nba", team_a: "...", ... }
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint events_slug_key unique (slug),
    constraint events_status_check check (status in ('active', 'resolved', 'cancelled'))
);

alter table public.events enable row level security;

create index idx_events_category on public.events(category_id);
create index idx_events_status on public.events(status);
create index idx_events_start_date on public.events(start_date desc);

create policy "Events are viewable by everyone"
    on public.events for select to public using (true);

create policy "Service role manages events"
    on public.events for all to service_role using (true) with check (true);

create trigger update_events_updated_at
    before update on public.events
    for each row execute function public.update_updated_at_column();


-- ---------------------------------------------------------------------------
-- 3. MARKETS (enhanced — additive ALTER on existing table)
-- ---------------------------------------------------------------------------

-- New columns on existing markets table
alter table public.markets
    add column if not exists event_id uuid references public.events(id),
    add column if not exists category_id uuid references public.categories(id),
    add column if not exists slug text,
    add column if not exists image_url text,
    add column if not exists market_type text not null default 'binary',
    add column if not exists resolution_outcome text,
    add column if not exists resolved_at timestamptz,
    add column if not exists yes_reserves bigint not null default 0,
    add column if not exists no_reserves bigint not null default 0,
    add column if not exists yes_price numeric(10,6) not null default 0.5,
    add column if not exists no_price numeric(10,6) not null default 0.5,
    add column if not exists total_volume numeric not null default 0,
    add column if not exists volume_24h numeric not null default 0,
    add column if not exists liquidity numeric not null default 0,
    add column if not exists trade_count integer not null default 0,
    add column if not exists fee_bps integer not null default 200,  -- 2% default
    add column if not exists featured boolean not null default false;

-- Constraints on new columns
alter table public.markets
    add constraint markets_slug_key unique (slug);

alter table public.markets
    add constraint markets_market_type_check
    check (market_type in ('binary', 'categorical', 'scalar'));

alter table public.markets
    add constraint markets_resolution_outcome_check
    check (resolution_outcome in ('yes', 'no', 'invalid'));

alter table public.markets
    add constraint markets_yes_price_range
    check (yes_price >= 0 and yes_price <= 1);

alter table public.markets
    add constraint markets_no_price_range
    check (no_price >= 0 and no_price <= 1);

-- New indexes
create index if not exists idx_markets_event_id on public.markets(event_id);
create index if not exists idx_markets_category_id on public.markets(category_id);
create index if not exists idx_markets_featured on public.markets(featured) where featured = true;
create index if not exists idx_markets_volume on public.markets(total_volume desc);
create index if not exists idx_markets_slug on public.markets(slug);

-- Derived price function: convert CPMM reserves to implied probability
-- Price_yes = no_reserves / (yes_reserves + no_reserves)
-- Price_no  = yes_reserves / (yes_reserves + no_reserves)
create or replace function public.update_market_prices()
returns trigger language plpgsql as $$
declare
    total bigint;
begin
    total := new.yes_reserves + new.no_reserves;
    if total > 0 then
        new.yes_price := round(new.no_reserves::numeric / total, 6);
        new.no_price  := round(new.yes_reserves::numeric / total, 6);
        new.liquidity := total;
    end if;
    return new;
end;
$$;

create trigger update_market_prices_trigger
    before insert or update of yes_reserves, no_reserves on public.markets
    for each row execute function public.update_market_prices();


-- ---------------------------------------------------------------------------
-- 4. OUTCOMES (binary now, multi-outcome ready)
-- ---------------------------------------------------------------------------
create table public.outcomes (
    id uuid primary key default extensions.uuid_generate_v4(),
    market_id uuid not null references public.markets(id) on delete cascade,
    index integer not null,            -- 0 = yes, 1 = no (binary); 0,1,2... (multi)
    label text not null,               -- "Yes", "No", "Trump", "Biden"
    outcome_type text not null default 'binary',
    price numeric(10,6) not null default 0.5,
    shares_outstanding bigint not null default 0,
    resolution_value numeric,          -- NULL until resolved; 1.0 = winner, 0.0 = loser
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint outcomes_type_check check (outcome_type in ('binary', 'categorical', 'scalar')),
    constraint outcomes_market_index_key unique (market_id, index),
    constraint outcomes_price_range check (price >= 0 and price <= 1)
);

alter table public.outcomes enable row level security;

create index idx_outcomes_market on public.outcomes(market_id);

create policy "Outcomes are viewable by everyone"
    on public.outcomes for select to public using (true);

create policy "Service role manages outcomes"
    on public.outcomes for all to service_role using (true) with check (true);

create trigger update_outcomes_updated_at
    before update on public.outcomes
    for each row execute function public.update_updated_at_column();


-- ---------------------------------------------------------------------------
-- 5. TRADES (anonymized — NO user identity)
-- ---------------------------------------------------------------------------
-- Records that a trade occurred and its effect on market state.
-- Privacy: no wallet_address, no user_id. Only market-level data.
-- The frontend writes this after a successful Aleo transition.
create table public.trades (
    id uuid primary key default extensions.uuid_generate_v4(),
    market_id uuid not null references public.markets(id),
    side text not null,                        -- 'yes' or 'no'
    shares bigint not null,                    -- shares received
    amount bigint not null,                    -- microcredits spent
    price_before numeric(10,6) not null,       -- implied probability before trade
    price_after numeric(10,6) not null,        -- implied probability after trade
    yes_reserves_after bigint not null,        -- market state after trade
    no_reserves_after bigint not null,
    tx_hash text,                              -- Aleo transaction hash (optional)
    created_at timestamptz not null default now(),

    constraint trades_side_check check (side in ('yes', 'no')),
    constraint trades_shares_positive check (shares > 0),
    constraint trades_amount_positive check (amount > 0)
);

alter table public.trades enable row level security;

create index idx_trades_market_id on public.trades(market_id);
create index idx_trades_created_at on public.trades(created_at desc);
create index idx_trades_market_time on public.trades(market_id, created_at desc);

-- Everyone can read trades (they're anonymized)
create policy "Trades are viewable by everyone"
    on public.trades for select to public using (true);

-- Only service_role can insert trades (via server-side API route)
create policy "Service role inserts trades"
    on public.trades for insert to service_role with check (true);

-- Trigger: update market aggregates when a trade is inserted
create or replace function public.update_market_on_trade()
returns trigger language plpgsql as $$
begin
    update public.markets set
        yes_reserves = new.yes_reserves_after,
        no_reserves  = new.no_reserves_after,
        total_volume = total_volume + new.amount,
        trade_count  = trade_count + 1,
        updated_at   = now()
    where id = new.market_id;
    return new;
end;
$$;

create trigger on_trade_inserted
    after insert on public.trades
    for each row execute function public.update_market_on_trade();


-- ---------------------------------------------------------------------------
-- 6. MARKET SNAPSHOTS (time-series for price charts)
-- ---------------------------------------------------------------------------
create table public.market_snapshots (
    id bigint generated always as identity primary key,
    market_id uuid not null references public.markets(id),
    yes_price numeric(10,6) not null,
    no_price numeric(10,6) not null,
    yes_reserves bigint not null,
    no_reserves bigint not null,
    volume_cumulative numeric not null default 0,
    trade_count_cumulative integer not null default 0,
    captured_at timestamptz not null default now()
);

alter table public.market_snapshots enable row level security;

create index idx_snapshots_market_time on public.market_snapshots(market_id, captured_at desc);

create policy "Snapshots are viewable by everyone"
    on public.market_snapshots for select to public using (true);

create policy "Service role manages snapshots"
    on public.market_snapshots for insert to service_role with check (true);

-- Auto-capture snapshot on every trade
create or replace function public.capture_market_snapshot()
returns trigger language plpgsql as $$
declare
    total bigint;
    p_yes numeric(10,6);
    p_no  numeric(10,6);
    m_vol numeric;
    m_tc  integer;
begin
    total := new.yes_reserves_after + new.no_reserves_after;
    if total > 0 then
        p_yes := round(new.no_reserves_after::numeric / total, 6);
        p_no  := round(new.yes_reserves_after::numeric / total, 6);
    else
        p_yes := 0.5;
        p_no  := 0.5;
    end if;

    select total_volume, trade_count into m_vol, m_tc
    from public.markets where id = new.market_id;

    insert into public.market_snapshots
        (market_id, yes_price, no_price, yes_reserves, no_reserves,
         volume_cumulative, trade_count_cumulative, captured_at)
    values
        (new.market_id, p_yes, p_no, new.yes_reserves_after, new.no_reserves_after,
         coalesce(m_vol, 0) + new.amount, coalesce(m_tc, 0) + 1, now());

    return new;
end;
$$;

create trigger on_trade_capture_snapshot
    after insert on public.trades
    for each row execute function public.capture_market_snapshot();


-- ---------------------------------------------------------------------------
-- 7. PUBLIC TRADES (opt-in leaderboard / social)
-- ---------------------------------------------------------------------------
-- Users can CHOOSE to make a trade public for leaderboard/social features.
-- This is a separate table — the default is private.
create table public.public_trades (
    id uuid primary key default extensions.uuid_generate_v4(),
    trade_id uuid references public.trades(id),
    wallet_address text not null,
    market_id uuid not null references public.markets(id),
    side text not null,
    shares bigint not null,
    entry_price numeric(10,6) not null,
    realized_pnl numeric,               -- filled after resolution
    created_at timestamptz not null default now(),

    constraint public_trades_side_check check (side in ('yes', 'no'))
);

alter table public.public_trades enable row level security;

create index idx_public_trades_wallet on public.public_trades(wallet_address);
create index idx_public_trades_market on public.public_trades(market_id);
create index idx_public_trades_pnl on public.public_trades(realized_pnl desc nulls last);

-- Everyone can see public trades (that's the point)
create policy "Public trades are viewable by everyone"
    on public.public_trades for select to public using (true);

-- Anyone can opt-in their own trade (client submits with their address)
create policy "Users can publish their own trades"
    on public.public_trades for insert to public with check (true);


-- ---------------------------------------------------------------------------
-- 8. ADMINS (enhanced — add role/permissions)
-- ---------------------------------------------------------------------------
alter table public.admins
    add column if not exists role text not null default 'admin',
    add column if not exists permissions jsonb not null default '{}',
    add column if not exists updated_at timestamptz not null default now();

-- Upgrade existing 'admin' rows to 'super_admin'
update public.admins set role = 'super_admin' where role = 'admin';

alter table public.admins
    add constraint admins_role_check
    check (role in ('super_admin', 'market_creator', 'resolver'));

-- Fix: lock down admin policies (replace the wide-open ones)
drop policy if exists "Anyone can add admins" on public.admins;
drop policy if exists "Admins list is viewable by everyone" on public.admins;

create policy "Admins are viewable by everyone"
    on public.admins for select to public using (true);

create policy "Only service role manages admins"
    on public.admins for insert to service_role with check (true);

create policy "Only service role updates admins"
    on public.admins for update to service_role using (true);

create policy "Only service role deletes admins"
    on public.admins for delete to service_role using (true);

create trigger update_admins_updated_at
    before update on public.admins
    for each row execute function public.update_updated_at_column();


-- ---------------------------------------------------------------------------
-- 9. FIX EXISTING MARKET POLICIES (lock down writes)
-- ---------------------------------------------------------------------------
drop policy if exists "Anyone can create markets" on public.markets;
drop policy if exists "Anyone can update markets" on public.markets;

-- Markets are readable by everyone (keep)
-- Only service_role can create/update (admin actions go through API)
create policy "Service role creates markets"
    on public.markets for insert to service_role with check (true);

create policy "Service role updates markets"
    on public.markets for update to service_role using (true);


-- ---------------------------------------------------------------------------
-- 10. HELPER VIEWS
-- ---------------------------------------------------------------------------

-- Leaderboard: top public traders by P&L
create or replace view public.leaderboard as
select
    wallet_address,
    count(*) as total_trades,
    sum(case when realized_pnl > 0 then 1 else 0 end) as winning_trades,
    sum(coalesce(realized_pnl, 0)) as total_pnl,
    sum(shares * entry_price) as total_volume
from public.public_trades
group by wallet_address
order by total_pnl desc;

-- Active markets with computed fields
create or replace view public.active_markets as
select
    m.*,
    c.name as category_name,
    c.slug as category_slug,
    e.title as event_title
from public.markets m
left join public.categories c on m.category_id = c.id
left join public.events e on m.event_id = e.id
where m.status = 'open'
order by m.featured desc, m.total_volume desc;


-- ---------------------------------------------------------------------------
-- GRANTS (standard Supabase roles)
-- ---------------------------------------------------------------------------

-- categories
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;

-- events
grant select on public.events to anon, authenticated;
grant all on public.events to service_role;

-- outcomes
grant select on public.outcomes to anon, authenticated;
grant all on public.outcomes to service_role;

-- trades
grant select on public.trades to anon, authenticated;
grant insert, select on public.trades to service_role;

-- market_snapshots
grant select on public.market_snapshots to anon, authenticated;
grant insert, select on public.market_snapshots to service_role;

-- public_trades
grant select, insert on public.public_trades to anon, authenticated;
grant all on public.public_trades to service_role;

-- views
grant select on public.leaderboard to anon, authenticated;
grant select on public.active_markets to anon, authenticated;

-- sequence for market_snapshots
grant usage on sequence public.market_snapshots_id_seq to service_role;
