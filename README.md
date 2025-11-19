# Obsidian Market

A lightweight MVP prediction market application built on Aleo blockchain with cross-platform support (iOS, Android, and Web via React Native/Expo).

## Overview

Obsidian Market enables users to create and participate in binary (Yes/No) prediction markets. The platform uses Aleo for privacy-preserving transactions and Supabase for market metadata storage.

### Key Features

- **Binary Prediction Markets**: Simple Yes/No markets
- **Fixed Odds Betting**: Admin-set odds for predictable payouts
- **Wallet-Based Authentication**: Leo Wallet integration (web) with manual entry fallback (mobile)
- **Cross-Platform**: Works on iOS, Android, and Web browsers
- **Real-Time Updates**: Supabase real-time subscriptions
- **Admin Controls**: Admin-only market creation and resolution

## Architecture

- **Frontend**: React Native with Expo (cross-platform: iOS, Android, Web)
- **Blockchain**: Aleo smart contracts (Leo language)
- **Database**: Supabase (PostgreSQL with REST API)
- **Authentication**: Leo Wallet (web) / Manual address entry (mobile MVP)

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (package manager)
- Expo CLI (installed globally or via npx)
- Supabase account
- Leo CLI (for smart contract development)

### Quick Start

1. **Install Dependencies**
   ```bash
   cd webapp
   pnpm install
   ```

2. **Set Up Environment Variables**
   ```bash
   # Create .env file in webapp/
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Set Up Supabase**
   - Follow [Supabase Quick Setup Guide](./webapp/SUPABASE_SETUP.md)
   - Run the migration script (`supabase-migration.sql`) in Supabase SQL Editor
   - Add your admin wallet address to the `admins` table

4. **Set Up Aleo** (Optional for MVP)
   - Follow [Aleo Local Development Guide](./docs/aleo-local-dev.md)
   - Build and test contracts: `cd leo && leo build && leo test`

5. **Run Development Server**
   ```bash
   cd webapp
   pnpm start
   ```
   
   Then:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app (mobile)

## Project Structure

```
obsidian-market/
├── leo/                    # Aleo smart contracts
│   ├── src/                # Leo source code
│   │   └── main.leo        # Main contract
│   └── tests/              # Contract tests
├── webapp/                 # React Native frontend (Expo)
│   ├── app/                # Expo Router pages
│   ├── components/         # React Native components
│   ├── contexts/           # React contexts (Wallet)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (Supabase client)
│   ├── types/              # TypeScript types
│   ├── supabase-migration.sql  # Database schema
│   └── SUPABASE_SETUP.md   # Quick setup guide
├── webapp-lynx/            # Legacy Lynx implementation (archived)
└── docs/                   # Documentation
```

## Documentation

- [Supabase Quick Setup](./webapp/SUPABASE_SETUP.md) - Database setup (start here!)
- [Development Guide](./docs/development.md) - Detailed development setup
- [Deployment Guide](./docs/deployment.md) - Production deployment
- [Supabase Schema](./docs/supabase-schema.md) - Database schema details
- [Aleo Local Development](./docs/aleo-local-dev.md) - Smart contract development
- [Planning Document](./ai-context/planning.md) - Architecture and design decisions

## Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tooling
- **Expo Router**: File-based routing
- **React**: UI library
- **Aleo/Leo**: Privacy-preserving blockchain
- **Supabase**: Backend-as-a-Service (PostgreSQL + REST API)
- **TypeScript**: Type-safe JavaScript
- **Leo Wallet Adapter**: Official Aleo wallet integration

## Development

### Running the App

```bash
cd webapp
pnpm start
```

### Building

```bash
# iOS
pnpm ios

# Android
pnpm android

# Web
pnpm web
```

### Environment Variables

Create a `.env` file in `webapp/` with:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## License

See [LICENSE.txt](./LICENSE.txt) for details.
