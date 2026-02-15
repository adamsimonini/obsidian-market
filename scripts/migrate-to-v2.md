# Migration Guide: obsidian_market.aleo → obsidian_market_v2.aleo

## Overview

You've deployed `obsidian_market_v2.aleo` as a fresh program. Now you need to:
1. Recreate the 20 markets on the new program
2. Update Supabase to point to the new market IDs

## Step 1: Extract Current Market Data

Get the initial reserves from the OLD program (obsidian_market.aleo):

```bash
# Create a CSV of market IDs and their initial reserves
for i in {1..20}; do
  echo -n "$i,"
  curl -s "https://api.explorer.provable.com/v1/testnet/program/obsidian_market.aleo/mapping/markets/${i}u64" \
    | jq -r '. | match("yes_reserves: ([0-9]+)u64.*no_reserves: ([0-9]+)u64") | "\(.captures[0].string),\(.captures[1].string)"'
done > /tmp/old_markets.csv
```

## Step 2: Create Markets on V2 Program

For each market, run:

```bash
cd aleo

# Example for market 1 (50M yes, 50M no reserves - equal pricing at 50%)
leo execute create_market 1u64 50000000u128 50000000u128 --broadcast --yes

# Example for market 2 (41M yes, 58.5M no - yes at ~59%, no at ~41%)
leo execute create_market 2u64 41000000u128 58536585u128 --broadcast --yes

# Continue for all 20 markets...
```

**IMPORTANT Notes:**
- Market IDs must be sequential: 1, 2, 3, ... 20
- Reserves are now `u128` (add `u128` suffix, not `u64`)
- Initial reserves determine starting prices: `yes_price = no_reserves / (yes_reserves + no_reserves)`
- Each deployment costs credits (~fee per transaction)

## Step 3: Supabase Migration Options

### Option A: Update Existing Rows (Recommended if data is good)

Keep your existing Supabase data, just update references:

```sql
-- No changes needed to market_id_onchain!
-- If your Supabase rows are 1-20 and they match the on-chain IDs 1-20,
-- the market_id_onchain field will still be correct.

-- Just verify the mapping is correct:
SELECT slug, market_id_onchain, yes_reserves, no_reserves
FROM markets
ORDER BY market_id_onchain;
```

### Option B: Fresh Start (Recommended if you want to clean up)

```sql
-- Backup first (export to CSV from Supabase dashboard)

-- Reset the table
TRUNCATE markets CASCADE;

-- Re-insert your 20 markets with metadata
-- (You'll need to do this manually or via a script)
```

## Step 4: Update Frontend Constants

Update anywhere that references the old program name:

```bash
# Search for references to old program
grep -r "obsidian_market.aleo" frontend/src --exclude-dir=node_modules
```

**Files to update:**
- ✅ `frontend/src/app/[locale]/dev/onchain/page.tsx` - Already updated to `obsidian_market_v2.aleo`
- Check any other components that might reference the program name
- Update API calls, constants, etc.

## Step 5: Handle USDCx Integration

Since v2 uses USDCx, you'll need to:

1. **Approve USDCx spending** (for users placing bets):
```bash
# Users must approve the v2 program to spend their USDCx
# This is done via test_usdcx_stablecoin.aleo/approve transition
```

2. **Fund treasury with USDCx** (for payouts):
```bash
# The treasury (admin wallet) needs USDCx to pay out winners
# Transfer USDCx to your admin address
```

3. **Approve v2 program as spender**:
```bash
# Admin must approve obsidian_market_v2.aleo to transfer USDCx from treasury
# This allows claim_winnings and claim_refund to work
```

## Decision Matrix

### Keep Existing Supabase Data If:
- ✅ Your 20 markets have good metadata (titles, descriptions, etc.)
- ✅ The market order matches (Supabase row 1 = on-chain market 1)
- ✅ You want to preserve slugs and URLs

### Reset Supabase If:
- ❌ Market metadata needs cleanup
- ❌ You want to reorganize market order
- ❌ Test data is messy

## Quick Start Commands

```bash
# 1. Navigate to aleo directory
cd aleo

# 2. Create first market (50/50 split)
leo execute create_market 1u64 50000000u128 50000000u128 --broadcast --yes

# 3. Verify it was created
curl https://api.explorer.provable.com/v1/testnet/program/obsidian_market_v2.aleo/mapping/markets/1u64

# 4. Check your dev page
# Visit http://localhost:3000/en/dev/onchain (or your Vercel URL)
```

## Notes

- **Old markets are NOT deleted** - they still exist on `obsidian_market.aleo`
- **Old BetRecords are NOT migrated** - users with old bets can't use them on v2
- **This is a clean break** - v2 is a fresh start
- **Consider gas costs** - 20 market creations = 20 transactions = fees
