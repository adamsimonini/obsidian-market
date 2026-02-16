# Changelog

All notable changes to Obsidian Market will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### To Do
- Implement private bets via USDCx (currently public only)
- Implement bet timing jitter (5-30 min delay) for privacy
- Add fixed denomination betting (1, 5, 10, 50, 100 USDCx)
- Implement batched market payouts for privacy
- Deploy .onion service for Tor Browser users
- Remove or encrypt trades table in Supabase
- Implement proper reserve management and privacy features
- Add anti-fingerprinting measures (disable WebRTC, remove analytics)
- Consider migration from USDCx to ALEO credits (privacy vs stability trade-off)

## [2.0.0] - 2026-02-16

### Added
- **Smart Contract v2**: Deployed `obsidian_market_v2.aleo` on testnet
  - Upgraded reserves from u64 to u128 for larger market capacity
  - Maintains CPMM (Constant Product Market Maker) pricing
  - Private BetRecords for user positions
- **USDCx Public Betting**: Integrated `test_usdcx_stablecoin.aleo` for stable betting
  - Public USDCx bets (private betting not yet implemented)
  - Swapping and balance checking functionality
- **Inline Betting UX**: Market detail page now shows bet form inline
  - Removed extra "Trade" button click (reduced from 2 clicks to 1)
  - Yes/No buttons immediately visible with prominent ROI display
  - Streamlined betting flow for better user experience
- **ROI Display**: Betting buttons now show potential return on investment
  - Calculated as `(1 / price - 1) * 100%`
  - Color-coded (green for yes, red for no)
  - Larger, more prominent buttons (p-6)
- **Remote Database Seeding**: Added separate npm scripts for local vs remote Supabase
  - `npm run seed-aleo:local` - seeds local development database
  - `npm run seed-aleo:remote` - seeds production database
  - Scripts are idempotent and sync reserves from on-chain state
- **Seed Script Improvements**: Enhanced `seed-markets.sh` for drift handling
  - Now syncs reserves from on-chain even for already-linked markets
  - Prevents database drift from on-chain state
  - Better error handling and status reporting
- **Privacy Research**: Comprehensive privacy threat model and mitigations
  - Added `docs/privacy-ideas.md` with detailed analysis
  - Identified correlation attacks (timing, patterns, cross-market)
  - Documented on-chain privacy issues (reserve leaks, transaction graphs)
  - Mapped application-level vulnerabilities (database, network, wallet)
  - Prioritized 14 privacy improvements with trade-off analysis
- **Transaction ID Validation**: Explorer links now validate transaction IDs
  - Only shows link if transaction ID starts with `at1` (valid Aleo format)
  - Prevents broken links from temporary wallet IDs
  - Extracts actual on-chain transaction ID from wallet response

### Changed
- **Market Detail Page Redesign**:
  - Removed redundant title and description from BetForm
  - Removed redundant volume/trades/fee stats from BetForm
  - Removed non-clickable price cards for open markets (kept for closed markets)
  - Bet form now appears directly after title/description
- **Improved On-Chain Data Parsing**: Fixed status display on dev page
  - Handles trailing whitespace in on-chain responses
  - Shows "Open/Closed/Resolved" instead of "Unknown (0u8\n)"
- **Database Schema**: Added `market_id_onchain` linking for all 20 markets
  - Markets 1-20 now properly linked to on-chain state
  - Both local and remote databases configured

### Deprecated
- **Smart Contract v1**: `obsidian_market.aleo` (deprecated, still on testnet)
  - v1 used u64 reserves (limited capacity)
  - All new development targets v2

### Security
- **Identified USDCx Compliance Key Vulnerability** (CRITICAL)
  - `test_usdcx_stablecoin.aleo` has master decrypt key
  - All USDCx bets are decryptable by compliance authorities
  - Documented in privacy-ideas.md with mitigation strategies
- **Reserve Delta Privacy Leak** (MAJOR)
  - Public reserve changes reveal bet side and approximate size
  - Even private BetRecords leak information via reserve updates
  - Documented with solutions (aggregated updates, noisy reserves)
- **Database Correlation Risk**
  - Trades table links `tx_hash` to `market_id`
  - Enables correlation between on-chain transactions and specific markets
  - Recommended removal or encryption of sensitive data
- **Network Surveillance Risks**
  - IP address tracking, DNS leaks, browser fingerprinting
  - Recommended Tor Browser, .onion service, disable logging
  - Documented in privacy-ideas.md

### Fixed
- **Explorer Link Validation**: Transaction links now work correctly
  - Validates transaction ID format before showing link
  - Handles wallet's temporary IDs gracefully
- **Seed Script Idempotency**: Markets already on-chain properly handled
  - No longer attempts to recreate existing markets
  - Syncs reserves even for previously linked markets
- **Local Database Sync**: Resolved market_id_onchain NULL values
  - All 20 markets now correctly linked in both local and remote DB
  - Proper error handling for network failures

## [1.0.0] - 2026-01-10

### Added
- **Initial Release**: Privacy-focused prediction market on Aleo
- **Smart Contract v1**: `obsidian_market.aleo` on testnet
  - CPMM-based automated market maker
  - Private bet records using Aleo's privacy features
  - Market creation, betting, and resolution functions
- **Frontend**: Next.js (App Router) web application
  - shadcn/ui component library with Tailwind CSS
  - Multi-language support (i18n)
  - Responsive design for mobile and desktop
- **Backend**: Supabase integration
  - PostgreSQL for market metadata and analytics
  - Real-time subscriptions for market updates
  - Row-level security policies
- **Wallet Integration**:
  - Leo Wallet support
  - Provable Wallet support
  - Transaction signing and proving
- **Market Features**:
  - 20 initial markets across 5 categories (Crypto, Politics, Tech, Sports, Science)
  - Featured market display
  - Trending markets sidebar
  - Category filtering and navigation
- **Developer Tools**:
  - Local Supabase development environment
  - Database migration and seeding scripts
  - Leo CLI integration for smart contract deployment
- **Documentation**:
  - README with setup instructions
  - Deployment guide (`docs/deployment-guide.md`)
  - Local Supabase setup guide
  - Smart contract documentation

### Technical Details
- **Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: Aleo testnet (Leo 3.4.0)
- **Database**: PostgreSQL via Supabase
- **Network**: Testnet endpoint https://api.explorer.provable.com/v1

---

## Migration Notes

### v1 → v2 Breaking Changes

**Smart Contract:**
- Reserve type changed from `u64` to `u128`
- Program name changed from `obsidian_market.aleo` to `obsidian_market_v2.aleo`
- All frontend integrations must update to v2 program ID

**Database:**
- Added `market_id_onchain` column to link markets to on-chain state
- Must run seed script to populate `market_id_onchain` values

**Deployment:**
1. Deploy v2 smart contract: `cd aleo && leo deploy --broadcast --yes`
2. Reset database: `npm run db:reset:local` or `npm run db:reset:remote`
3. Seed on-chain markets: `npm run seed-aleo:local` or `npm run seed-aleo:remote`
4. Update frontend env vars to point to v2 if needed

---

## Links

- **Testnet Explorer**: https://testnet.explorer.provable.com/program/obsidian_market_v2.aleo
- **Admin Address**: `aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv`
- **USDCx Program**: https://testnet.explorer.provable.com/program/test_usdcx_stablecoin.aleo

---

[Unreleased]: https://github.com/youruser/obsidian-market/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/youruser/obsidian-market/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/youruser/obsidian-market/releases/tag/v1.0.0
