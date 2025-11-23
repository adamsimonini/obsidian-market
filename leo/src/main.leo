// The 'leo' program.
program obsidian_market.aleo {
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

    // Private record for bet positions (users hold these privately)
    // No public bet tracking - maximum privacy
    record BetRecord {
        owner: address,
        market_id: u64,
        shares: u64,
        side: bool,  // true = Yes, false = No
    }

    // Mappings to store market data
    mapping markets: u64 => Market;
    mapping market_counter: u64 => u64;

    // Constants
    const MARKET_STATUS_OPEN: u8 = 0u8;
    const MARKET_STATUS_CLOSED: u8 = 1u8;
    const MARKET_STATUS_RESOLVED: u8 = 2u8;
    const MARKET_STATUS_CANCELLED: u8 = 3u8;
    const MIN_BET_AMOUNT: u64 = 1000000u64; // 1 ALEO in microcredits
    

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
    // Returns Future for async public state update
    async transition place_bet_cpmm(
        public market_id: u64,           // Public (needed to identify market)
        private amount: u64,             // PRIVATE - bet amount
        private side: bool,              // PRIVATE - user's bet direction hidden
    ) -> (BetRecord, Future) {
        // 2. Get current PUBLIC reserves (can read public state)
        let market: Market = markets.get(market_id);
        let current_yes_reserves = market.yes_reserves;
        let current_no_reserves = market.no_reserves;
        
        // 3. Calculate shares using CPMM formula (private computation)
        let (new_yes_reserves, new_no_reserves, shares_out) = calculate_cpmm_swap(
            current_yes_reserves,
            current_no_reserves,
            amount,
            side
        );
        
        // create a new bet record, which ais a private record that represents the user's shares
        // all records beleong to a user and are associated with a market
        let bet_record = BetRecord {
            market_id: market_id,
            owner: self.caller,  // Private - user's address
            shares: shares_out,  // Private - shares they receive (not what they put in)
            side: side,          // Private - their bet direction
        };
        
        // The async function will update public reserves on-chain
        let future = update_market_reserves(market_id, new_yes_reserves, new_no_reserves);
        
        return (bet_record, future);
    }

    // Calculate CPMM swap for binary market (Yes/No)
    // CPMM formula: x * y = k (constant product)
    // Returns: (new_yes_reserves, new_no_reserves, shares_out)
    function calculate_cpmm_swap(
        current_yes: u64,
        current_no: u64,
        amount_in: u64,
        side: bool  // true = betting Yes, false = betting No
    ) -> (u64, u64, u64) {
        // Calculate constant product k = x * y
        let k: u64 = current_yes * current_no;
        
        if side {
            // Betting on Yes: add amount to yes_reserves
            let new_yes: u64 = current_yes + amount_in;
            
            // Maintain constant product: k = new_yes * new_no
            // new_no = k / new_yes
            let new_no: u64 = k / new_yes;
            
            // Calculate shares received using CPMM formula
            // Shares = (amount_in * current_no) / new_yes
            let shares_out: u64 = (amount_in * current_no) / new_yes;
            
            return (new_yes, new_no, shares_out);
        } else {
            // Betting on No: add amount to no_reserves
            let new_no: u64 = current_no + amount_in;
            
            // Maintain constant product: k = new_yes * new_no
            // new_yes = k / new_no
            let new_yes: u64 = k / new_no;
            
            // Calculate shares received using CPMM formula
            // Shares = (amount_in * current_yes) / new_no
            let shares_out: u64 = (amount_in * current_yes) / new_no;
            
            return (new_yes, new_no, shares_out);
        }
    }

    // Async function to update PUBLIC reserves on-chain
    async function update_market_reserves(
        market_id: u64,
        new_yes_reserves: u64,
        new_no_reserves: u64
    ) -> Market {
        // This executes on-chain after private transition proof is verified
        let market: Market = markets.get(market_id);
        
        // Update PUBLIC pool state with new reserves
        markets[market_id] = Market {
            id: market.id,  
            creator: market.creator,
            market_type: market.market_type,
            yes_reserves: new_yes_reserves,  // PUBLIC update
            no_reserves: new_no_reserves,    // PUBLIC update
            status: market.status,
        };
        
        return markets[market_id];
    }

}
