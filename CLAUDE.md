# Obsidian Market

Privacy-focused prediction market built on Aleo.

## Architecture

- **frontend/** - Next.js (App Router) web app with shadcn/ui + Tailwind CSS
- **backend/** - Supabase (PostgreSQL) for market metadata, real-time subscriptions
- **aleo/** - Leo smart contract (`obsidian_market.aleo`) for on-chain market logic and private betting

## Smart Contract

- Program: `obsidian_market.aleo`
- Deployed on testnet: https://testnet.explorer.provable.com/program/obsidian_market.aleo
- Admin address: `aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv`
- Uses CPMM (constant product AMM) for pricing
- BetRecords are private (users hold positions privately)

## Key Commands

```bash
# Smart contract (run from aleo/ directory)
leo build                              # Compile the program
leo deploy --broadcast --yes           # Deploy to testnet
leo execute <fn> <args> --broadcast --yes  # Execute a transition
leo test                               # Run tests

# Query on-chain state
curl https://api.explorer.provable.com/v1/testnet/program/obsidian_market.aleo/mapping/markets/<id>

# Frontend (run from frontend/ directory)
npm run dev                            # Start dev server
npm run build                          # Production build

# Backend
supabase start                         # Start local Supabase
```

## Environment

- Network: testnet
- Endpoint: https://api.explorer.provable.com/v1
- Leo CLI: 3.4.0
- `.env` files contain private keys - never commit them

## Conventions

- Always use `--broadcast --yes` flags when deploying/executing via CLI (non-interactive)
- The `@admin` address in main.leo must match the deploying wallet
- For `leo test`, the `@admin` address must match the test private key (test ledger only has credits for standard dev keys)
