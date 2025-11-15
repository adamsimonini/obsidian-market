# Development Guide

## Prerequisites

- Node.js >= 18
- pnpm (package manager)
- Leo CLI (for smart contract development)
- Supabase account (for database)

## Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd webapp
pnpm install

# Install Leo CLI (if not already installed)
# See: https://developer.aleo.org/leo/installation
```

### 2. Configure Environment Variables

Create `webapp/.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Set Up Supabase

1. Follow the [Supabase Setup Guide](./supabase-setup.md)
2. Run the migration scripts to create tables
3. Add your admin wallet address to the `admins` table

### 4. Set Up Aleo Local Development

1. Follow the [Aleo Local Development Guide](./aleo-local-dev.md)
2. Build and test the Leo program:
   ```bash
   cd leo
   leo build
   leo test
   ```

## Development Workflow

### Frontend Development

Start the development server:

```bash
cd webapp
pnpm run dev
```

This starts the Lynx dev server on `http://localhost:3000`. You can:
- View in browser (web wrapper)
- Scan QR code with LynxExplorer app (mobile)

### Smart Contract Development

1. Edit `leo/src/main.leo`
2. Build: `leo build`
3. Test: `leo test`
4. Deploy locally (when SnarkVM is set up)

### Testing

Run frontend tests:

```bash
cd webapp
pnpm test
```

## Project Structure

```
obsidian-market/
├── leo/                    # Aleo smart contracts
│   ├── src/
│   │   └── main.leo       # Main contract
│   └── tests/
│       └── test_leo.leo   # Contract tests
├── webapp/                # Frontend application
│   ├── src/
│   │   ├── components/   # React/Lynx components
│   │   ├── contexts/     # React contexts (Wallet)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities (Supabase client)
│   │   └── types/        # TypeScript types
│   └── package.json
└── docs/                  # Documentation
```

## Key Components

### Frontend

- **App.tsx**: Main application component with routing
- **WalletContext**: Manages wallet connection state
- **MarketList**: Displays list of markets from Supabase
- **CreateMarketForm**: Admin form to create new markets
- **BetForm**: Form to place bets on markets

### Smart Contracts

- **create_market**: Admin creates new prediction market
- **place_bet**: User places bet on market
- **get_market**: Query market state
- **get_bet**: Query bet information

## Common Tasks

### Adding a New Market (Admin)

1. Connect wallet (must be admin)
2. Click "Create Market"
3. Fill in form fields
4. Submit (creates in Supabase, then on-chain)

### Placing a Bet

1. Connect wallet
2. Select a market
3. Choose Yes/No
4. Enter bet amount (minimum 1 ALEO)
5. Submit transaction

### Testing Smart Contracts

```bash
cd leo
leo test
```

## Troubleshooting

### Supabase Connection Issues

- Verify environment variables are set
- Check Supabase project is active
- Verify RLS policies allow access

### Wallet Connection Issues

- Ensure Leo Wallet extension is installed (for web)
- Check wallet is unlocked
- Verify network (testnet/mainnet) matches

### Build Errors

- Clear `leo/build` directory and rebuild
- Check Leo version matches `program.json`
- Verify all dependencies installed

## Next Steps

1. Complete Aleo wallet integration
2. Implement on-chain market creation
3. Implement on-chain bet placement
4. Add market resolution functionality
5. Deploy to testnet

## Resources

- [Leo Language Docs](https://developer.aleo.org/leo/)
- [Lynx Framework Docs](https://lynx-js.github.io/)
- [Supabase Docs](https://supabase.com/docs)

