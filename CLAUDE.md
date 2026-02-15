# Obsidian Market

Privacy-focused prediction market built on Aleo.

## Architecture

- **frontend/** - Next.js (App Router) web app with shadcn/ui + Tailwind CSS
- **backend/** - Supabase (PostgreSQL) for market metadata, real-time subscriptions
- **aleo/** - Leo smart contract (`obsidian_market_v2.aleo`) for on-chain market logic and private betting

## Smart Contract

- **Current Program:** `obsidian_market_v2.aleo`
- **Previous Program:** `obsidian_market.aleo` (deprecated, v1)
- Deployed on testnet: https://testnet.explorer.provable.com/program/obsidian_market_v2.aleo
- Admin address: `aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv`
- Uses CPMM (constant product AMM) for pricing
- Uses USDCx (test_usdcx_stablecoin.aleo) for betting and payouts
- Reserves are u128 (upgraded from u64 in v1)
- BetRecords are private (users hold positions privately)

## Key Commands

```bash
# Smart contract (run from aleo/ directory)
leo build                              # Compile the program
leo deploy --broadcast --yes           # Deploy to testnet
leo execute <fn> <args> --broadcast --yes  # Execute a transition
leo test                               # Run tests

# Query on-chain state
curl https://api.explorer.provable.com/v1/testnet/program/obsidian_market_v2.aleo/mapping/markets/<id>u64

# Database & Seeding (run from project root)
npm run db:reset:local                 # Reset local Supabase (migrations + seed.sql)
npm run db:reset:remote                # Reset remote Supabase
npm run seed-aleo                      # Create on-chain markets & link to DB

# Frontend (run from frontend/ directory)
npm run dev                            # Start dev server
npm run build                          # Production build

# Backend
supabase start                         # Start local Supabase
```

## Deployment Workflow

**CRITICAL ORDER (see docs/deployment-guide.md for details):**

1. Deploy smart contract: `cd aleo && leo deploy --broadcast --yes`
2. Seed database: `npm run db:reset:local` (creates 20 market rows with NULL market_id_onchain)
3. Create on-chain markets: `npm run seed-aleo` (creates markets 1-20 on-chain and updates DB with IDs)

**Important:** The seed script UPDATES existing database rows, it does NOT create new ones. Database must be seeded first.

## Environment

- Network: testnet
- Endpoint: https://api.explorer.provable.com/v1
- Leo CLI: 3.4.0
- `.env` files contain private keys - never commit them

## Conventions

- Always use `--broadcast --yes` flags when deploying/executing via CLI (non-interactive)
- The `@admin` address in main.leo must match the deploying wallet
- For `leo test`, the `@admin` address must match the test private key (test ledger only has credits for standard dev keys)
