import obsidian_market.aleo;

program test_leo.aleo {
    // Test market creation
    @test
    async transition test_create_market() -> Future {
        let market_id: u64 = 1u64;
        let yes_reserves: u64 = 50000000u64;
        let no_reserves: u64 = 50000000u64;

        let f: Future = obsidian_market.aleo/create_market(market_id, yes_reserves, no_reserves);
        return finalize_test_create_market(f);
    }

    async function finalize_test_create_market(f: Future) {
        f.await();
    }

    // Test placing a bet and verify the returned BetRecord
    @test
    async transition test_place_bet() -> Future {
        let market_id: u64 = 1u64;
        let yes_reserves: u64 = 50000000u64;
        let no_reserves: u64 = 50000000u64;

        // Create market first
        let create_future: Future = obsidian_market.aleo/create_market(market_id, yes_reserves, no_reserves);

        // Place a Yes bet
        let amount: u64 = 1000000u64; // 1 ALEO
        let side: bool = true;
        let (bet_record, bet_future): (obsidian_market.aleo/BetRecord, Future) = obsidian_market.aleo/place_bet_cpmm(
            market_id, yes_reserves, no_reserves, amount, side
        );

        // Verify bet record fields
        assert_eq(bet_record.market_id, market_id);
        assert_eq(bet_record.side, true);

        return finalize_test_place_bet(create_future, bet_future);
    }

    async function finalize_test_place_bet(create_future: Future, bet_future: Future) {
        create_future.await();
        bet_future.await();
    }

    // Test minimum bet validation - should fail with amount below MIN_BET_AMOUNT
    @test
    @should_fail
    transition test_minimum_bet() {
        let market_id: u64 = 1u64;
        let yes_reserves: u64 = 50000000u64;
        let no_reserves: u64 = 50000000u64;

        // Try to bet less than minimum (1 ALEO = 1000000 microcredits)
        let amount: u64 = 500000u64; // 0.5 ALEO - should fail at assert
        let side: bool = true;
        let (bet_record, bet_future): (obsidian_market.aleo/BetRecord, Future) = obsidian_market.aleo/place_bet_cpmm(
            market_id, yes_reserves, no_reserves, amount, side
        );
    }

    @admin(address="aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv")
    async constructor() {}
}
