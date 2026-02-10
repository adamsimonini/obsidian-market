-- =============================================================================
-- Obsidian Market — Full Schema with i18n
-- Privacy-preserving prediction market on Aleo
-- =============================================================================
--
-- DESIGN PRINCIPLES:
--   1. i18n-first: ALL user-facing text lives in *_translations tables.
--      Base tables hold only language-agnostic data (slugs, numbers, dates, FKs).
--   2. Private bets: Aleo BetRecords are private. Off-chain DB stores NO trader
--      identities on trades. Users track positions via their own wallet.
--   3. No drift: On-chain reserves are synced to off-chain after every trade.
--   4. Binary first, multi-outcome ready: outcomes table supports expansion.
--
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 0. HELPERS
-- ---------------------------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- 1. LANGUAGES
-- ---------------------------------------------------------------------------

create table public.languages (
    code text primary key,              -- 'en', 'es', 'fr'
    name text not null,                 -- 'English'
    native_name text not null,          -- 'English', 'Espanol', 'Francais'
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.languages enable row level security;

create policy "Languages are viewable by everyone"
    on public.languages for select to public using (true);

-- Ensure exactly one default
create unique index idx_languages_default on public.languages (is_default) where is_default = true;

insert into public.languages (code, name, native_name, is_default) values
    ('en', 'English',  'English',   true),
    ('es', 'Spanish',  'Español',   false),
    ('fr', 'French',   'Français',  false);


-- ---------------------------------------------------------------------------
-- 2. CATEGORIES
-- ---------------------------------------------------------------------------

create table public.categories (
    id uuid primary key default extensions.uuid_generate_v4(),
    slug text not null,
    display_order integer not null default 0,
    created_at timestamptz not null default now(),

    constraint categories_slug_key unique (slug)
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
    on public.categories for select to public using (true);

create policy "Service role manages categories"
    on public.categories for all to service_role using (true) with check (true);

-- Translation table
create table public.category_translations (
    id uuid primary key default extensions.uuid_generate_v4(),
    category_id uuid not null references public.categories(id) on delete cascade,
    language_code text not null references public.languages(code),
    name text not null,
    description text,

    constraint category_translations_unique unique (category_id, language_code)
);

alter table public.category_translations enable row level security;

create index idx_category_translations_category on public.category_translations(category_id);
create index idx_category_translations_lang on public.category_translations(language_code);

create policy "Category translations are viewable by everyone"
    on public.category_translations for select to public using (true);

create policy "Service role manages category translations"
    on public.category_translations for all to service_role using (true) with check (true);


-- ---------------------------------------------------------------------------
-- 3. EVENTS (grouping entity for related markets)
-- ---------------------------------------------------------------------------

create table public.events (
    id uuid primary key default extensions.uuid_generate_v4(),
    category_id uuid references public.categories(id),
    slug text not null,
    image_url text,
    start_date timestamptz,
    end_date timestamptz,
    status text not null default 'active',
    metadata jsonb default '{}',
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

-- Translation table
create table public.event_translations (
    id uuid primary key default extensions.uuid_generate_v4(),
    event_id uuid not null references public.events(id) on delete cascade,
    language_code text not null references public.languages(code),
    title text not null,
    description text,

    constraint event_translations_unique unique (event_id, language_code)
);

alter table public.event_translations enable row level security;

create index idx_event_translations_event on public.event_translations(event_id);
create index idx_event_translations_lang on public.event_translations(language_code);

create policy "Event translations are viewable by everyone"
    on public.event_translations for select to public using (true);

create policy "Service role manages event translations"
    on public.event_translations for all to service_role using (true) with check (true);


-- ---------------------------------------------------------------------------
-- 4. MARKETS
-- ---------------------------------------------------------------------------

create table public.markets (
    id uuid primary key default extensions.uuid_generate_v4(),
    event_id uuid references public.events(id),
    category_id uuid references public.categories(id),
    slug text not null,
    image_url text,
    market_type text not null default 'binary',
    resolution_deadline timestamptz not null,
    resolution_outcome text,
    resolved_at timestamptz,
    status text not null default 'open',
    creator_address text not null,
    market_id_onchain text,
    -- CPMM pricing
    yes_reserves bigint not null default 0,
    no_reserves bigint not null default 0,
    yes_price numeric(10,6) not null default 0.5,
    no_price numeric(10,6) not null default 0.5,
    -- Legacy odds (v1 compat)
    yes_odds numeric(10,2) not null default 2.0,
    no_odds numeric(10,2) not null default 2.0,
    -- Aggregates
    total_volume numeric not null default 0,
    volume_24h numeric not null default 0,
    liquidity numeric not null default 0,
    trade_count integer not null default 0,
    fee_bps integer not null default 200,
    featured boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint markets_slug_key unique (slug),
    constraint markets_onchain_key unique (market_id_onchain),
    constraint markets_status_check check (status in ('open', 'closed', 'resolved', 'cancelled')),
    constraint markets_market_type_check check (market_type in ('binary', 'categorical', 'scalar')),
    constraint markets_resolution_outcome_check check (resolution_outcome in ('yes', 'no', 'invalid')),
    constraint markets_yes_price_range check (yes_price >= 0 and yes_price <= 1),
    constraint markets_no_price_range check (no_price >= 0 and no_price <= 1),
    constraint markets_yes_odds_check check (yes_odds > 0),
    constraint markets_no_odds_check check (no_odds > 0)
);

alter table public.markets enable row level security;

create index idx_markets_status on public.markets(status);
create index idx_markets_category_id on public.markets(category_id);
create index idx_markets_event_id on public.markets(event_id);
create index idx_markets_slug on public.markets(slug);
create index idx_markets_featured on public.markets(featured) where featured = true;
create index idx_markets_volume on public.markets(total_volume desc);
create index idx_markets_created_at on public.markets(created_at desc);

create policy "Markets are viewable by everyone"
    on public.markets for select to public using (true);

create policy "Service role creates markets"
    on public.markets for insert to service_role with check (true);

create policy "Service role updates markets"
    on public.markets for update to service_role using (true);

create trigger update_markets_updated_at
    before update on public.markets
    for each row execute function public.update_updated_at_column();

-- Auto-derive prices from reserves
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

-- Translation table
create table public.market_translations (
    id uuid primary key default extensions.uuid_generate_v4(),
    market_id uuid not null references public.markets(id) on delete cascade,
    language_code text not null references public.languages(code),
    title text not null,
    description text,
    resolution_rules text not null,
    resolution_source text not null,

    constraint market_translations_unique unique (market_id, language_code)
);

alter table public.market_translations enable row level security;

create index idx_market_translations_market on public.market_translations(market_id);
create index idx_market_translations_lang on public.market_translations(language_code);

create policy "Market translations are viewable by everyone"
    on public.market_translations for select to public using (true);

create policy "Service role manages market translations"
    on public.market_translations for all to service_role using (true) with check (true);


-- ---------------------------------------------------------------------------
-- 5. OUTCOMES (binary now, multi-outcome ready)
-- ---------------------------------------------------------------------------

create table public.outcomes (
    id uuid primary key default extensions.uuid_generate_v4(),
    market_id uuid not null references public.markets(id) on delete cascade,
    index integer not null,
    outcome_type text not null default 'binary',
    price numeric(10,6) not null default 0.5,
    shares_outstanding bigint not null default 0,
    resolution_value numeric,
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

-- Translation table
create table public.outcome_translations (
    id uuid primary key default extensions.uuid_generate_v4(),
    outcome_id uuid not null references public.outcomes(id) on delete cascade,
    language_code text not null references public.languages(code),
    label text not null,

    constraint outcome_translations_unique unique (outcome_id, language_code)
);

alter table public.outcome_translations enable row level security;

create index idx_outcome_translations_outcome on public.outcome_translations(outcome_id);
create index idx_outcome_translations_lang on public.outcome_translations(language_code);

create policy "Outcome translations are viewable by everyone"
    on public.outcome_translations for select to public using (true);

create policy "Service role manages outcome translations"
    on public.outcome_translations for all to service_role using (true) with check (true);


-- ---------------------------------------------------------------------------
-- 6. TRADES (anonymized — NO user identity)
-- ---------------------------------------------------------------------------

create table public.trades (
    id uuid primary key default extensions.uuid_generate_v4(),
    market_id uuid not null references public.markets(id),
    side text not null,
    shares bigint not null,
    amount bigint not null,
    price_before numeric(10,6) not null,
    price_after numeric(10,6) not null,
    yes_reserves_after bigint not null,
    no_reserves_after bigint not null,
    tx_hash text,
    created_at timestamptz not null default now(),

    constraint trades_side_check check (side in ('yes', 'no')),
    constraint trades_shares_positive check (shares > 0),
    constraint trades_amount_positive check (amount > 0)
);

alter table public.trades enable row level security;

create index idx_trades_market_id on public.trades(market_id);
create index idx_trades_created_at on public.trades(created_at desc);
create index idx_trades_market_time on public.trades(market_id, created_at desc);

create policy "Trades are viewable by everyone"
    on public.trades for select to public using (true);

create policy "Service role inserts trades"
    on public.trades for insert to service_role with check (true);

-- Update market aggregates on trade
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
-- 7. MARKET SNAPSHOTS (time-series for price charts)
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
-- 8. PUBLIC TRADES (opt-in leaderboard / social)
-- ---------------------------------------------------------------------------

create table public.public_trades (
    id uuid primary key default extensions.uuid_generate_v4(),
    trade_id uuid references public.trades(id),
    wallet_address text not null,
    market_id uuid not null references public.markets(id),
    side text not null,
    shares bigint not null,
    entry_price numeric(10,6) not null,
    realized_pnl numeric,
    created_at timestamptz not null default now(),

    constraint public_trades_side_check check (side in ('yes', 'no'))
);

alter table public.public_trades enable row level security;

create index idx_public_trades_wallet on public.public_trades(wallet_address);
create index idx_public_trades_market on public.public_trades(market_id);
create index idx_public_trades_pnl on public.public_trades(realized_pnl desc nulls last);

create policy "Public trades are viewable by everyone"
    on public.public_trades for select to public using (true);

create policy "Users can publish their own trades"
    on public.public_trades for insert to public with check (true);


-- ---------------------------------------------------------------------------
-- 9. ADMINS
-- ---------------------------------------------------------------------------

create table public.admins (
    wallet_address text primary key,
    role text not null default 'super_admin',
    permissions jsonb not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint admins_role_check check (role in ('super_admin', 'market_creator', 'resolver'))
);

alter table public.admins enable row level security;

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
-- 10. VIEWS
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

-- Active markets with category (locale-agnostic base view)
create or replace view public.active_markets as
select
    m.*,
    e.slug as event_slug
from public.markets m
left join public.events e on m.event_id = e.id
where m.status = 'open'
order by m.featured desc, m.total_volume desc;


-- ---------------------------------------------------------------------------
-- 11. GRANTS
-- ---------------------------------------------------------------------------

-- languages
grant select on public.languages to anon, authenticated;

-- categories + translations
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
grant select on public.category_translations to anon, authenticated;
grant all on public.category_translations to service_role;

-- events + translations
grant select on public.events to anon, authenticated;
grant all on public.events to service_role;
grant select on public.event_translations to anon, authenticated;
grant all on public.event_translations to service_role;

-- markets + translations
grant select on public.markets to anon, authenticated;
grant insert, update, select on public.markets to service_role;
grant select on public.market_translations to anon, authenticated;
grant all on public.market_translations to service_role;

-- outcomes + translations
grant select on public.outcomes to anon, authenticated;
grant all on public.outcomes to service_role;
grant select on public.outcome_translations to anon, authenticated;
grant all on public.outcome_translations to service_role;

-- trades
grant select on public.trades to anon, authenticated;
grant insert, select on public.trades to service_role;

-- market_snapshots
grant select on public.market_snapshots to anon, authenticated;
grant insert, select on public.market_snapshots to service_role;
grant usage on sequence public.market_snapshots_id_seq to service_role;

-- public_trades
grant select, insert on public.public_trades to anon, authenticated;
grant all on public.public_trades to service_role;

-- views
grant select on public.leaderboard to anon, authenticated;
grant select on public.active_markets to anon, authenticated;
