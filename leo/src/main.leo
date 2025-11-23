// The 'leo' program.
program obsidian_market.aleo {
    // This is the constructor for the program.
    // The constructor allows you to manage program upgrades.
    // It is called when the program is deployed or upgraded.
    // It is currently configured to **prevent** upgrades.
    // Other configurations include:
    //  - @admin(address="aleo1...")
    //  - @checksum(mapping="credits.aleo/fixme", key="0field")
    //  - @custom
    // For more information, please refer to the documentation: `https://docs.leo-lang.org/guides/upgradability`
    @admin(address="aleo12jwjgr6uvlydcgjlguyhlp6rfgntnyx7hk5g8k5dllqpjtdngcqqcrhmfj")
    async constructor() {}

    // Market status: 0 = open, 1 = closed, 2 = resolved, 3 = cancelled
    // Market struct structure (structs can be stored in mappings)
    struct Market {
        id: u64,
        creator: address,
        market_type: u8,  // 1 = cpmm
        yes_reserves: u64,  // PUBLIC - required for pricing
        no_reserves: u64,   // PUBLIC - required for pricing
        status: u8,
    }

    // Bet struct structure (structs can be stored in mappings)
    struct Bet {
        market_id: u64,
        user: address,
        amount: u64,
        side: bool, // true = Yes, false = No
    }

    // Mappings to store market and bet data
    mapping markets: u64 => Market;
    mapping bets: u64 => Bet;
    mapping market_counter: u64 => u64;

    // Constants
    const MARKET_STATUS_OPEN: u8 = 0u8;
    const MARKET_STATUS_CLOSED: u8 = 1u8;
    const MARKET_STATUS_RESOLVED: u8 = 2u8;
    const MARKET_STATUS_CANCELLED: u8 = 3u8;
    // ? should min bet amount be decided per market or is that against AMM?
    const MIN_BET_AMOUNT: u64 = 1000000u64; // 1 ALEO in microcredits
    // ? should there be a maximum bet, which only applies if provided?

    // Create a new market (admin only)
    transition create_market(
        public market_id: u64,
        public yes_odds: u64,
        public no_odds: u64
    ) -> Market {
        // Validate admin (caller must be admin)
        // Note: In production, you'd check against an admin list
        // For MVP, we'll use the program admin address
        let caller: address = self.caller;
        
        // Create new market struct
        // For CPMM: yes_odds and no_odds are initial reserves (liquidity)
        let market: Market = Market {
            id: market_id,
            creator: caller,
            market_type: 1u8,  // 1 = CPMM market type
            yes_reserves: yes_odds,  // Initial YES reserve (liquidity)
            no_reserves: no_odds,    // Initial NO reserve (liquidity)
            status: MARKET_STATUS_OPEN,
        };

        // Store market in mapping
        markets[market_id] = market;

        return market;
    }

    // Public transition - anyone can call
    transition get_market(public market_id: u64) -> Market {
        let market: Market = markets.get(market_id);
        return market;  // Returns PUBLIC data
    }

    // Place a bet on a market
    transition place_bet_cpmm(
        public market_id: u64,           // Public (needed to identify market)
        // Records MUST be passed as parameters in Aleo - this is correct
        credit_record: credits.aleo/credits.record,  // PRIVATE - user's credit record to spend
        private side: bool,               // PRIVATE - user's bet direction hidden
    ) -> (BetRecord, Future) {
        // 1. Extract amount from credit record (private)
        let amount = credit_record.microcredits;
        
        // 2. Get current PUBLIC reserves (can read public state)
        let market: Market = markets.get(market_id);
        let current_yes_reserves = market.yes_reserves;
        let current_no_reserves = market.no_reserves;
        
        // 3. Calculate shares using CPMM formula (private computation)
        // TODO: Design this logic with extensibility for non-binary markets (e.g., 3+ options)
        let (new_yes_reserves, new_no_reserves, shares_out) = calculate_cpmm_swap(
            current_yes_reserves,
            current_no_reserves,
            amount,
            side
        );
        
        // 4. Create new PRIVATE record for user (represents their shares)
        // shares_out is what they RECEIVE (shares in the market), not what they put in
        // They put in: amount (credits)
        // They receive: shares_out (shares representing their position)
        let bet_record = BetRecord {
            owner: self.caller,  // Private - user's address
            market_id: market_id,
            shares: shares_out,  // Private - shares they receive (not what they put in)
            side: side,          // Private - their bet direction
        };
        
        // 5. Return Future for async public state update
        // The async function will update public reserves on-chain
        let future = update_market_reserves(market_id, new_yes_reserves, new_no_reserves);
        
        return (bet_record, future);
    }

    // Get bet information
    transition get_bet(public bet_id: u64) -> Bet {
        let bet: Bet = bets.get(bet_id);
        return bet;
    }
}
