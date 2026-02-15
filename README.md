# Obsidian Market

[GitHub Repo](https://github.com/adamsimonini/obsidian-market)
[Vercel Deployment](https://obsidian-market.vercel.app/)
[Supabase](https://supabase.com/dashboard/project/giarcxkfqogumngtygmt)
[](https://developer.aleo.org/sdk/overview/)
[Wallet Adapter](https://github.com/ProvableHQ/aleo-wallet-adapter)
[test_usdcx_bridge.aleo](https://testnet.explorer.provable.com/program/test_usdcx_bridge.aleo)
[test_usdcx_stablecoin.aleo](https://testnet.explorer.provable.com/program/test_usdcx_stablecoin.aleo)
[Obsidian Market Testnet Deployment](https://testnet.explorer.provable.com/transaction/at1hl20gxvc2dawh8m2myrzmqmfksgg5ed57tdec549df35dhz5dcyqk7eelc)

### Dev Endpoints

**`/dev/onchain`** — Sanity-check page that queries the Aleo testnet `markets` mapping (IDs 1–20) and displays them alongside Supabase rows. Shows on-chain reserves, status, creator, and whether each market is linked to a DB slug. Not linked in the UI — access directly.

- Local: http://localhost:3000/en/dev/onchain
- Prod: https://obsidian-market.vercel.app/en/dev/onchain

### Important: Deployment & Migration

**📖 [Read the Deployment Guide](docs/deployment-guide.md)** before deploying or updating the smart contract.

**Critical order of operations:**
1. ✅ Deploy smart contract (`leo deploy`)
2. ✅ Reset database (`npm run db:reset:local` or `db:reset:remote`)
3. ✅ Create on-chain markets & link (`npm run seed-aleo`)

The seed script **updates** existing database rows with on-chain market IDs. It does not create new database records. See the full guide for migration instructions, troubleshooting, and why this order matters.

---

Use Aleo Wallet Adapter (with pre-build wallet multi-button)

A privacy-focused prediction market built on [Aleo](https://aleo.org/). Users can create and bet on binary (Yes/No) markets with private bet positions powered by zero-knowledge proofs.

## Overview

Obsidian Market uses a **hybrid public/private architecture**: market reserves are public (enabling AMM pricing via CPMM), while individual bets are private (users hold encrypted `BetRecord` records). Supabase stores market metadata (titles, descriptions, resolution rules), and the Aleo smart contract handles on-chain betting logic.

### Key Features

- **Binary Prediction Markets**: Simple Yes/No markets with CPMM (constant product AMM) pricing
- **Private Betting**: Bet amounts and positions are private via Aleo's zero-knowledge proofs
- **Wallet Integration**: Leo Wallet adapter (@provablehq) for signing transactions
- **Admin Controls**: Admin-only market creation and resolution
- **Light/Dark Mode**: Theme switching via next-themes

## Architecture

```
obsidian-market/
├── aleo/                     # Aleo smart contract (Leo language)
│   ├── src/main.leo          # Main contract (obsidian_market.aleo)
│   ├── tests/test_leo.leo    # Contract tests
│   └── program.json          # Program metadata
├── frontend/                 # Next.js web app
│   └── src/
│       ├── app/              # App Router pages (/, /account, /settings)
│       ├── components/       # UI components
│       │   ├── layout/       # Navbar, Providers
│       │   ├── ui/           # shadcn/ui (Button, Card, Input, Dialog, Badge)
│       │   ├── MarketList.tsx
│       │   ├── MarketCard.tsx
│       │   ├── BetForm.tsx
│       │   ├── CreateMarketForm.tsx
│       │   └── WalletButton.tsx
│       ├── contexts/         # WalletContext
│       ├── hooks/            # useMarkets, useAdmin, useWallet
│       ├── lib/              # Supabase client, utils
│       └── types/            # TypeScript types
├── backend/                  # Supabase config and migrations
│   └── supabase/
│       ├── config.toml       # Local Supabase config
│       ├── migrations/       # Database migrations
│       └── seed.sql          # Seed data (example markets)
├── business/                 # Research and odds logic docs
└── docs/                     # Development and deployment guides
```

### Tech Stack

**Frontend**

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI + CVA)
- [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- [Lucide React](https://lucide.dev/) for icons
- TypeScript

**Blockchain**

- [Aleo](https://aleo.org/) / [Leo](https://docs.leo-lang.org/) smart contracts
- [@provablehq/aleo-wallet-adaptor-react](https://www.npmjs.com/package/@provablehq/aleo-wallet-adaptor-react) for wallet integration
- [Amareleo-Chain](https://github.com/kaxxa123/amareleo-chain) for local development

**Backend**

- [Supabase](https://supabase.com/) (PostgreSQL + REST API)

## Getting Started

> **⚠️ Important:** For production deployment or smart contract updates, see the **[Deployment Guide](docs/deployment-guide.md)** for the correct order of operations.

### Prerequisites

- Node.js >= 18
- npm
- [Leo CLI](https://docs.leo-lang.org/) (for smart contract development)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for local database)
- [Amareleo-Chain](https://github.com/kaxxa123/amareleo-chain) (for local Aleo node)

### Quick Start

1. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**

   Create `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```

   Create `aleo/.env`:

   ```env
   NETWORK=testnet
   PRIVATE_KEY=<your-private-key>
   ENDPOINT=http://localhost:3030
   ```

3. **Start local Supabase**

   ```bash
   cd backend
   supabase start
   ```

4. **Start the local Aleo chain**

   ```bash
   amareleo-chain start
   ```

5. **Build and deploy the smart contract**

   ```bash
   cd aleo
   leo build
   leo deploy --broadcast --yes
   ```

6. **Seed the database and create on-chain markets**

   ```bash
   # From project root
   npm run db:reset:local   # Creates Supabase rows
   npm run seed-aleo        # Creates on-chain markets + links to DB
   ```

   **Important:** Always run `db:reset:local` before `seed-aleo`. See [Deployment Guide](docs/deployment-guide.md) for details.

7. **Run the frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Root Package Scripts

From the project root:

```bash
# Development
npm run app              # Start frontend dev server (Next.js on port 3000)
npm run backend          # Start local Supabase
npm run chain            # Start local Aleo chain (amareleo-chain)
npm run dev              # Start backend + frontend together

# Database & Seeding
npm run db:reset:local   # Reset local Supabase (runs migrations + seed.sql)
npm run db:reset:remote  # Reset remote/production Supabase
npm run seed-aleo        # Create on-chain markets & link to Supabase
npm run db:push          # Push database schema changes to Supabase
```

**Seeding workflow:**
1. `npm run db:reset:local` → Creates 20 market rows in Supabase
2. `npm run seed-aleo` → Creates 20 on-chain markets and links them

See **[Deployment Guide](docs/deployment-guide.md)** for complete workflow.

## Smart Contract

**Current Version:** [`obsidian_market_v2.aleo`](https://testnet.explorer.provable.com/program/obsidian_market_v2.aleo)

**Previous Version:** [`obsidian_market.aleo`](https://testnet.explorer.provable.com/program/obsidian_market.aleo) (deprecated)

### On-Chain Data Model

```leo
struct Market {
    id: u64,
    creator: address,
    market_type: u8,       // 1 = CPMM
    yes_reserves: u64,     // PUBLIC - needed for AMM pricing
    no_reserves: u64,      // PUBLIC - needed for AMM pricing
    status: u8,            // 0=open, 1=closed, 2=resolved, 3=cancelled
}

record BetRecord {         // PRIVATE - held by user
    owner: address,
    market_id: u64,
    shares: u64,
    side: bool,            // true = Yes, false = No
}
```

### Transitions

| Transition                                                           | Description                               | Access     |
| -------------------------------------------------------------------- | ----------------------------------------- | ---------- |
| `create_market(market_id, yes_odds, no_odds)`                        | Create a new market with initial reserves | Admin only |
| `place_bet_cpmm(market_id, yes_reserves, no_reserves, amount, side)` | Place a bet using CPMM formula            | Anyone     |

### Key Commands

```bash
cd aleo

leo build                                    # Compile the program
leo test                                     # Run unit tests
leo deploy --broadcast --yes                 # Deploy to chain
leo execute create_market <args> --broadcast --yes  # Execute a transition
```

### Local Aleo Chain (Amareleo-Chain)

[Amareleo-Chain](https://github.com/kaxxa123/amareleo-chain) provides a lightweight single-process Aleo validator for local development. Fast startup, minimal resource usage, and compatible with `leo` CLI.

```bash
amareleo-chain start              # Fresh chain from genesis (REST API on localhost:3030)
amareleo-chain start --keep-state # Persist chain state across runs
amareleo-chain clean              # Clean chain storage
```

## Database

Supabase stores market metadata that doesn't need to be on-chain (titles, descriptions, resolution rules/sources, deadlines).

### Tables

- **`markets`** - Market metadata (title, description, resolution rules, odds, status, on-chain ID)
- **`admins`** - Admin wallet addresses

### Local Development

```bash
cd backend
supabase start       # Start local Supabase (Docker)
supabase db reset    # Reset and re-run migrations + seed data
supabase status      # Show connection details and API keys
```

Studio UI: [http://127.0.0.1:54323](http://127.0.0.1:54323)

## Environment

- **Network**: testnet
- **Testnet endpoint**: https://api.explorer.provable.com/v1
- **Local chain endpoint**: http://localhost:3030
- **Leo CLI**: 3.3.1+
- `.env` files contain private keys -- never commit them

## Documentation

- [Aleo Local Development](./docs/aleo-local-dev.md) - Smart contract testing and devnet
- [Smart Contract Testing](./aleo/testing.md) - Unit tests, devnet, and testnet deployment
- [Supabase Setup](./docs/supabase-setup.md) - Database setup guide
- [Supabase CLI](./backend/SUPABASE_CLI.md) - CLI commands reference
- [Local Supabase](./backend/LOCAL_SUPABASE.md) - Local development with Docker
- [Deployment Guide](./docs/deployment.md) - Production deployment
- [Odds Logic](./business/odds-logic.md) - CPMM pricing model and privacy architecture

## License

See [LICENSE.txt](./LICENSE.txt) for details.

## Privacy Considerations

If an aleo wallet is comrpomised, the view key can be used to see the full details of that wallet's interaciton with a smart contract - hence the entire betting history on obsidian market.

A compromised Aleo view key exposes the full transaction history—including program interactions, market_ids, bet timings, shares, and sides—for all private records owned by that account.

Commit-then-reveal for market_id: Commit blinded market_id privately, reveal post-proof to prevent selective frontrunning.
Batch/zk-mixer integration: Users batch bets across markets into one ZK proof/transfer, obscuring per-market links natively.
View-key silos: Generate app-specific sub-addresses/view keys per market category, limiting compromise scope.
Circuit blinding: Add ZK commitments inside records (e.g., blinded market_id), decrypt only via selective view keys.
