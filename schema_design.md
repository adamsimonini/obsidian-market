# Obsidian Market Schema v2 — Design Document

## Table Summary

| Table | Purpose | Row Count Estimate |
|-------|---------|-------------------|
| `categories` | Market grouping (Politics, Crypto, etc.) | ~10 |
| `events` | Related market bundles (e.g., "NBA Finals 2025") | ~100s |
| `markets` | Core entity — enhanced with reserves, prices, volume | ~1,000s |
| `outcomes` | Per-outcome data (binary: 2 rows per market) | 2x markets |
| `trades` | Anonymized trade log — NO user identity | ~100,000s |
| `market_snapshots` | Time-series price data for charts | ~1M+ |
| `public_trades` | Opt-in visible trades for leaderboard | ~1,000s |
| `admins` | Admin addresses with roles/permissions | ~5 |

```
categories ──< events ──< markets ──< outcomes
                              │
                              ├──< trades ──< public_trades (opt-in)
                              │
                              └──< market_snapshots
```

---

## 1. Sync Strategy (On-Chain ↔ Off-Chain)

### Flow: What happens when a user places a bet

```
1. Frontend reads current reserves from Supabase (fast)
2. Frontend calls place_bet_cpmm() on Aleo (private transition)
3. Aleo validates reserves match, updates on-chain state
4. On success, frontend calls POST /api/trades with:
     { market_id, side, shares, amount, reserves_after, tx_hash }
5. API route (server-side, service_role) inserts into trades table
6. DB triggers automatically:
     a. update_market_on_trade → updates markets.yes_reserves, no_reserves, volume, count
     b. update_market_prices_trigger → recalculates yes_price, no_price from reserves
     c. capture_market_snapshot → inserts time-series row for charts
```

### Three sync mechanisms

1. **Primary: Client-side post-trade sync.** After a successful Aleo transition, the frontend POSTs anonymized trade data to a Next.js API route. The API route uses the Supabase service_role key to insert into the `trades` table. DB triggers cascade the state updates. This is real-time and requires zero infrastructure.

2. **Secondary: Periodic reconciliation.** A cron job (Vercel Cron or Supabase pg_cron) polls the Aleo explorer API every 60 seconds for each active market's on-chain reserves. If they differ from Supabase, it overwrites the off-chain values. This catches cases where the client-side sync failed (network error, user closed browser).

3. **Tertiary: Manual admin reconciliation.** Admin dashboard has a "Sync from chain" button per market that force-fetches on-chain state and overwrites Supabase. Emergency fallback.

### Source of truth

| Data | Source of Truth | Why |
|------|----------------|-----|
| Market reserves | Aleo (on-chain) | Settlement happens on-chain |
| Market metadata | Supabase (off-chain) | Title, description, rules are off-chain only |
| Trade history | Supabase (off-chain) | On-chain BetRecords are private/invisible |
| User positions | Aleo (user's wallet) | BetRecords are private records |
| Prices | Derived from reserves | `yes_price = no_reserves / (yes + no)` |

---

## 2. Privacy Architecture

### What is stored vs. what is NOT stored

| Data Point | Stored Off-Chain? | Reasoning |
|-----------|-------------------|-----------|
| Market metadata | Yes | Public information |
| Current reserves/prices | Yes | Derived from public on-chain mappings |
| That a trade happened | Yes | Anonymized (no identity) |
| Trade size and side | Yes | Needed for volume/charts |
| WHO traded | **No** | Core privacy guarantee |
| Individual positions | **No** | Users hold private BetRecords |
| User wallet addresses | **No** (except admins, opt-in) | Only in admins table and public_trades |

### Three privacy layers

1. **On-chain privacy (Aleo).** BetRecords are private records. Only the owner can decrypt and view their positions. The blockchain reveals nothing about individual traders. Market reserves (yes/no pools) are public mappings because the AMM requires it for pricing.

2. **Off-chain anonymization (Supabase).** The `trades` table records market-level events (a trade happened, here's the new state) without any user identifier. No wallet address, no user ID, no IP address. A trade row says "10,000 shares of YES were bought on market X" but not by whom.

3. **Opt-in disclosure (public_trades).** Users who want leaderboard visibility explicitly submit their trades to `public_trades` with their wallet address. This is a conscious choice, not a default. Private by default, public by choice.

### Aggregation queries that preserve privacy

```sql
-- Market volume over time (no user data)
SELECT date_trunc('hour', created_at) as hour, sum(amount) as volume
FROM trades WHERE market_id = $1
GROUP BY hour ORDER BY hour;

-- Price history for charts (no user data)
SELECT captured_at, yes_price, no_price
FROM market_snapshots WHERE market_id = $1
ORDER BY captured_at;

-- Leaderboard (only opt-in users)
SELECT * FROM leaderboard LIMIT 50;
```

---

## 3. API Endpoints

### Market Data (public, no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/markets` | List markets (with filters: status, category, featured) |
| `GET` | `/api/markets/[id]` | Single market with outcomes |
| `GET` | `/api/markets/[id]/trades` | Trade history (anonymized) |
| `GET` | `/api/markets/[id]/chart` | Price snapshots for chart |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/leaderboard` | Top public traders |

### Trade Recording (server-side, service_role)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/trades` | Record anonymized trade after Aleo tx |

**Request body:**
```json
{
  "market_id": "uuid",
  "side": "yes",
  "shares": 5000000,
  "amount": 1000000,
  "price_before": 0.45,
  "price_after": 0.52,
  "yes_reserves_after": 120000000,
  "no_reserves_after": 80000000,
  "tx_hash": "at1..."
}
```

**Validation (server-side):**
1. Market exists and status = 'open'
2. Reserves are plausible (positive, non-zero)
3. Optional: verify tx_hash exists on Aleo explorer API
4. Insert into trades table (triggers handle the rest)

### Admin Actions (service_role, admin-gated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/admin/markets` | Create market (off-chain + on-chain) |
| `PATCH` | `/api/admin/markets/[id]/resolve` | Resolve market |
| `POST` | `/api/admin/markets/[id]/sync` | Force sync from chain |
| `POST` | `/api/admin/events` | Create event |

### User Opt-In (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/public-trades` | User publishes their trade |

---

## 4. Design Trade-Offs

### Decisions made and alternatives considered

| Decision | Alternative | Why This Way |
|----------|-------------|-------------|
| **Client-side sync** (frontend posts trade after Aleo tx) | On-chain indexer | Aleo has no Graph/subgraph yet. Client-side is simplest. Risk: missed writes if user closes browser. Mitigated by periodic reconciliation. |
| **Anonymized trades table** (no user_id) | No trades table at all | Need volume/charts for UI. Storing anonymized data preserves privacy while enabling features. |
| **CPMM pricing** (constant product) | CLOB (order book) | CPMM is simpler, works without off-chain matching engine. Lower capital efficiency but sufficient for MVP volume. |
| **Binary outcomes only** (yes/no) | Multi-outcome from day 1 | Binary covers 90% of prediction markets. Schema is ready for multi-outcome (outcomes table), but code complexity deferred. |
| **Manual admin resolution** | UMA oracle / multi-sig | Simplest for MVP. Oracle integration is designed-for (resolution fields exist) but not built. Risk: admin trust assumption. |
| **Supabase RLS** for access control | Custom auth middleware | Supabase RLS is battle-tested, works at DB level. Service_role bypasses RLS for admin operations. |
| **Snapshot-per-trade** for charts | Periodic cron snapshots | More granular data. At high volume, could switch to periodic (every 5 min) to reduce row count. |
| **Fee stored per market** (fee_bps) | Global fee config | Allows per-market fee experiments. 200 bps (2%) default. |

### Future expansion path

1. **Multi-outcome markets:** Add outcomes with index > 1. Frontend renders outcome cards instead of yes/no. CPMM extends to LMSR (Logarithmic Market Scoring Rule) for 3+ outcomes.

2. **Oracle integration:** Add `oracle_requests` table. Resolution flow becomes: admin proposes → dispute window → finalize. Fields already exist: `resolution_outcome`, `resolved_at`.

3. **On-chain settlement (claim_winnings):** Add `settlements` table. Build `claim_winnings` Leo transition that burns BetRecords and pays out. Off-chain records the payout for audit.

4. **Order book hybrid:** At scale, add `orders` table for limit orders. CPMM provides baseline liquidity, CLOB allows better price discovery. Requires off-chain matching engine.

5. **User profiles:** Add `users` table (wallet_address, username, avatar). FK from public_trades. Enables social features without compromising trade privacy.

---

## 5. Open Questions

1. **Should the `POST /api/trades` endpoint verify the Aleo transaction on-chain before recording?** This adds latency (~5-15s for Aleo confirmation) but prevents spoofed trades. A compromise: record immediately with `verified: false`, verify async, flag if mismatch.

2. **How aggressive should snapshot pruning be?** At 100 trades/day/market with 100 markets, that's 10K snapshots/day (3.6M/year). Options: keep all (cheap on Supabase), downsample old data (5-min candles after 30 days), or archive to cold storage.

3. **Should `yes_odds` / `no_odds` (existing columns) be dropped or repurposed?** They represent the initial odds set at market creation. The new `yes_price` / `no_price` (derived from reserves) are the live prices. Options: drop the old columns, rename them to `initial_yes_odds` / `initial_no_odds`, or keep both and accept the ambiguity.
