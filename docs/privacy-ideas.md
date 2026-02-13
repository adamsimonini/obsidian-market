# Privacy Ideas for Obsidian Market

**Threat baseline**: AVK compromise = 100% bet history exposure. Private fees eliminate payer-address linkage (biggest metadata leak). [Tornado Cash research](https://arxiv.org/html/2510.09433v2) shows 15–37% deanonymization from behavioral patterns; Aleo faces similar risks.

## 1. What the Smart Contract Can Do

**Blinded market IDs** — Store a hiding commitment instead of plaintext `market_id`. An AVK leak reveals shares but not *which* market without the salt.

```leo
let salt: scalar = ChaCha::rand_scalar();
let blinded_id: field = BHP256::commit_to_field(market_id, salt);

record BetRecord {
    owner: address,
    blinded_market_id: field,  // hiding commitment
    salt: scalar,              // only holder can reveal
    shares: u64,
    side: bool,
}
```

**Private-only transitions** — Accept private credits so `amount`/`side` stay off-chain ([`commit.bhp256`](https://developer.aleo.org/guides/aleo/opcodes/)).

## 2. What the User Can Do

- **Ephemeral accounts** — One address per market; blast radius ≈ 1 market per compromised key ([AVK vs TVK model](https://aleo.org/post/aleo-view-key-compliance/)).
- **Private fee payment** — Hides payer address on-chain ([Transaction Fees docs](https://developer.aleo.org/concepts/fundamentals/transaction_fees)).
- **Key rotation** — Transfer records to a fresh account after large positions; limits exposure window.

## 3. What the Frontend Can Do

- **Local proving only** — Never delegate; delegation leaks inputs to the prover ([Delegate Proving](https://developer.aleo.org/sdk/delegate-proving/delegate_proving/)).
- **Proxy relay** — Submit transactions via relay/VPN so the RPC node can't link IP to address.
- **Multi-account UX** — Manage ephemeral sub-accounts per market seamlessly in the wallet UI.

## 4. What the Platform Can Do

- **Fee sponsorship** — A relayer pays fees with private credits, breaking the payer ↔ bettor link.
- **Sub-wallet SDK** — HD-style child keys per market; one compromise ≠ total exposure.
- **Batched settlement** — Aggregate redemptions into one proof, hiding individual claim patterns.

## 5. Prioritized Roadmap

| Timeframe | Action | Impact |
|-----------|--------|--------|
| Month 1 | Private fee payment + local-only proving | Eliminates address and IP linkage |
| Month 2 | Blinded `market_id` via `commit.bhp256`; ephemeral account UX | AVK leak hides which market |
| Month 3 | Fee sponsorship relayer; batched settlement | Full metadata isolation |

---

## Appendix: Deep Dive on Key Concepts

### What is AVK Leak?

**AVK = Account View Key**. Every Aleo account has:
- **Private key** (signs transactions)
- **Account View Key (AVK)** (decrypts ALL private records owned by that account)
- **Transaction View Keys (TVKs)** (per-transaction, limited scope)

If your AVK leaks (like the [Puzzle Wallet incident](https://www.leo.app/blog/attention-puzzle-aleo-wallet-on-chrome-compromises-user-privacy-new-private-keys-needed-to-preserve-privacy)), an attacker can decrypt your entire transaction history—every `BetRecord` you've ever received, revealing `market_id`, `shares`, `side`, `amount` inputs, timestamps. **100% betting history exposure** for that account.

### Blinded Market ID Architecture

**Current architecture (no blinding):**

```
Backend DB: market_id: 42, title: "Will BTC hit $100k?"
On-chain Market (PUBLIC): market_id: 42, yes_reserves: 5M, no_reserves: 3M
On-chain BetRecord (PRIVATE): market_id: 42 ← plaintext, readable if AVK leaks
```

**Problem**: AVK leak exposes which market you bet on.

**Blinded architecture:**

```
Backend DB: market_id: 42 (still plaintext for queries)
On-chain Market (PUBLIC): market_id: 42 (still public, needed for AMM)
On-chain BetRecord (PRIVATE): blinded_market_id: 0x7a3f..., salt: 0x9b2c...
```

When placing a bet, smart contract commits:

```leo
let blinded_id: field = BHP256::commit_to_field(market_id, salt);
```

**Volume tracking is unaffected**: The public `Market` struct already reveals total volume (`yes_reserves + no_reserves`). Blinding only hides which individual users bet on which markets.

### Weak vs Strong Blinding

**Weak (salt in record)**: If AVK leaks, attacker sees both `blinded_id` and `salt`. They brute-force 100 markets in milliseconds:

```
BHP256::commit_to_field(1, salt) == blinded_id? No.
BHP256::commit_to_field(42, salt) == blinded_id? Yes! ✓
```

**Strong (salt NOT in record)**: User stores salt locally (encrypted browser storage). To redeem, provide `(blinded_id, salt, market_id)` as witness; contract verifies commitment. If AVK leaks, attacker must brute-force a 253-bit scalar space—infeasible.

**Tradeoff**: Strong blinding requires users to manage salts securely (if lost, can't redeem). Complex UX.

### Platform Components Explained

- **Fee sponsorship**: Obsidian relayer pays transaction fees with private credits. Observer sees fee paid but can't determine who placed the bet.
- **Sub-wallet SDK**: Like HD wallets, generate child keys from master key. Each market gets its own address. If one AVK leaks, only that market's history is exposed.
- **Batched settlement**: When multiple users redeem, aggregate into a single ZK proof. Observer sees "N users redeemed," not per-user breakdown.

### Recommendation for MVP

**Skip blinding initially**—marginal gain with few markets, complex UX. Focus on:
1. **Ephemeral accounts** (one address per market category)
2. **Private fee payment** (biggest metadata leak elimination)

Revisit blinding with salt-in-client-storage if you scale to millions of users with regulatory/privacy demands.

---

**Sources**: [Transaction Fees](https://developer.aleo.org/concepts/fundamentals/transaction_fees) · [Transitions](https://developer.aleo.org/concepts/fundamentals/transitions) · [Records](https://developer.aleo.org/concepts/fundamentals/records) · [Opcodes](https://developer.aleo.org/guides/aleo/opcodes/) · [Puzzle Wallet AVK leak](https://www.leo.app/blog/attention-puzzle-aleo-wallet-on-chrome-compromises-user-privacy-new-private-keys-needed-to-preserve-privacy) · [View Key Compliance](https://aleo.org/post/aleo-view-key-compliance/) · [zPass hiding program](https://zpass.docs.aleo.org/zpass-programs/zpass-hiding-program) · [Tornado Cash clustering](https://arxiv.org/html/2510.09433v2) · [Delegate Proving](https://developer.aleo.org/sdk/delegate-proving/delegate_proving/)
