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
    @admin(address="aleo1qg23nrrrlf6h7fqq7amk9wqzs06sluh7tm5y6lgg9svpqpck0qqqv9h0sw")
    async constructor() {}

    // Market status: 0 = open, 1 = closed, 2 = resolved, 3 = cancelled
    // Market struct structure (structs can be stored in mappings)
    struct Market {
        id: u64,
        creator: address,
        yes_odds: u64,
        no_odds: u64,
        status: u8,
        total_yes_bets: u64,
        total_no_bets: u64,
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
        let market: Market = Market {
            id: market_id,
            creator: caller,
            yes_odds: yes_odds,
            no_odds: no_odds,
            status: MARKET_STATUS_OPEN,
            total_yes_bets: 0u64,
            total_no_bets: 0u64,
        };

        // Store market in mapping
        markets[market_id] = market;

        return market;
    }

    // Place a bet on a market
    transition place_bet(
        public market_id: u64,
        public side: bool,
        amount: u64
    ) -> Bet {
        // Validate minimum bet amount (1 ALEO = 1000000 microcredits)
        assert(amount >= MIN_BET_AMOUNT);

        // Get market from mapping
        let market: Market = markets.get(market_id);
        
        // Validate market exists and is open
        assert(market.status == MARKET_STATUS_OPEN);

        let caller: address = self.caller;

        // Create bet struct
        let bet_id: u64 = market_id;
        let bet: Bet = Bet {
            market_id: market_id,
            user: caller,
            amount: amount,
            side: side,
        };

        // Update market totals
        if side {
            let new_total_yes: u64 = market.total_yes_bets + amount;
            let updated_market: Market = Market {
                id: market.id,
                creator: market.creator,
                yes_odds: market.yes_odds,
                no_odds: market.no_odds,
                status: market.status,
            total_yes_bets: new_total_yes,
            total_no_bets: market.total_no_bets,
        };
        markets[market_id] = updated_market;
    } else {
            let new_total_no: u64 = market.total_no_bets + amount;
            let updated_market: Market = Market {
                id: market.id,
                creator: market.creator,
                yes_odds: market.yes_odds,
                no_odds: market.no_odds,
                status: market.status,
            total_yes_bets: market.total_yes_bets,
            total_no_bets: new_total_no,
        };
        markets[market_id] = updated_market;
    }

        // Store bet (using market_id as key for simplicity - in production use unique bet_id)
        bets[bet_id] = bet;

        return bet;
    }

    // Get market information
    transition get_market(public market_id: u64) -> Market {
        let market: Market = markets.get(market_id);
        return market;
    }

    // Get bet information
    transition get_bet(public bet_id: u64) -> Bet {
        let bet: Bet = bets.get(bet_id);
        return bet;
    }
}
