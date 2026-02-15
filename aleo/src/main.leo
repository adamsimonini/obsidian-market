import test_usdcx_stablecoin.aleo;

program obsidian_market_v2.aleo {
    @admin(address="aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv")
    async constructor() {}

    // --- Structs ---

    // Market data (public on-chain state)
    // Status: 0 = open, 1 = closed, 2 = resolved, 3 = cancelled
    struct Market {
        id: u64,
        creator: address,
        market_type: u8,        // 1 = CPMM
        yes_reserves: u128,     // USDCx micro-units
        no_reserves: u128,      // USDCx micro-units
        status: u8,
        winning_side: bool,     // Set at resolution
    }

    // Private record representing a user's bet position
    record BetRecord {
        owner: address,
        market_id: u64,
        shares: u128,           // USDCx-denominated shares
        side: bool,             // true = Yes, false = No
    }

    // --- Mappings ---

    mapping markets: u64 => Market;
    mapping market_counter: u64 => u64;

    // --- Constants ---

    const MARKET_STATUS_OPEN: u8 = 0u8;
    const MARKET_STATUS_CLOSED: u8 = 1u8;
    const MARKET_STATUS_RESOLVED: u8 = 2u8;
    const MARKET_STATUS_CANCELLED: u8 = 3u8;
    const MIN_BET_AMOUNT: u128 = 1_000_000u128; // 1 USDCx (6 decimals)

    // Treasury: admin wallet that holds the USDCx pool
    const TREASURY: address = aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv;

    // --- Helper Functions ---

    // CPMM swap for binary market (Yes/No)
    // Formula: x * y = k (constant product)
    // Returns: (new_yes_reserves, new_no_reserves, shares_out)
    inline calculate_cpmm_swap(
        current_yes: u128,
        current_no: u128,
        amount_in: u128,
        side: bool,
    ) -> (u128, u128, u128) {
        let k: u128 = current_yes * current_no;

        let new_yes: u128 = side ? (current_yes + amount_in) : (k / (current_no + amount_in));
        let new_no: u128 = side ? (k / (current_yes + amount_in)) : (current_no + amount_in);

        let shares_out: u128 = side
            ? (amount_in * current_no) / (current_yes + amount_in)
            : (amount_in * current_yes) / (current_no + amount_in);

        return (new_yes, new_no, shares_out);
    }

    // Default market for get_or_use lookups
    inline default_market() -> Market {
        let default_creator: address = aleo12jwjgr6uvlydcgjlguyhlp6rfgntnyx7hk5g8k5dllqpjtdngcqqcrhmfj;
        return Market {
            id: 0u64,
            creator: default_creator,
            market_type: 0u8,
            yes_reserves: 0u128,
            no_reserves: 0u128,
            status: 0u8,
            winning_side: false,
        };
    }

    // --- Transitions ---

    // Create a new market (admin only)
    async transition create_market(
        public market_id: u64,
        public yes_reserves: u128,
        public no_reserves: u128,
    ) -> Future {
        let market: Market = Market {
            id: market_id,
            creator: self.caller,
            market_type: 1u8,
            yes_reserves: yes_reserves,
            no_reserves: no_reserves,
            status: MARKET_STATUS_OPEN,
            winning_side: false,
        };

        return finalize_create_market(market_id, market);
    }

    async function finalize_create_market(
        public market_id: u64,
        public market: Market,
    ) {
        markets.set(market_id, market);
    }

    // Place a bet using USDCx
    // amount is PUBLIC (needed for USDCx transfer)
    // side is PRIVATE (user's bet direction stays hidden)
    async transition place_bet_cpmm(
        public market_id: u64,
        public current_yes_reserves: u128,
        public current_no_reserves: u128,
        public amount: u128,
        private side: bool,
    ) -> (BetRecord, Future) {
        // 1. Validate minimum bet
        assert(amount >= MIN_BET_AMOUNT);

        // 2. Calculate CPMM swap
        let (new_yes, new_no, shares_out): (u128, u128, u128) = calculate_cpmm_swap(
            current_yes_reserves,
            current_no_reserves,
            amount,
            side,
        );

        // 3. Create private bet record
        let bet: BetRecord = BetRecord {
            owner: self.signer,
            market_id: market_id,
            shares: shares_out,
            side: side,
        };

        // 4. Collect USDCx from user → treasury
        let payment_future: Future = test_usdcx_stablecoin.aleo/transfer_public_as_signer(
            TREASURY,
            amount,
        );

        // 5. Update reserves on-chain
        return (bet, finalize_place_bet(
            market_id,
            new_yes,
            new_no,
            current_yes_reserves,
            current_no_reserves,
            payment_future,
        ));
    }

    async function finalize_place_bet(
        public market_id: u64,
        public new_yes_reserves: u128,
        public new_no_reserves: u128,
        public expected_yes_reserves: u128,
        public expected_no_reserves: u128,
        payment_future: Future,
    ) {
        payment_future.await();

        let market: Market = markets.get_or_use(market_id, default_market());
        assert(market.id != 0u64);
        assert(market.status == MARKET_STATUS_OPEN);
        assert(market.yes_reserves == expected_yes_reserves);
        assert(market.no_reserves == expected_no_reserves);

        markets.set(market_id, Market {
            id: market.id,
            creator: market.creator,
            market_type: market.market_type,
            yes_reserves: new_yes_reserves,
            no_reserves: new_no_reserves,
            status: market.status,
            winning_side: market.winning_side,
        });
    }

    // Resolve a market — admin declares the winning side
    async transition resolve_market(
        public market_id: u64,
        public winning_side: bool,
    ) -> Future {
        return finalize_resolve_market(market_id, winning_side, self.caller);
    }

    async function finalize_resolve_market(
        public market_id: u64,
        public winning_side: bool,
        public caller: address,
    ) {
        assert(caller == TREASURY);

        let market: Market = markets.get_or_use(market_id, default_market());
        assert(market.id != 0u64);
        assert(market.status == MARKET_STATUS_OPEN || market.status == MARKET_STATUS_CLOSED);

        markets.set(market_id, Market {
            id: market.id,
            creator: market.creator,
            market_type: market.market_type,
            yes_reserves: market.yes_reserves,
            no_reserves: market.no_reserves,
            status: MARKET_STATUS_RESOLVED,
            winning_side: winning_side,
        });
    }

    // Claim winnings — consumes BetRecord and pays out USDCx
    // BetRecord can only be spent once (no double claims)
    // Payout = shares (1 winning share = 1 USDCx micro-unit)
    async transition claim_winnings(
        private bet: BetRecord,
        public payout: u128,
    ) -> Future {
        assert(payout == bet.shares);

        // Transfer USDCx from treasury to user
        // Admin must have pre-approved this program as a spender
        let payout_future: Future = test_usdcx_stablecoin.aleo/transfer_from_public(
            TREASURY,
            bet.owner,
            payout,
        );

        return finalize_claim_winnings(
            bet.market_id,
            bet.side,
            payout_future,
        );
    }

    async function finalize_claim_winnings(
        public market_id: u64,
        public side: bool,
        payout_future: Future,
    ) {
        let market: Market = markets.get_or_use(market_id, default_market());
        assert(market.id != 0u64);
        assert(market.status == MARKET_STATUS_RESOLVED);
        assert(side == market.winning_side);

        payout_future.await();
    }

    // Cancel a market — admin only
    async transition cancel_market(
        public market_id: u64,
    ) -> Future {
        return finalize_cancel_market(market_id, self.caller);
    }

    async function finalize_cancel_market(
        public market_id: u64,
        public caller: address,
    ) {
        assert(caller == TREASURY);

        let market: Market = markets.get_or_use(market_id, default_market());
        assert(market.id != 0u64);
        assert(market.status != MARKET_STATUS_RESOLVED);

        markets.set(market_id, Market {
            id: market.id,
            creator: market.creator,
            market_type: market.market_type,
            yes_reserves: market.yes_reserves,
            no_reserves: market.no_reserves,
            status: MARKET_STATUS_CANCELLED,
            winning_side: market.winning_side,
        });
    }

    // Claim refund for a cancelled market — consumes BetRecord
    async transition claim_refund(
        private bet: BetRecord,
        public refund_amount: u128,
    ) -> Future {
        assert(refund_amount == bet.shares);

        let refund_future: Future = test_usdcx_stablecoin.aleo/transfer_from_public(
            TREASURY,
            bet.owner,
            refund_amount,
        );

        return finalize_claim_refund(
            bet.market_id,
            refund_future,
        );
    }

    async function finalize_claim_refund(
        public market_id: u64,
        refund_future: Future,
    ) {
        let market: Market = markets.get_or_use(market_id, default_market());
        assert(market.id != 0u64);
        assert(market.status == MARKET_STATUS_CANCELLED);

        refund_future.await();
    }
}
