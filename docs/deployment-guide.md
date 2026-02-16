# Deployment & Migration Guide

This guide explains the **critical order of operations** when deploying or updating Obsidian Market's smart contract and database.

## Table of Contents

- [Overview: Data Flow Architecture](#overview-data-flow-architecture)
- [Why Order Matters](#why-order-matters)
- [Deployment Steps](#deployment-steps)
- [Migration Guide: v1 → v2](#migration-guide-v1--v2)
- [Troubleshooting](#troubleshooting)

---

## Overview: Data Flow Architecture

Obsidian Market uses a **one-directional flow** from database to blockchain:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Supabase DB   │ ───> │  seed-markets.sh │ ───> │  Aleo Testnet   │
│                 │      │                  │      │                 │
│ • Market slugs  │      │ 1. Read DB rows  │      │ • Market state  │
│ • Metadata      │      │ 2. Create on-ch. │      │ • Reserves      │
│ • Reserves      │      │ 3. Link back     │      │ • Status        │
│ • NULL on-ch ID │      │                  │      │ • Winning side  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
    ↑                                                       │
    │                                                       │
    └───────────────────────────────────────────────────────┘
                  Updates market_id_onchain field
```

### Key Principles

1. **Database is the Source of Truth** for market metadata (titles, descriptions, slugs, categories)
2. **Blockchain is the Source of Truth** for market state (reserves, status, positions)
3. **The Link is One-Directional**: Database → Blockchain (not bidirectional)
4. **Seeds Don't Insert**: The `seed-markets.sh` script **updates** existing DB rows, it doesn't create new ones

---

## Why Order Matters

### The Critical Dependency Chain

```
Step 1: Database Seed
  ↓
  Creates market rows with slugs like "btc-150k-2026"
  Sets market_id_onchain = NULL (not yet linked)
  ↓
Step 2: Blockchain Seed
  ↓
  Looks up DB rows by slug ("btc-150k-2026")
  ↓
  Creates on-chain market with ID 1
  ↓
  Updates DB row: market_id_onchain = "1"
```

**If you run Step 2 before Step 1:**
- ❌ Script can't find DB rows (no slugs exist yet)
- ❌ PATCH request fails: `?slug=eq.btc-150k-2026` returns 0 rows
- ❌ On-chain markets created but orphaned (not linked to DB)

**If you create on-chain markets manually:**
- ⚠️ Market IDs must match the expected order in `SEED_MARKETS` array
- ⚠️ If you create market 5 before market 1, the linking will fail
- ⚠️ Script expects sequential IDs: 1, 2, 3, ... 20

---

## Deployment Steps

### Fresh Deployment (New Database + New Contract)

#### 1. Deploy Smart Contract

```bash
cd aleo

# Ensure program name is correct in src/main.leo
# program obsidian_market_v2.aleo {

# Build and deploy
leo build
leo deploy --broadcast --yes

# Verify deployment
curl https://api.explorer.provable.com/v1/testnet/program/obsidian_market_v2.aleo
```

**Expected output:**
```
✅ Compiled 'obsidian_market_v2.aleo' into Aleo instructions.
✅ Deployed 'obsidian_market_v2.aleo' to testnet
```

**Record the transaction ID** for reference.

#### 2. Seed Database (Creates Supabase Rows)

```bash
# From project root

# For local Supabase
npm run db:reset:local

# For remote Supabase (production)
npm run db:reset:remote
```

**What this does:**
- Runs all migrations (`backend/supabase/migrations/*.sql`)
- Runs seed script (`backend/supabase/seed.sql`)
- Creates 20 market rows with:
  - ✅ slugs (e.g., "btc-150k-2026")
  - ✅ metadata (titles, descriptions, categories)
  - ✅ initial reserves (e.g., 35M yes, 65M no)
  - ❌ `market_id_onchain` = NULL (not yet linked)

**Verify:**
```bash
# Check Supabase has 20 markets with NULL on-chain IDs
# Visit: http://localhost:54323 (local) or Supabase dashboard (remote)
# Table: markets
# Expected: 20 rows, market_id_onchain = NULL for all
```

#### 3. Create On-Chain Markets & Link to Database

```bash
# Ensure aleo/.env has correct config
# NETWORK=testnet
# ENDPOINT=https://api.explorer.provable.com/v1
# PRIVATE_KEY=APrivateKey1zkp...

# For local Supabase
npm run seed-aleo

# For remote Supabase
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_KEY=eyJhbG... \
npm run seed-aleo
```

**What this does (for each of 20 markets):**

1. **Check DB**: "Does `btc-150k-2026` already have `market_id_onchain` set?"
   - If yes → Skip (already linked)
   - If no → Continue

2. **Check blockchain**: "Does market ID 1 exist on-chain?"
   - If yes → Fetch reserves and link to DB
   - If no → Create it

3. **Create on-chain**:
   ```bash
   leo execute create_market 1u64 35000000u128 65000000u128 --broadcast --yes
   ```

4. **Wait for confirmation** (~10-30 seconds)

5. **Update DB**:
   ```sql
   UPDATE markets
   SET market_id_onchain = '1', yes_reserves = 35000000, no_reserves = 65000000
   WHERE slug = 'btc-150k-2026'
   ```

6. **Repeat** for markets 2-20

**Expected output:**
```bash
========================================
 Obsidian Market — Seed Markets Script
========================================

Aleo endpoint : https://api.explorer.provable.com/v1
Aleo network  : testnet
Supabase URL  : http://127.0.0.1:54321
Program       : obsidian_market_v2.aleo
Markets to seed: 20

--- btc-150k-2026 (on-chain ID: 1) ---
  Creating on-chain market 1...
  On-chain transaction submitted.
  Fetched on-chain reserves: 35000000 / 65000000
  Linking Supabase: btc-150k-2026 -> market_id_onchain=1
  Supabase updated (HTTP 200).

--- eth-10k-2026 (on-chain ID: 2) ---
  Creating on-chain market 2...
  ...

========================================
 ✅ Seeding complete!
========================================

Summary:
  Created on-chain:  20
  Linked in Supabase: 20
  Skipped (already linked): 0
```

#### 4. Verify Complete Setup

```bash
# Check dev page (local)
open http://localhost:3000/en/dev/onchain

# Check dev page (production)
open https://obsidian-market.vercel.app/en/dev/onchain
```

**Expected:**
- ✅ "Found **20** market(s)"
- ✅ All markets show status "Open" (green)
- ✅ All markets have DB Slug linked (green)
- ✅ Reserves match between on-chain and Supabase

---

## Migration Guide: v1 → v2

This section covers migrating from `obsidian_market.aleo` (v1) to `obsidian_market_v2.aleo`.

### Why You Can't Upgrade In-Place

Aleo's upgrade rules **prohibit**:
- ❌ Changing struct field types (e.g., `u64` → `u128`)
- ❌ Adding fields to existing structs (e.g., adding `winning_side`)
- ❌ Modifying record field types

See: [Aleo Program Upgradability Docs](https://developer.aleo.org/guides/program_upgradability/)

**Error you'll see if you try:**
```
Error [ECLI0377042]: Cannot upgrade 'obsidian_market.aleo'
because the struct 'Market' does not match
```

### Migration Steps

When deploying a new contract version, you must update **every reference** to the program name across the entire codebase. Missing even one will cause silent failures (e.g., the frontend querying a program that has no markets).

#### 1. Update All Program Name References

There are **5 files** that reference the program name. All must be updated together.

**Smart contract (2 files):**

```leo
// aleo/src/main.leo — Line 3
program obsidian_market_v2.aleo {
```

```json
// aleo/program.json — "program" field
{
  "program": "obsidian_market_v2.aleo",
  ...
}
```

**Frontend (3 files):**

```typescript
// frontend/src/lib/aleo.ts — Line 11
// THIS IS THE CRITICAL ONE — used by fetchOnchainReserves() and buildPlaceBetTransaction()
// If this is wrong, users see "Could not fetch on-chain market data" when placing bets
export const PROGRAM_ID = 'obsidian_market_v2.aleo';
```

```typescript
// frontend/src/contexts/WalletContext.tsx — Line 177
// Tells the wallet adapter which programs this app interacts with
programs={['obsidian_market_v2.aleo', 'test_usdcx_stablecoin.aleo', 'credits.aleo']}
```

```typescript
// frontend/src/app/[locale]/dev/onchain/page.tsx — Line 17
// Dev page that queries on-chain markets for debugging
const PROGRAM = 'obsidian_market_v2.aleo';
```

**Seed script (1 file):**

```bash
# scripts/seed-markets.sh — Line 38
PROGRAM="obsidian_market_v2.aleo"
```

**Quick find command to verify all references:**
```bash
grep -rn "obsidian_market" frontend/src/ scripts/ aleo/src/ aleo/program.json \
  --include="*.ts" --include="*.tsx" --include="*.leo" --include="*.json" --include="*.sh" \
  | grep -v node_modules | grep -v ".next"
```

#### 2. Deploy New Contract

```bash
cd aleo
leo build
leo deploy --broadcast --yes
```

**Note:** This creates a **separate program** on testnet. The old program remains deployed with its markets intact but is no longer used.

#### 3. Seed Database & Create On-Chain Markets

**Option A: Fresh database reset** (recommended for clean migrations)

```bash
npm run db:reset:local    # or db:reset:remote for production
npm run seed-aleo
```

**Option B: Keep existing data, just re-link**

If your Supabase data is good and you only want to re-link to the new program:

```sql
-- Run in Supabase SQL Editor
UPDATE markets SET market_id_onchain = NULL;
```

Then:
```bash
npm run seed-aleo
```

The seed script is idempotent — it detects markets that already exist on-chain and just links them without re-creating.

#### 4. Redeploy Frontend

The frontend must be redeployed so the new `PROGRAM_ID` takes effect:

```bash
# Local — just restart dev server
# Production — push to Vercel
cd frontend
vercel --prod
# or: git push (if Vercel auto-deploys from git)
```

#### 5. Verify Everything Works

```bash
# 1. Check dev page shows markets from the NEW program
open http://localhost:3000/en/dev/onchain

# 2. Verify API returns data for new program
curl https://api.explorer.provable.com/v1/testnet/program/obsidian_market_v2.aleo/mapping/markets/1u64

# 3. Try placing a bet in the UI — should NOT show "Could not fetch on-chain market data"
```

### Complete Checklist

Use this checklist every time you deploy a new contract version:

- [ ] Update program name in `aleo/src/main.leo`
- [ ] Update program name in `aleo/program.json`
- [ ] Update `PROGRAM_ID` in `frontend/src/lib/aleo.ts`
- [ ] Update `programs` array in `frontend/src/contexts/WalletContext.tsx`
- [ ] Update `PROGRAM` constant in `frontend/src/app/[locale]/dev/onchain/page.tsx`
- [ ] Update `PROGRAM` variable in `scripts/seed-markets.sh`
- [ ] Run `leo build` to verify contract compiles
- [ ] Run `leo deploy --broadcast --yes`
- [ ] Run `npm run db:reset:local` (or reset remote)
- [ ] Run `npm run seed-aleo`
- [ ] Verify dev page shows all markets with correct status
- [ ] Verify placing a bet works (no "Could not fetch" error)
- [ ] Redeploy frontend to Vercel
- [ ] Update `CLAUDE.md` and `README.md` with new program name

---

## Troubleshooting

### "Supabase PATCH returned HTTP 404"

**Cause:** The database row doesn't exist yet.

**Solution:**
```bash
# Reset database first
npm run db:reset:local

# Then seed markets
npm run seed-aleo
```

---

### "Market already exists on-chain but not linked in DB"

**Cause:** You manually created on-chain markets before running the seed script.

**Solution:**
1. Check which markets exist on-chain:
   ```bash
   for i in {1..20}; do
     curl -s "https://api.explorer.provable.com/v1/testnet/program/obsidian_market_v2.aleo/mapping/markets/${i}u64"
   done
   ```

2. Run seed script again (it will detect existing markets and just link them):
   ```bash
   npm run seed-aleo
   ```

---

### "On-chain market ID doesn't match expected ID"

**Cause:** Markets were created out of order.

**Example:**
- You created market 5 first (on-chain ID = 1)
- Seed script expects market 1 to have on-chain ID = 1

**Solution:**

**Option 1 - Reset (if no real data):**
```bash
# Deploy fresh contract with different name
# program obsidian_market_v3.aleo

leo deploy --broadcast --yes
npm run db:reset:local
npm run seed-aleo
```

**Option 2 - Manual linking (if data exists):**

Edit `scripts/seed-markets.sh` to map slugs to actual on-chain IDs:

```bash
# Instead of assuming market 1 = slug "btc-150k-2026"
# Check what ID "btc-150k-2026" actually got and link manually
```

---

### "Script says 'Already linked' but dev page shows NULL"

**Cause:** Database cache or stale data.

**Solution:**
1. Check database directly:
   ```sql
   SELECT slug, market_id_onchain FROM markets ORDER BY slug;
   ```

2. If NULL in DB, the script check is wrong. Debug:
   ```bash
   # Add debug output to seed-markets.sh check_supabase_linked function
   ```

3. If not NULL in DB but dev page shows NULL:
   - Clear Next.js cache: `rm -rf frontend/.next`
   - Restart dev server

---

### "Leo deploy fails: Program already exists"

**Cause:** You're trying to deploy `obsidian_market_v2.aleo` but it's already deployed.

**Solution:**

**To upgrade existing program** (if changes are compatible):
```bash
leo deploy --broadcast --yes
# This will attempt upgrade, might fail if structs changed
```

**To deploy fresh version:**
```bash
# Change program name in src/main.leo
program obsidian_market_v3.aleo {

# Update program.json
"program": "obsidian_market_v3.aleo"

# Deploy
leo deploy --broadcast --yes
```

---

### "Seed script creates 20 markets but only 15 are linked"

**Cause:** Transaction failures or network issues during on-chain creation.

**Solution:**

1. Check which markets failed:
   ```bash
   # In Supabase, check which have NULL market_id_onchain
   SELECT slug FROM markets WHERE market_id_onchain IS NULL;
   ```

2. Re-run seed script (it's idempotent):
   ```bash
   npm run seed-aleo
   # Will skip already-linked markets and retry failed ones
   ```

3. If specific markets consistently fail:
   - Check Aleo testnet status
   - Check transaction fees (ensure wallet has credits)
   - Check transaction logs: https://testnet.explorer.provable.com/

---

## Best Practices

### 1. Always Test Locally First

```bash
# Local flow
npm run db:reset:local
npm run seed-aleo
# Visit http://localhost:3000/en/dev/onchain
```

Once verified locally, deploy to production.

### 2. Keep Environments in Sync

**Local:**
- Supabase: http://127.0.0.1:54321
- Network: `testnet` (from aleo/.env)
- Program: `obsidian_market_v2.aleo`

**Production:**
- Supabase: https://your-project.supabase.co
- Network: `testnet` (from aleo/.env)
- Program: `obsidian_market_v2.aleo` (same!)

Both environments point to the **same Aleo testnet program**. The difference is only the Supabase instance.

### 3. Version Your Programs

Use semantic versioning in program names:
- `obsidian_market.aleo` → v1
- `obsidian_market_v2.aleo` → v2
- `obsidian_market_v3.aleo` → v3

This makes rollbacks and migrations clearer.

### 4. Document Every Deployment

Keep a `CHANGELOG.md` or deployment log:

```markdown
## 2026-02-15 - obsidian_market_v2.aleo

- Deployed to testnet
- Transaction: at1hl20gxvc2dawh8m2...
- Changes: u64 → u128 reserves, added winning_side, USDCx integration
- Migrated 20 markets from v1
- Supabase: Updated market_id_onchain for all 20 markets
```

---

## Quick Reference

### Commands Summary

```bash
# Database operations
npm run db:reset:local          # Reset local Supabase DB
npm run db:reset:remote         # Reset remote Supabase DB

# Blockchain operations
cd aleo && leo deploy --broadcast --yes  # Deploy contract
npm run seed-aleo                        # Create markets + link DB

# Verification
open http://localhost:3000/en/dev/onchain  # Local dev page
```

### Order of Operations

1. ✅ Deploy smart contract
2. ✅ Reset database (creates rows with NULL on-chain IDs)
3. ✅ Run seed script (creates on-chain markets + links DB)
4. ✅ Verify on dev page

**Never:**
- ❌ Create on-chain markets before database rows exist
- ❌ Manually set market_id_onchain (let seed script do it)
- ❌ Skip database reset when starting fresh

---

## Additional Resources

- [Aleo Program Upgradability](https://developer.aleo.org/guides/program_upgradability/)
- [Leo Language Docs](https://docs.leo-lang.org/)
- [Obsidian Market Testnet Explorer](https://testnet.explorer.provable.com/program/obsidian_market_v2.aleo)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)

---

## Support

If you encounter issues not covered here:

1. Check the [GitHub Issues](https://github.com/adamsimonini/obsidian-market/issues)
2. Review script logs: `./scripts/seed-markets.sh > seed.log 2>&1`
3. Check Aleo testnet status: https://testnet.explorer.provable.com/
4. Verify Supabase is running: `supabase status`
