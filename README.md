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
  - **Styling**: NativeWind v4 (Tailwind CSS for React Native)
  - **UI Components**: NativeWind UI (Button, Card, Input, Text, Icon)
  - **Theme System**: Custom Obsidian theme with light/dark mode support
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
│   │   ├── nativewindui/   # NativeWind UI components (Text, Card, Icon, ThemeToggle)
│   │   └── ui/             # Additional UI components (Button, Input, Card)
│   ├── contexts/           # React contexts (Wallet)
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (Supabase client, useColorScheme)
│   ├── theme/              # Theme configuration (colors.ts)
│   ├── types/              # TypeScript types
│   ├── global.css          # Tailwind CSS directives and CSS variables
│   ├── tailwind.config.js  # Tailwind configuration
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

### Frontend Stack
- **React Native**: Cross-platform mobile framework
- **React**: UI library (v19)
- **Expo**: Development platform and tooling
- **Expo Router**: File-based routing
- **NativeWind v4**: Tailwind CSS for React Native - enables utility-first styling with Tailwind classes
- **NativeWind UI**: Pre-built component library with theme support (Button, Card, Input, Text, Icon components)
- **TypeScript**: Type-safe JavaScript

### Backend & Blockchain
- **Aleo/Leo**: Privacy-preserving blockchain
- **Supabase**: Backend-as-a-Service (PostgreSQL + REST API)
- **Leo Wallet Adapter**: Official Aleo wallet integration

## Styling & Theming

The app uses **NativeWind v4** (Tailwind CSS for React Native) for styling and **NativeWind UI** for pre-built components. The styling system includes:

- **Tailwind CSS Classes**: Use utility classes like `bg-background`, `text-foreground`, `border-border` throughout the app
- **NativeWind UI Components**: Pre-built components (`Button`, `Card`, `Input`, `Text`, `Icon`) located in `components/nativewindui/` and `components/ui/`
- **Custom Obsidian Theme**: Custom color palette matching the Obsidian aesthetic
- **Light/Dark Mode**: Full theme switching support with manual toggle

### Theme Configuration

The theme is defined in two places:

1. **`webapp/theme/colors.ts`** - Primary theme definition (source of truth)
   - Platform-specific colors for iOS and Android
   - Light and dark mode color objects
   - Exported as `COLORS` object

2. **`webapp/global.css`** - CSS variables for web and NativeWind
   - Tailwind directives (`@tailwind base/components/utilities`)
   - CSS custom properties for light mode (`:root`)
   - CSS custom properties for dark mode (`.dark`)

3. **`webapp/lib/useColorScheme.tsx`** - Theme hook
   - Wraps NativeWind's `useColorScheme` hook
   - Exposes `colors` object from `theme/colors.ts`
   - Provides `toggleColorScheme()` function

### Theme Switching Implementation

The app uses NativeWind v4 with a custom Obsidian theme that supports light and dark modes. Theme switching is implemented using explicit colors from the `useColorScheme()` hook rather than relying solely on CSS variables.

### How Theme Switching Works

**The Problem**: NativeWind's CSS variables (defined in `global.css`) don't always resolve correctly at runtime in React Native, especially when using classes like `text-foreground` or `border-border`. This can cause text and borders to remain dark in dark mode.

**The Solution**: Use explicit colors from the `useColorScheme()` hook via inline styles:

1. **Text Components**: The `Text` component uses `colors.foreground` directly via the `style` prop:
   ```tsx
   const { colors } = useColorScheme();
   <RNText style={{ color: colors.foreground }} />
   ```

2. **Border Components**: Card, Input, Button, and Header components use `colors.border`:
   ```tsx
   const { colors } = useColorScheme();
   <View style={{ borderColor: colors.border }} />
   ```

3. **Theme Colors**: Colors are defined in `theme/colors.ts` and automatically switch based on the current color scheme:
   - Light mode: `foreground: 'rgb(0, 0, 0)'`, `border: 'rgb(230, 230, 235)'`
   - Dark mode: `foreground: 'rgb(236, 237, 238)'`, `border: 'rgb(51, 51, 51)'`

**Key Components Updated**:
- `components/nativewindui/Text.tsx` - Uses explicit `colors.foreground`
- `components/nativewindui/Card.tsx` - Uses explicit `colors.border`
- `components/ui/card.tsx` - Uses explicit `colors.border`
- `components/ui/input.tsx` - Uses explicit `colors.border`
- `components/ui/button.tsx` - Uses explicit `colors.border` for outline variant
- `components/Header.tsx` - Uses explicit `colors.border` for bottom divider

**Why This Works**: By using JavaScript theme colors directly instead of CSS variables, we bypass NativeWind's CSS variable resolution and ensure colors update immediately when the theme changes. The `useColorScheme()` hook provides reactive access to theme colors that update automatically when `setColorScheme()` is called.

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
