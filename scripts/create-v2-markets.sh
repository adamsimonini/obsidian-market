#!/bin/bash

# Script to recreate all 20 markets on obsidian_market_v2.aleo
#
# This fetches the reserve amounts from the old program (obsidian_market.aleo)
# and creates identical markets on the new program with u128 types.

set -e

ALEO_DIR="../aleo"
OLD_PROGRAM="obsidian_market.aleo"
NEW_PROGRAM="obsidian_market_v2.aleo"
API_BASE="https://api.explorer.provable.com/v1/testnet"

echo "🚀 Creating markets on $NEW_PROGRAM"
echo ""

# Check we're in the right directory
if [ ! -d "$ALEO_DIR" ]; then
  echo "❌ Error: aleo/ directory not found. Run this from the project root."
  exit 1
fi

# Fetch and create each market
for i in {1..20}; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Market $i"

  # Fetch old market data
  response=$(curl -s "$API_BASE/program/$OLD_PROGRAM/mapping/markets/${i}u64")

  # Extract reserves using grep and sed
  yes_reserves=$(echo "$response" | grep -o 'yes_reserves: [0-9]*u64' | grep -o '[0-9]*')
  no_reserves=$(echo "$response" | grep -o 'no_reserves: [0-9]*u64' | grep -o '[0-9]*')

  if [ -z "$yes_reserves" ] || [ -z "$no_reserves" ]; then
    echo "⚠️  Could not fetch market $i from old program (might not exist)"
    continue
  fi

  echo "   Old reserves: YES=$yes_reserves, NO=$no_reserves"
  echo "   Creating on v2..."

  # Create market on new program (using u128)
  cd "$ALEO_DIR"
  leo execute create_market "${i}u64" "${yes_reserves}u128" "${no_reserves}u128" --broadcast --yes

  # Wait a bit to avoid rate limiting
  sleep 2

  echo "   ✅ Market $i created"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ All markets created!"
echo ""
echo "Next steps:"
echo "1. Verify markets on explorer: https://testnet.explorer.provable.com/program/$NEW_PROGRAM"
echo "2. Check your dev page to see the markets"
echo "3. Update Supabase if needed (see migrate-to-v2.md)"
