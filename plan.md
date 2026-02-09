# Implementation Plan: V2 Frontend + Admin API

## Phase 1: TypeScript Types
**File:** `frontend/src/types/supabase.ts`
- Add types: `AdminRole`, `MarketType`, `Category`, `Event`, `Outcome`, `Trade`, `MarketSnapshot`, `PublicTrade`
- Update `Market` interface: add all v2 columns (reserves, prices, volume, category_id, event_id, slug, featured, fee_bps, etc.) while keeping existing v1 columns
- Update `Admin` interface: add `role`, `permissions`, `updated_at`
- Update `Database` interface with all table definitions

## Phase 2: Server-side Supabase Client
**File:** `frontend/src/lib/supabase-server.ts` (new)
- Creates Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (not NEXT_PUBLIC_)
- Used by API routes only — bypasses RLS for admin writes
- Env var: `SUPABASE_SERVICE_ROLE_KEY` (must be added to Vercel + .env.local)

## Phase 3: API Routes

### Admin auth helper
**File:** `frontend/src/lib/admin-auth.ts` (new)
- `verifyAdmin(walletAddress, requiredRole?)` — queries admins table, checks role
- Role hierarchy: super_admin > market_creator/resolver
- Returns `{ authorized, admin, error }`
- NOTE: MVP uses wallet address only (no signature verification). TODO for production.

### Routes:

**`POST /api/trades`** — Record anonymized trade
- Body: `{ market_id, side, shares, amount, price_before, price_after, yes_reserves_after, no_reserves_after, tx_hash? }`
- No admin required — called after successful Aleo tx
- Validates market exists and is open
- Inserts via service_role (RLS blocks anon inserts)

**`GET /api/admin/admins`** — List admins
- Query param: `wallet_address` (for auth)
- Requires: super_admin
- Returns all admins with roles

**`POST /api/admin/admins`** — Add admin
- Body: `{ wallet_address, target_address, role }`
- Requires: super_admin
- Prevents duplicate entries

**`DELETE /api/admin/admins/[address]`** — Remove admin
- Query param: `wallet_address` (for auth)
- Requires: super_admin
- Cannot remove yourself

**`POST /api/admin/markets`** — Create market
- Body: market fields (title, description, category_id, resolution_rules, etc.)
- Requires: super_admin or market_creator
- Auto-generates slug from title
- Creates default Yes/No outcomes

**`PATCH /api/admin/markets/[id]/resolve`** — Resolve market
- Body: `{ wallet_address, resolution_outcome }` ('yes'|'no'|'invalid')
- Requires: super_admin or resolver
- Updates market status to 'resolved', sets resolution_outcome and resolved_at
- Updates outcome resolution_values (1.0 for winner, 0.0 for loser)

## Phase 4: Update Hooks

### useAdmin hook update
- Return `{ isAdmin, role, loading, error }` instead of just `{ isAdmin }`
- Fetch the full admin row including role

### useMarkets hook update
- Fetch v2 columns (yes_price, no_price, total_volume, trade_count, liquidity, category_id, featured, slug)
- Add optional `categoryId` filter parameter
- Keep real-time subscription

### New hook: useCategories
**File:** `frontend/src/hooks/useCategories.ts` (new)
- Fetches categories from Supabase
- Returns `{ categories, loading }`
- Simple one-time fetch (categories rarely change)

## Phase 5: Frontend Components

### MarketCard update
- Show `yes_price`/`no_price` as probability percentages (e.g., "72% Yes") instead of odds
- Show total_volume formatted (e.g., "$12.5K")
- Show trade_count
- Show category badge
- Visual indicator for featured markets
- Remove old yes_odds/no_odds display

### MarketList update
- Add category filter tabs at top (All + each category)
- Pass categoryId to useMarkets
- Featured markets section at top (when on "All" tab)

### Home page update
- Wire up category filtering state
- Pass selected category to MarketList

### BetForm update
- Display CPMM prices instead of odds
- Show price as probability %
- Calculate estimated price impact (how price moves after trade)
- Use yes_reserves/no_reserves for calculation

### CreateMarketForm update
- Add category dropdown (fetched from categories table)
- Remove yes_odds/no_odds fields (prices derived from reserves via CPMM)
- Add initial liquidity field (sets initial reserves)
- Submit via POST /api/admin/markets instead of direct Supabase insert
- Add slug auto-generation from title

### New: AdminPanel component
**File:** `frontend/src/components/AdminPanel.tsx` (new)
- Only visible to super_admin
- Lists all admins with roles
- Add admin form: wallet address + role dropdown
- Remove admin button (with confirmation)
- Calls API routes

### Settings page update
- Add AdminPanel for super_admin users
- Keep existing placeholder for non-admin users

## Phase 6: Seed Super Admin
**File:** `backend/supabase/migrations/20260208000000_seed_super_admin.sql` (new)
- Insert user's wallet as super_admin:
  ```sql
  INSERT INTO public.admins (wallet_address, role)
  VALUES ('aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv', 'super_admin')
  ON CONFLICT (wallet_address) DO UPDATE SET role = 'super_admin';
  ```
- Push migration to remote Supabase

## File Summary

### New files (6):
1. `frontend/src/lib/supabase-server.ts`
2. `frontend/src/lib/admin-auth.ts`
3. `frontend/src/hooks/useCategories.ts`
4. `frontend/src/components/AdminPanel.tsx`
5. `frontend/src/app/api/trades/route.ts`
6. `frontend/src/app/api/admin/admins/route.ts`
7. `frontend/src/app/api/admin/admins/[address]/route.ts`
8. `frontend/src/app/api/admin/markets/route.ts`
9. `frontend/src/app/api/admin/markets/[id]/resolve/route.ts`
10. `backend/supabase/migrations/20260208000000_seed_super_admin.sql`

### Modified files (9):
1. `frontend/src/types/supabase.ts`
2. `frontend/src/hooks/useMarkets.ts`
3. `frontend/src/hooks/useAdmin.ts`
4. `frontend/src/components/MarketCard.tsx`
5. `frontend/src/components/MarketList.tsx`
6. `frontend/src/components/BetForm.tsx`
7. `frontend/src/components/CreateMarketForm.tsx`
8. `frontend/src/app/page.tsx`
9. `frontend/src/app/settings/page.tsx`
