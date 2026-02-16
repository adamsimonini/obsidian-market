# Privacy Considerations for Obsidian Market

## Pillars of Privacy

### I. Correlation Attacks

#### A. Timing Correlation

**Problems:**

1. **Payout Timing**
   - Market resolution → immediate payout reveals bet-to-market linkage
   - Correlating market closing time with payout transaction
   - Links specific BetRecords to market outcomes

2. **Bet Placement Timing**
   - Reserve updates are instant and public
   - Correlates with user's page load/interaction time
   - Chain analysis: "wallet X bet at block Y" → "IP visited market at time Y"
   - Even private bets leak timing via public reserve changes

3. **IP Address Timing**
   - Correlating IP address visiting Obsidian Markets with on-chain activity
   - Which market was viewed correlates with which bet was placed
   - Session duration and interaction patterns

4. **Session Timing Patterns**
   - Time between market view and bet placement
   - Betting frequency and active hours
   - Multi-market visit patterns

**Solutions:**

- ✅ **Payout jitter** - randomize payout times on market close
  - Increase from 100 seconds to 10-60 minutes for better anonymity
  - Makes correlation with market close harder

- ✅ **Batched payouts** - conjoin payout times with other markets
  - Enforce that multiple markets payout simultaneously
  - Creates larger anonymity set
  - Example: All markets payout at 5 fixed time slots per day

- ✅ **Bet delay jitter** - randomize delay in bet timing
  - Increase from 100 seconds to 5-30 minutes
  - Breaks correlation between user action and on-chain transaction
  - Trade-off: Worse UX, but stronger privacy

- ✅ **Decoupled submission** - users submit to relay/mempool
  - Relay batches and submits at random intervals
  - Hides direct correlation between user action and chain tx
  - Requires trusted or decentralized relay infrastructure

- ⚠️ **Market close synchronization** - multiple markets close together
  - Good for anonymity but constrains market design
  - Could use fixed daily slots (e.g., 5 times per day)

- ❌ **Cooldown between bets** - enforced delay between user bets
  - Hurts UX significantly
  - Minimal privacy benefit vs. other solutions

#### B. Amount/Pattern Correlation

**Problems:**

1. **Unique Bet Sizes**
   - Betting unusual amounts (e.g., 13.7 USDCx) is fingerprintable
   - Same user betting similar amounts across markets
   - Creates linkable transaction patterns

2. **Reserve Delta Reveals Bet Size** (CRITICAL)
   - Public reserves before: 50M/50M
   - Public reserves after: 51.5M/48.5M
   - Reveals 1.5M bet on YES even though BetRecord is private
   - Anyone can calculate bet size from reserve changes

3. **Betting Pattern Analysis**
   - User always bets on underdogs
   - Specific categories (only crypto markets)
   - Sequential bets on related markets
   - Consistent bet-to-liquidity ratios

4. **Multi-Market Fingerprinting**
   - User bets on markets A, B, C in sequence
   - Creates linkable transaction graph
   - Combining with timing creates unique signature

**Solutions:**

- ✅ **Fixed denominations** - enforce standard bet sizes
  - Only allow: 1, 5, 10, 50, 100 USDCx
  - Creates anonymity sets for each denomination
  - Trade-off: Less flexibility for users

- ✅ **Minimum bet sizes** - prevents dust fingerprinting
  - Minimum 1 USDCx to prevent unique small amounts
  - Reduces granularity of bet size information

- ✅ **Noisy reserves** - add random fluctuations
  - Protocol places small random buys/sells
  - Obscures actual bet sizes in reserve changes
  - Trade-off: Costs gas, reduces accuracy

- ✅ **Aggregated reserve updates** - batch multiple bets
  - Collect 10-100 bets before updating reserves
  - Hides individual bet sizes
  - Requires trusted aggregator or zkProof of correct aggregation
  - Significant dev complexity

- ✅ **Batch betting** - submit multiple bets in one transaction
  - Reduces transaction graph linkability
  - But still reveals "this user bet on these N markets"

- ❌ **Denomination mixing** - CoinJoin-style mixing
  - Very complex, adds delay
  - Marginal benefit over simpler solutions

#### C. Cross-Market Correlation

**Problems:**

1. **Multi-Market Visit Patterns**
   - IP visits markets 1, 5, 7, then bets on markets 1 and 5
   - Links IP to specific bet transactions
   - Browser fingerprinting enhances correlation

2. **Sequential Betting Patterns**
   - User bets on related markets (e.g., all crypto markets)
   - Creates behavioral fingerprint
   - Linking with IP/timing reveals identity

3. **Market Metadata Leakage**
   - Supabase stores which markets exist
   - API calls reveal which markets are being queried
   - DNS/TLS reveals site visit even if encrypted

**Solutions:**

- ✅ **Market anonymization** - don't log which markets are viewed
  - Serve all markets as single payload
  - Client-side filtering only
  - No server-side record of individual market views

- ✅ **Session isolation** - each bet from fresh session
  - Breaks multi-bet correlation
  - Trade-off: Very poor UX, likely unacceptable

- ✅ **Disable server logging** - no access logs
  - No IP logs, no market view logs
  - But Cloudflare/CDN still logs
  - Consider self-hosted or privacy CDN

---

### II. On-Chain Privacy

#### A. Private Records (BetRecord)

**Current State:**

- ✅ Users hold private `BetRecord`s with encrypted bet details
- ✅ Only owner can decrypt their records
- ✅ Position details (side, amount, shares) stay private

**Problems:**

1. **Wallet Compromise** (CATASTROPHIC)
   - Loss of view key → all BetRecords decrypted
   - Total privacy failure, all historical bets exposed
   - No recovery or mitigation possible

2. **USDCx Compliance Key** (CRITICAL VULNERABILITY)
   - `test_usdcx_stablecoin.aleo` has master decrypt key
   - Compliance authorities can decrypt ALL bets using USDCx
   - **Current app uses USDCx exclusively** - all bets are decryptable
   - Privacy stablecoins sacrifice privacy for regulatory compliance

3. **Accidental Public Data**
   - Developer error submits private data as public
   - No way to delete or hide after submission
   - Permanent privacy breach

**Solutions:**

- ✅ **Use ALEO credits only** (HIGH PRIORITY)
  - No compliance key, true privacy
  - Trade-off: Price volatility, not stable
  - Users must accept volatility for privacy

- ✅ **Build privacy-preserving stablecoin**
  - Create own stablecoin without master decrypt key
  - Significant dev effort
  - Or wait for truly private stablecoin to emerge

- ✅ **Record encryption hardening**
  - Multi-sig decrypt (requires multiple keys)
  - Threshold decryption (k-of-n keys needed)
  - Time-locked decryption (can't decrypt until timestamp)
  - Social recovery mechanisms

- ✅ **Wallet security best practices**
  - Educate users on key management
  - Recommend hardware wallets
  - Multiple wallets for different risk levels

- ❌ **Record deletion** - not possible on Aleo
  - Immutable blockchain, can't remove data
  - Prevention is only solution

#### B. Public On-Chain Data Leakage

**Problems:**

1. **Reserve Changes Are Public** (MAJOR ISSUE)
   - Every bet updates `yes_reserves` and `no_reserves` (public mapping)
   - Reveals: bet side, approximate size, timing
   - Creates public transaction graph even with private BetRecords
   - Anyone can reconstruct bet activity from reserve history

2. **Market State Transitions**
   - `status` field changes (open→closed→resolved) are public
   - Timestamp of state changes is public
   - Links market resolution to payout wave timing

3. **Transaction Metadata**
   - Block height, timestamp, fee paid all public
   - Program ID links transaction to Obsidian Market
   - Transaction graph analysis possible

4. **Creator Address Public**
   - Market creator address is public
   - Links market creation to specific entity
   - Can analyze creator's other activities

**Solutions:**

- ❌ **Hide reserves** - not compatible with CPMM
  - Bonding curve requires public reserves for pricing
  - Can't price bets without knowing current reserves
  - Fundamental trade-off

- ✅ **Aggregated reserve updates** (best option)
  - Collect 10-100 bets before updating reserves
  - Hides individual bet sizes
  - Requires zkProof that aggregation is correct
  - High complexity, but preserves CPMM pricing

- ✅ **Noisy reserves** - protocol places decoy bets
  - Small random buys/sells every N blocks
  - Obscures real bet activity
  - Trade-off: Costs gas continuously

- ✅ **Separate market state** - store state off-chain
  - Only commit final outcome on-chain
  - Loses composability and verifiability
  - Not ideal for decentralized market

- ⚠️ **Fixed batch updates** - update reserves on schedule
  - Every hour or every N blocks
  - Hides exact timing of individual bets
  - But still reveals total volume in period

#### C. Transaction Graph Analysis

**Problems:**

1. **Address Reuse**
   - Same wallet betting multiple times
   - Linkable transaction history across markets
   - Builds complete profile of user's betting activity

2. **Change Outputs**
   - Bet 10 USDCx from wallet with 15 USDCx
   - Creates 5 USDCx change output
   - Change links to future transactions
   - Enables forward tracing

3. **Gas Payment Patterns**
   - Consistent fee amounts from same wallet
   - Same gas wallet funding all bets
   - Links seemingly unrelated bet transactions

4. **Transaction Timing Clusters**
   - Multiple bets from same user cluster in time
   - Pattern analysis reveals common origin
   - Combining with other metadata strengthens linkage

**Solutions:**

- ✅ **One-time addresses** - new address per bet
  - Like Bitcoin stealth addresses
  - Breaks address reuse linkability
  - Requires wallet support, complex UX

- ✅ **CoinJoin-style mixing** - multi-user transaction batching
  - Combine multiple users' bets in single tx
  - Breaks input/output linkage
  - Very complex to coordinate, poor UX

- ✅ **Separate gas wallet** - don't use bet wallet for fees
  - Breaks link between bet amounts and gas payments
  - Use privacy-preserving gas payment service
  - Or protocol subsidizes gas

- ✅ **Uniform transaction sizes** - fixed input/output amounts
  - All transactions look the same
  - Combined with fixed denominations
  - Maximizes anonymity set

---

### III. Application-Level Privacy

#### A. Database Storage

**Current Vulnerabilities:**

1. **Trades Table Stores Sensitive Data**
   - `tx_hash` - links to on-chain transaction
   - `market_id` - reveals which market
   - `side`, `shares`, `amount` - reveals bet details
   - Even without `wallet_address`, this enables correlation
   - Can link on-chain tx to specific market via database

2. **Markets Table Leaks Data**
   - `market_id_onchain` - links database to blockchain
   - `yes_reserves`, `no_reserves` - duplicates chain data
   - View counts, analytics (if added) leak market interest

3. **Database Compromise Risk**
   - Supabase admin can access all data
   - Hacker compromises DB gets complete market/trade history
   - Legal subpoena forces data disclosure

**Solutions:**

- ✅ **Don't store trades** (HIGH PRIORITY)
  - All bet data lives on-chain only
  - App queries chain directly for trade history
  - Trade-off: Slower queries, more expensive, poor UX
  - But eliminates major correlation vector

- ✅ **Encrypted storage** - encrypt `tx_hash`, `market_id`
  - Client-side encryption/decryption only
  - Database admin cannot correlate data
  - Trade-off: Can't query, filter, or aggregate
  - Requires redesign of backend queries

- ✅ **Anonymized aggregates only** - no individual trades
  - Store only: total volume, trade count, price
  - No individual trade records in database
  - Loses granular analytics but preserves privacy

- ✅ **Decentralized database** - migrate from Supabase
  - Use IPFS, Arweave, Ceramic, or other decentralized storage
  - No central point of compromise
  - Trade-off: Harder to query, slower, more complex

- ✅ **Minimal retention** - delete old data
  - Only keep last 7-30 days of detailed data
  - Aggregate historical data
  - Reduces exposure window

#### B. Network Surveillance

**Problems:**

1. **IP Address Tracking**
   - Server logs: "IP X visited markets A, B, C"
   - ISP sees: "User visited obsidian-market.com"
   - Correlates IP with on-chain betting activity
   - CDN (Cloudflare) logs all requests

2. **DNS Leaks**
   - DNS query for "obsidian-market.com" reveals usage
   - ISP/DNS provider knows user interacts with prediction markets
   - Even with VPN, DNS can leak

3. **TLS/SNI Fingerprinting**
   - SNI reveals domain in TLS handshake (unencrypted)
   - Observer knows site visited even with HTTPS
   - ECH (Encrypted Client Hello) not widely deployed

4. **Browser Fingerprinting**
   - Canvas fingerprinting, WebGL signatures
   - Font enumeration, screen resolution
   - Creates unique browser fingerprint
   - Links sessions across IP changes

5. **WebRTC IP Leaks**
   - WebRTC exposes real IP even through VPN
   - STUN servers reveal local network info
   - Enables de-anonymization

**Solutions:**

- ✅ **Tor Browser recommendation** (HIGH PRIORITY)
  - Hides IP from server and ISP
  - Provides strong anonymity
  - Trade-off: Slower, some UX friction
  - Document setup in UI prominently

- ✅ **Onion service (.onion domain)** (BEST SOLUTION)
  - End-to-end Tor routing
  - No DNS queries, no SNI leak, no IP exposure
  - Accessible only via Tor Browser
  - Strongest network privacy possible

- ✅ **VPN recommendation**
  - Better than nothing, easier than Tor
  - Trade-off: VPN provider sees all traffic
  - Still vulnerable to many attacks

- ✅ **Disable all server logging**
  - No access logs, no IP logs
  - Cloudflare/CDN logging still exists
  - Consider self-hosted or privacy-focused CDN

- ✅ **Anti-fingerprinting measures**
  - Disable or restrict WebRTC
  - Minimal JavaScript tracking
  - No third-party scripts (Google Analytics, etc.)
  - Privacy-respecting error tracking only

- ✅ **No analytics or telemetry**
  - Don't use Google Analytics, Mixpanel, etc.
  - Self-hosted privacy-respecting analytics only
  - Or no analytics at all

#### C. Wallet & RPC Privacy

**Problems:**

1. **Wallet Adapter Tracking**
   - Leo Wallet, Provable Wallet may log connections
   - Knows: wallet address, dApp visited, actions taken
   - Can correlate user across dApps

2. **RPC Node Tracking**
   - Wallet queries public RPC for balances, transactions
   - RPC node sees: wallet address, IP, query patterns
   - Can build profile of wallet activity

3. **Wallet Fingerprinting**
   - Wallet version, extension ID, settings
   - Enabled dApps list
   - Creates unique wallet fingerprint

**Solutions:**

- ✅ **Self-hosted RPC node** - run own Aleo node
  - No reliance on public RPC nodes
  - Full privacy for RPC queries
  - Trade-off: Expensive, technical expertise required

- ✅ **Privacy-preserving RPC service**
  - Use RPC that doesn't log or mixes requests
  - Examples: RPCh, HOPR, or similar
  - Provides anonymity for RPC queries

- ✅ **Wallet privacy mode education**
  - Recommend privacy-focused wallets
  - Disable wallet telemetry
  - Use multiple wallets for different purposes

- ✅ **Local light client**
  - App runs local Aleo light client
  - Syncs directly with network, no RPC needed
  - Best privacy but high complexity

---

### IV. Economic & Game-Theoretic Attacks

#### A. Front-Running

**Problem:**

- Adversary observes pending bet transaction in mempool
- Places bet ahead of victim to move price
- Victim gets worse execution price
- Adversary profits from price manipulation

**Solutions:**

- ✅ **Private mempool** - bets not visible before inclusion
  - Requires network-level privacy features
  - Or use private relay/sequencer

- ✅ **Batch execution** - all bets in block at same price
  - Fair ordering, no front-running possible
  - Requires protocol design change

- ✅ **Commit-reveal scheme**
  - Step 1: Commit to bet (hash)
  - Step 2: Reveal bet details
  - Two-step process: poor UX
  - Prevents front-running but adds latency

#### B. Market Manipulation via Deanonymization

**Problem:**

- Attacker identifies large bettor ("whale")
- Uses whale's bets as signal
- Copies positions or bets adversarially
- Whale loses edge, possibly stops participating

**Solutions:**

- ✅ **Hide bet sizes** - via reserve noise, batching
  - Prevents identifying large bets
  - Reduces signal value

- ✅ **Hide timing** - via delayed submission
  - Breaks correlation with market events
  - Makes whale bets less useful as signal

- ✅ **Decoy trading** - protocol places fake bets
  - Creates noise in bet stream
  - Harder to identify real whales

---

## Priority Recommendations

### 🔴 Critical (Implement Immediately)

1. **Stop using USDCx** → Switch to ALEO credits
   - USDCx compliance key is catastrophic vulnerability
   - All bets currently decryptable by authorities
   - Accept volatility for privacy

2. **Remove or encrypt trades table**
   - Linking `tx_hash` to `market_id` breaks privacy
   - Either don't store, or encrypt client-side
   - Critical correlation vector

3. **Disable all server logging**
   - No IP logs, no access logs
   - Deploy .onion service for Tor users
   - Self-host or use privacy CDN

4. **Increase bet timing jitter**
   - 5-30 min random delay before submission
   - Breaks timing correlation attacks
   - Accept UX trade-off for privacy

### 🟡 High Priority (Implement Soon)

5. **Fixed denomination betting**
   - Only allow: 1, 5, 10, 50, 100 USDCx (or ALEO)
   - Creates strong anonymity sets
   - Reduces fingerprintability

6. **Batched market payouts**
   - Payout multiple markets simultaneously
   - Use 10-60 min jitter for payouts
   - Breaks market-to-payout correlation

7. **Anti-fingerprinting hardening**
   - Disable WebRTC in app
   - No third-party analytics
   - Document Tor Browser setup prominently

8. **Wallet privacy education**
   - In-app guide for privacy best practices
   - Recommend hardware wallets
   - Explain risks clearly

### 🟢 Medium Priority (Future Enhancements)

9. **Aggregated reserve updates**
   - Batch 10-100 bets before updating reserves
   - Requires zkProof or trusted relayer
   - Significant dev effort but high privacy gain

10. **Decentralized database migration**
    - Move away from centralized Supabase
    - Or implement client-side encryption
    - Long-term architectural change

11. **Privacy-preserving RPC**
    - Integrate with privacy RPC service
    - Or encourage users to run own nodes
    - Reduces RPC tracking vector

### 🔵 Low Priority (Research & Explore)

12. **CoinJoin-style mixing**
    - Coordinate multi-user bet batching
    - Very high complexity
    - Evaluate cost/benefit

13. **Commit-reveal betting**
    - Two-phase bet submission
    - Prevents front-running
    - Poor UX, evaluate need

14. **Noisy reserve updates**
    - Protocol places decoy bets
    - Ongoing gas costs
    - Evaluate effectiveness

---

## Trade-Off Analysis

| Solution                    | Privacy Gain | UX Cost       | Dev Cost | Gas Cost | Priority    |
| --------------------------- | ------------ | ------------- | -------- | -------- | ----------- |
| ALEO (not USDCx)            | ⭐⭐⭐       | ⚠️ Volatility | ✅ Low   | ✅ Low   | 🔴 Critical |
| Remove trades table         | ⭐⭐⭐       | ⚠️ Med        | ⚠️ Med   | ✅ Low   | 🔴 Critical |
| Disable logging + .onion    | ⭐⭐⭐       | ⚠️ Med        | ⚠️ Med   | ✅ Low   | 🔴 Critical |
| Bet timing jitter (5-30min) | ⭐⭐         | ❌ High       | ✅ Low   | ✅ Low   | 🔴 Critical |
| Fixed denominations         | ⭐⭐         | ⚠️ Med        | ✅ Low   | ✅ Low   | 🟡 High     |
| Batched payouts             | ⭐⭐         | ✅ Low        | ✅ Low   | ✅ Low   | 🟡 High     |
| Anti-fingerprinting         | ⭐⭐         | ✅ Low        | ✅ Low   | ✅ Low   | 🟡 High     |
| Aggregated reserves         | ⭐⭐⭐       | ⚠️ Med        | ❌ High  | ⚠️ Med   | 🟢 Medium   |
| Decentralized DB            | ⭐⭐⭐       | ❌ High       | ❌ High  | ✅ Low   | 🟢 Medium   |
| CoinJoin mixing             | ⭐⭐⭐       | ❌ High       | ❌ High  | ❌ High  | 🔵 Low      |

---

## Implementation Notes

- Privacy is a **spectrum**, not binary
- Perfect privacy likely requires unacceptable UX trade-offs
- Focus on **high-impact, low-cost** solutions first
- Educate users about privacy limitations honestly
- Consider **privacy tiers** (casual vs paranoid mode)
- Monitor threat landscape and adapt
- Privacy features should be **opt-in** with clear explanations

## Open Questions

1. Can we build a privacy-preserving stablecoin without compliance keys?
2. Is there a way to do CPMM pricing with private reserves?
3. What is acceptable bet delay for privacy vs UX?
4. Should we offer different privacy levels (tiered approach)?
5. How to handle regulatory compliance with strong privacy?
