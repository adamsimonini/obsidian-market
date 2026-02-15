#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# scripts/seed-markets.sh
#
# Post-seed script that creates on-chain markets on Aleo and links them back
# to Supabase by setting market_id_onchain + syncing reserves.
#
# Usage:
#   ./scripts/seed-markets.sh          # Uses aleo/.env config as-is
#   SUPABASE_URL=... ./scripts/seed-markets.sh  # Override Supabase URL
#
# The script reads NETWORK / ENDPOINT / PRIVATE_KEY from aleo/.env.
# To switch between local devnet and testnet, edit aleo/.env.
#
# Idempotent: skips markets already linked in Supabase or already on-chain.
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ALEO_DIR="$PROJECT_ROOT/aleo"

# ── Load Aleo environment ──────────────────────────────────────────────────
if [[ ! -f "$ALEO_DIR/.env" ]]; then
  echo "ERROR: aleo/.env not found. Cannot determine network config."
  exit 1
fi
# shellcheck disable=SC1091
source "$ALEO_DIR/.env"

ALEO_ENDPOINT="${ENDPOINT:?ENDPOINT not set in aleo/.env}"
ALEO_NETWORK="${NETWORK:?NETWORK not set in aleo/.env}"

# ── Supabase config (defaults to local Supabase) ──────────────────────────
SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU}"

PROGRAM="obsidian_market_v2.aleo"

# ── Markets to seed on-chain ───────────────────────────────────────────────
# Format: market_id|slug|yes_reserves|no_reserves
#
# All 20 markets from seed.sql are created on-chain.
SEED_MARKETS=(
  # CRYPTO (4)
  "1|btc-150k-2026|35000000|65000000"
  "2|eth-10k-2026|60000000|40000000"
  "3|stablecoin-depeg-2026|75000000|25000000"
  "4|aleo-tvl-500m-2027|70000000|30000000"

  # POLITICS (4)
  "5|us-crypto-regulation-2027|45000000|55000000"
  "6|third-party-5pct-2028|75000000|25000000"
  "7|eu-digital-euro-2027|70000000|30000000"
  "8|fed-rate-cut-2026|40000000|60000000"

  # TECHNOLOGY (4)
  "9|apple-ar-glasses-2026|80000000|20000000"
  "10|openai-gpt5-2026|40000000|60000000"
  "11|robotaxi-10-cities-2026|65000000|35000000"
  "12|ai-chip-revenue-200b-2026|30000000|70000000"

  # SPORTS (3)
  "13|real-madrid-ucl-2026|75000000|25000000"
  "14|usa-most-golds-2028|40000000|60000000"
  "15|sub-2hr-marathon-2028|85000000|15000000"

  # SCIENCE (3)
  "16|room-temp-superconductor-2027|90000000|10000000"
  "17|starship-orbital-2026|25000000|75000000"
  "18|crispr-common-disease-2027|60000000|40000000"

  # CULTURE (2)
  "19|ai-film-festival-2027|65000000|35000000"
  "20|box-office-50b-2026|50000000|50000000"
)

# ── Helper functions ───────────────────────────────────────────────────────

# Check if an on-chain market exists by querying the markets mapping.
# Returns 0 (true) if the market exists, 1 (false) otherwise.
check_market_exists() {
  local market_id="$1"
  local url="${ALEO_ENDPOINT}/${ALEO_NETWORK}/program/${PROGRAM}/mapping/markets/${market_id}u64"
  local body http_code

  # Capture body and HTTP status code
  body=$(curl -sf "$url" 2>/dev/null) || true
  http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null) || true

  if [[ "$http_code" == "200" && -n "$body" && "$body" != "null" ]]; then
    return 0  # exists
  else
    return 1  # does not exist
  fi
}

# Check if a Supabase market already has market_id_onchain set.
# Returns 0 if linked, 1 if not linked or not found.
check_supabase_linked() {
  local slug="$1"
  local response
  response=$(curl -s "${SUPABASE_URL}/rest/v1/markets?slug=eq.${slug}&select=market_id_onchain" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" 2>/dev/null) || true

  # Response is JSON array, e.g. [{"market_id_onchain":"1"}] or [{"market_id_onchain":null}]
  if echo "$response" | grep -q '"market_id_onchain":null'; then
    return 1  # not linked
  elif echo "$response" | grep -q '"market_id_onchain":"'; then
    return 0  # already linked
  else
    return 1  # not found or error
  fi
}

# Fetch actual on-chain reserves for a market.
# Sets ONCHAIN_YES and ONCHAIN_NO global variables.
# Returns 0 on success, 1 on failure.
fetch_onchain_reserves() {
  local market_id="$1"
  local url="${ALEO_ENDPOINT}/${ALEO_NETWORK}/program/${PROGRAM}/mapping/markets/${market_id}u64"
  local body
  body=$(curl -sf "$url" 2>/dev/null) || return 1

  if [[ -z "$body" || "$body" == "null" ]]; then
    return 1
  fi

  # Parse yes_reserves and no_reserves from the response
  # Format: "{\n  ...\n  yes_reserves: 40000000u64,\n  no_reserves: 60000000u64,\n  ...\n}"
  ONCHAIN_YES=$(echo "$body" | grep -o 'yes_reserves: [0-9]*' | grep -o '[0-9]*')
  ONCHAIN_NO=$(echo "$body" | grep -o 'no_reserves: [0-9]*' | grep -o '[0-9]*')

  if [[ -n "$ONCHAIN_YES" && -n "$ONCHAIN_NO" ]]; then
    return 0
  else
    return 1
  fi
}

# Create an on-chain market using `leo execute create_market`.
# Uses the PRIVATE_KEY / ENDPOINT / NETWORK from aleo/.env.
create_market_onchain() {
  local market_id="$1"
  local yes_reserves="$2"
  local no_reserves="$3"

  echo "  Creating on-chain market ${market_id}..."
  (
    cd "$ALEO_DIR"
    leo execute create_market \
      "${market_id}u64" \
      "${yes_reserves}u128" \
      "${no_reserves}u128" \
      --broadcast --yes
  )
  echo "  On-chain transaction submitted."
}

# Update the Supabase markets row for the given slug:
#   - Set market_id_onchain
#   - Sync yes_reserves / no_reserves to match the on-chain initial values
link_supabase() {
  local slug="$1"
  local market_id="$2"
  local yes_reserves="$3"
  local no_reserves="$4"

  echo "  Linking Supabase: ${slug} -> market_id_onchain=${market_id}"
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PATCH "${SUPABASE_URL}/rest/v1/markets?slug=eq.${slug}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"market_id_onchain\": \"${market_id}\", \"yes_reserves\": ${yes_reserves}, \"no_reserves\": ${no_reserves}}" \
    2>/dev/null) || true

  if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    echo "  Supabase updated (HTTP ${http_code})."
  else
    echo "  WARNING: Supabase PATCH returned HTTP ${http_code}. Check Supabase is running."
  fi
}

# ── Main ───────────────────────────────────────────────────────────────────

echo "========================================"
echo " Obsidian Market — Seed Markets Script"
echo "========================================"
echo ""
echo "Aleo endpoint : ${ALEO_ENDPOINT}"
echo "Aleo network  : ${ALEO_NETWORK}"
echo "Supabase URL  : ${SUPABASE_URL}"
echo "Program       : ${PROGRAM}"
echo "Markets to seed: ${#SEED_MARKETS[@]}"
echo ""

CREATED=0
LINKED=0
SKIPPED=0

for entry in "${SEED_MARKETS[@]}"; do
  IFS='|' read -r market_id slug yes_reserves no_reserves <<< "$entry"

  echo "--- ${slug} (on-chain ID: ${market_id}) ---"

  # 1. Check if already linked in Supabase
  if check_supabase_linked "$slug"; then
    echo "  Already linked in Supabase — skipping."
    SKIPPED=$((SKIPPED + 1))
    echo ""
    continue
  fi

  # 2. Check if market exists on-chain
  if check_market_exists "$market_id"; then
    echo "  Already exists on-chain — linking to Supabase only."
    # Fetch actual on-chain reserves (they may differ from seed values after bets)
    if fetch_onchain_reserves "$market_id"; then
      echo "  On-chain reserves: YES=${ONCHAIN_YES} NO=${ONCHAIN_NO}"
      yes_reserves="$ONCHAIN_YES"
      no_reserves="$ONCHAIN_NO"
    else
      echo "  WARNING: Could not fetch on-chain reserves, using seed values."
    fi
  else
    create_market_onchain "$market_id" "$yes_reserves" "$no_reserves"
    CREATED=$((CREATED + 1))
  fi

  # 3. Link in Supabase (uses actual on-chain reserves if fetched above)
  link_supabase "$slug" "$market_id" "$yes_reserves" "$no_reserves"
  LINKED=$((LINKED + 1))

  echo ""
done

echo "========================================"
echo " Done! Created: ${CREATED} | Linked: ${LINKED} | Skipped: ${SKIPPED}"
echo "========================================"
