# Obsidian Market

[GitHub Repo](https://github.com/adamsimonini/obsidian-market)

A lightweight MVP prediction market application built on Aleo blockchain with cross-platform support (iOS, Android, and Web via React Native/Expo).

[Leo devnet docs](https://docs.leo-lang.org/cli/cli_devnet)
To find SnarkOS Binary
cargo install --list

leo devnet --snarkos /Users/ajsim/.cargo/bin/snarkos
/Users/ajsim/code/snarkOS

leo devnet --snarkos /Users/ajsim/.cargo/bin/snarkos --num-validators 1 --num-clients 0

faucet: https://faucet.aleo.org/

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
   cd frontend
   pnpm install
   ```

2. **Set Up Environment Variables**

   ```bash
   # Create .env file in frontend/
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Set Up Supabase**
   - Follow [Supabase Quick Setup Guide](./frontend/SUPABASE_SETUP.md)
   - Run the migration script (`supabase-migration.sql`) in Supabase SQL Editor
   - Add your admin wallet address to the `admins` table

4. **Set Up Aleo** (Optional for MVP)
   - Follow [Aleo Local Development Guide](./docs/aleo-local-dev.md)
   - Build and test contracts: `cd aleo && leo build && leo test`

5. **Run Development Server**

   ```bash
   cd frontend
   pnpm start
   ```

   This starts the **Metro bundler** (required for mobile) on port 19000. Then use the interactive menu:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator/Expo Go
   - Press `w` for web browser (starts web dev server on port 19006)
   - Scan QR code with Expo Go app (mobile)

   **Important**: Run `expo start` (or `pnpm start`) without flags to start Metro. Don't use `expo start --web` directly, as it only starts the web server and skips Metro bundler needed for mobile.

## Project Structure

```
obsidian-market/
├── leo/                    # Aleo smart contracts
│   ├── src/                # Leo source code
│   │   └── main.leo        # Main contract
│   └── tests/              # Contract tests
├── frontend/               # React Native frontend (Expo)
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

- [Supabase Quick Setup](./frontend/SUPABASE_SETUP.md) - Database setup (start here!)
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
- **Amareleo-Chain**: Lite Aleo development node for local testing (see [Development](#local-aleo-chain) section)
- **Supabase**: Backend-as-a-Service (PostgreSQL + REST API)
- **Leo Wallet Adapter**: Official Aleo wallet integration

## Styling & Theming

The app uses **NativeWind v4** (Tailwind CSS for React Native) for styling and **NativeWind UI** for pre-built components. The styling system includes:

- **Tailwind CSS Classes**: Use utility classes like `bg-background`, `text-foreground`, `border-border` throughout the app
- **NativeWind UI Components**: Pre-built components (`Button`, `Card`, `Input`, `Text`, `Icon`) located in `components/nativewindui/` and `components/ui/`
- **Custom Obsidian Theme**: Custom color palette matching the Obsidian aesthetic
- **Unified Theming**: Single color palette used across all platforms (iOS, Android, Web) for consistent branding
- **Light/Dark Mode**: Full theme switching support with manual toggle

### Theme Architecture

The theming system uses a **unified approach** - the same colors are used across all platforms (iOS, Android, Web) for consistent branding and simplified maintenance.

#### 1. **`theme/colors.ts`** - Primary Source of Truth (React Native)

This is the **single source of truth** for all theme colors used in React Native components.

- **Unified colors**: Single color palette used across all platforms (iOS, Android, Web)
- **Theme variants**: `light` and `dark` theme objects
- **Color tokens**: Semantic color names (background, foreground, primary, border, etc.)
- **Format**: RGB color strings (e.g., `'rgb(242, 242, 247)'`)

**Usage in Components**:

```tsx
import { useColorScheme } from '@/lib/useColorScheme';

function MyComponent() {
  const { colors, colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>Hello</Text>
      <View style={{ borderColor: colors.border }} />
    </View>
  );
}
```

#### 2. **`global.css`** - CSS Variables (Tailwind & Web)

Defines CSS custom properties used by Tailwind CSS classes and web platform styling.

- **Purpose**: Enables Tailwind utilities like `bg-background`, `text-foreground` via `tailwind.config.js`
- **Format**: RGB values without `rgb()` wrapper (e.g., `242 242 247`) for opacity support
- **Unified variables**: Same CSS variables used for all platforms
- **Dark mode**: Supports both `@media (prefers-color-scheme: dark)` and `.dark` class

**How Tailwind Uses It**:
The `tailwind.config.js` uses a `withOpacity()` function that references these CSS variables:

```javascript
// tailwind.config.js
border: withOpacity('border'),  // Uses --border for all platforms
```

#### 3. **`lib/useColorScheme.tsx`** - Theme Hook

Provides a unified interface for accessing theme colors and managing theme state.

- **Wraps**: NativeWind's `useColorScheme` hook
- **Exposes**: `colors` object from `theme/colors.ts` (unified across platforms)
- **Provides**: `colorScheme`, `isDarkColorScheme`, `setColorScheme()`, `toggleColorScheme()`

### Why Two Systems?

React Native doesn't support CSS variables natively, so we need:

1. **Direct RGB values** (`theme/colors.ts`) → For React Native's StyleSheet API
2. **CSS variables** (`global.css`) → For Tailwind utilities and web platform

Both systems should be kept **in sync** when updating theme colors.

### Theme Switching Implementation

The app uses a **hybrid approach** combining Tailwind classes and explicit colors:

#### For Backgrounds & Most Styling

Use Tailwind classes (they work reliably):

```tsx
<View className="bg-background border border-border" />
```

#### For Text Colors & Borders

Use explicit colors from `useColorScheme()` hook (more reliable):

```tsx
const { colors } = useColorScheme();
<Text style={{ color: colors.foreground }} />
<View style={{ borderColor: colors.border }} />
```

**Why This Approach?**

NativeWind's CSS variable resolution can be inconsistent at runtime in React Native, especially for:

- Text colors (`text-foreground` class)
- Border colors (`border-border` class)

By using explicit colors from `useColorScheme()` for these critical properties, we ensure:

- ✅ Immediate theme updates when switching
- ✅ Consistent behavior across platforms
- ✅ Reliable dark mode support

**Components Using Explicit Colors**:

- `components/nativewindui/Text.tsx` - Uses `colors.foreground`
- `components/nativewindui/Card.tsx` - Uses `colors.border`
- `components/ui/card.tsx` - Uses `colors.border`
- `components/ui/input.tsx` - Uses `colors.border` and `colors.mutedForeground`
- `components/ui/button.tsx` - Uses `colors.border` for outline variant
- `components/Header.tsx` - Uses `colors.border` for bottom divider

### Benefits of Unified Theming

The unified theming approach provides several advantages:

- **Consistent Branding**: Same colors across iOS, Android, and Web ensure a cohesive brand experience
- **Simplified Maintenance**: Single color palette means updating colors in one place affects all platforms
- **Easier Development**: No need to manage platform-specific color variations
- **Web Consistency**: Web platform now uses the same colors as mobile, eliminating inconsistencies

### Adding New Theme Colors

1. **Add to `theme/colors.ts`**:

   ```typescript
   // Add to both light and dark theme objects
   const COLORS = {
     light: {
       // ... existing colors ...
       myNewColor: 'rgb(255, 0, 0)',
     },
     dark: {
       // ... existing colors ...
       myNewColor: 'rgb(200, 0, 0)',
     },
   };
   ```

2. **Add to `global.css`**:

   ```css
   :root {
     --my-new-color: 255 0 0;
   }
   .dark {
     --my-new-color: 200 0 0;
   }
   ```

3. **Add to `tailwind.config.js`** (if needed):

   ```javascript
   myNewColor: withOpacity('my-new-color'),
   ```

4. **Use in components**:
   ```tsx
   const { colors } = useColorScheme();
   <View style={{ backgroundColor: colors.myNewColor }} />;
   ```

**Note**: Since we use unified theming, you only need to define each color once (not per platform). The same color will be used across iOS, Android, and Web.

## Development

### Running the App

**Start Metro Bundler (Required for Mobile):**

```bash
cd frontend
pnpm start
```

This starts the Metro bundler on port 19000, which is required for iOS, Android, and Expo Go. Once Metro is running, use the interactive menu:

- Press `i` for iOS simulator
- Press `a` for Android emulator/Expo Go
- Press `w` for web browser (also starts web dev server on port 19006)
- Scan QR code with Expo Go app (mobile)

**Important Notes:**

- ✅ **Correct**: `expo start` or `pnpm start` - Starts Metro bundler, then choose platform
- ❌ **Incorrect**: `expo start --web` - Only starts web server, Metro won't run (Android/iOS won't work)
- The Metro bundler (port 19000) is required for mobile development
- The web dev server (port 19006) is optional and can be started from the Metro menu

### Local Aleo Chain

This project uses [Amareleo-Chain](https://github.com/kaxxa123/amareleo-chain) for local Aleo development. Amareleo-Chain is a lite, developer-friendly Aleo node that provides a minimal validator for testing Aleo program deployment and execution.

**Key Features:**

- Fast startup/shutdown times
- Single process with minimal resource usage
- Fresh chain state by default (or persistent with `--keep-state`)
- Compatible with standard Aleo tools (`snarkOS`, `leo`)

**Available Commands:**

- `amareleo-chain start` - Start the local chain node (exposes REST API on `localhost:3030`)
- `amareleo-chain start --keep-state` - Start with persistent chain state across runs
- `amareleo-chain clean` - Clean the chain storage
- `amareleo-chain update` - Update amareleo-chain

**Package Script:**

```bash
# Start the local Aleo chain
pnpm chain
```

This runs `amareleo-chain start` which starts a fresh chain from genesis and exposes a REST server on [localhost:3030](http://localhost:3030/), supporting the same endpoints as `snarkos`.

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

Create a `.env` file in `frontend/` with:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

## License

See [LICENSE.txt](./LICENSE.txt) for details.
