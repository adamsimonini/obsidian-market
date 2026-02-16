import obsidian_market.aleo;

program test_leo.aleo {
    // Test market creation
    @test
    async transition test_create_market() -> Future {
        let market_id: u64 = 1u64;
        let yes_reserves: u128 = 50_000_000u128;
        let no_reserves: u128 = 50_000_000u128;

        let f: Future = obsidian_market.aleo/create_market(market_id, yes_reserves, no_reserves);
        return finalize_test_create_market(f);
    }

    async function finalize_test_create_market(f: Future) {
        f.await();
    }

    // Test market resolution
    @test
    async transition test_resolve_market() -> Future {
        let market_id: u64 = 2u64;
        let yes_reserves: u128 = 50_000_000u128;
        let no_reserves: u128 = 50_000_000u128;

        let create_future: Future = obsidian_market.aleo/create_market(market_id, yes_reserves, no_reserves);
        let resolve_future: Future = obsidian_market.aleo/resolve_market(market_id, true);

        return finalize_test_resolve_market(create_future, resolve_future);
    }

    async function finalize_test_resolve_market(create_future: Future, resolve_future: Future) {
        create_future.await();
        resolve_future.await();
    }

    // Test market cancellation
    @test
    async transition test_cancel_market() -> Future {
        let market_id: u64 = 3u64;
        let yes_reserves: u128 = 50_000_000u128;
        let no_reserves: u128 = 50_000_000u128;

        let create_future: Future = obsidian_market.aleo/create_market(market_id, yes_reserves, no_reserves);
        let cancel_future: Future = obsidian_market.aleo/cancel_market(market_id);

        return finalize_test_cancel_market(create_future, cancel_future);
    }

    async function finalize_test_cancel_market(create_future: Future, cancel_future: Future) {
        create_future.await();
        cancel_future.await();
    }

    // Note: place_bet_cpmm, claim_winnings, claim_refund tests require
    // test_usdcx_stablecoin.aleo deployed to ledger (only works on testnet,
    // not locally — merkle_tree.aleo lacks constructor for ConsensusVersion V9)

    @admin(address="aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv")
    async constructor() {}
}
