# Aleo Local Development Guide

## Prerequisites

- Leo CLI installed (v3.3.1 or compatible)
- SnarkVM for local execution
- Basic understanding of Aleo/Leo programming

## Setup

### 1. Install Leo CLI

If not already installed:

```bash
# Install via package manager or download from https://leo-lang.org
# Check installation
leo --version
```

### 2. Build the Program

Navigate to the `leo/` directory and build:

```bash
cd leo
leo build
```

This compiles the Leo program and generates:
- `build/main.aleo` - Compiled program
- `build/program.json` - Program metadata

### 3. Run Tests

Test the smart contract functions:

```bash
leo test
```

This runs all tests in `leo/tests/test_leo.leo` and verifies:
- Market creation works
- Bet placement works
- Minimum bet validation
- Market state updates

## Local Development Workflow

### 1. Make Changes

Edit `leo/src/main.leo` to modify the contract.

### 2. Build and Test

```bash
leo build
leo test
```

### 3. Deploy Locally (SnarkVM)

For local testing with SnarkVM:

```bash
# Start local SnarkVM node (if available)
# Deploy contract
leo deploy
```

**Note:** Local SnarkVM setup may vary. Check Aleo documentation for current local development tools.

## Testing Transactions

### Create a Market

```bash
# Example: Create market with ID 1, 2.0x odds for both sides
leo run create_market 1u64 200u64 200u64
```

### Place a Bet

```bash
# Example: Place 1 ALEO bet on Yes side for market 1
leo run place_bet 1u64 true 1000000u64
```

### Query Market State

```bash
# Get market information
leo run get_market 1u64
```

## Program Structure

### Data Structures

- **Market**: Stores market configuration and bet totals
- **Bet**: Stores individual bet information

### Mappings

- `markets`: Maps market_id → Market record
- `bets`: Maps bet_id → Bet record
- `market_counter`: Tracks market IDs (for future use)

### Transitions

- `create_market`: Admin creates new market
- `place_bet`: User places bet on market
- `get_market`: Query market state
- `get_bet`: Query bet information

## Constants

- `MIN_BET_AMOUNT`: 1,000,000 microcredits (1 ALEO)
- Market statuses: 0=Open, 1=Closed, 2=Resolved, 3=Cancelled

## Troubleshooting

### Build Errors

- Check Leo version: `leo --version` (should be 3.3.1)
- Verify syntax matches Leo language spec
- Check for typos in record/mapping names

### Test Failures

- Review test assertions
- Check that market exists before placing bets
- Verify minimum bet amounts

### Deployment Issues

- Ensure SnarkVM is running (if using local node)
- Check network configuration
- Verify admin address is correct

## Next Steps

1. Test all transitions locally
2. Deploy to Aleo testnet (see deployment guide)
3. Integrate with frontend

## Resources

- [Leo Language Documentation](https://developer.aleo.org/leo/)
- [Aleo Documentation](https://developer.aleo.org/)
- [SnarkVM Guide](https://developer.aleo.org/snarkvm/)

