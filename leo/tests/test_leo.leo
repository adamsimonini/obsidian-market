// The 'test_leo' test program.
import obsidian_market.aleo;

program test_leo.aleo {
    // Test market creation
    @test
    transition test_create_market() {
        let market_id: u64 = 1u64;
        let yes_odds: u64 = 200u64; // 2.0x
        let no_odds: u64 = 200u64; // 2.0x
        
        let market: obsidian_market.aleo/Market = obsidian_market.aleo/create_market(market_id, yes_odds, no_odds);
        
        assert_eq(market.id, market_id);
        assert_eq(market.yes_odds, yes_odds);
        assert_eq(market.no_odds, no_odds);
        assert_eq(market.status, 0u8); // OPEN
        assert_eq(market.total_yes_bets, 0u64);
        assert_eq(market.total_no_bets, 0u64);
    }

    // Test placing a bet
    @test
    transition test_place_bet() {
        // First create a market
        let market_id: u64 = 1u64;
        let yes_odds: u64 = 200u64;
        let no_odds: u64 = 200u64;
        
        let market: obsidian_market.aleo/Market = obsidian_market.aleo/create_market(market_id, yes_odds, no_odds);
        
        // Place a Yes bet
        let bet_amount: u64 = 1000000u64; // 1 ALEO
        let side: bool = true; // Yes
        let bet: obsidian_market.aleo/Bet = obsidian_market.aleo/place_bet(market_id, side, bet_amount);
        
        assert_eq(bet.market_id, market_id);
        assert_eq(bet.amount, bet_amount);
        assert_eq(bet.side, side);
        
        // Verify market totals updated
        let updated_market: obsidian_market.aleo/Market = obsidian_market.aleo/get_market(market_id);
        assert_eq(updated_market.total_yes_bets, bet_amount);
        assert_eq(updated_market.total_no_bets, 0u64);
    }

    // Test minimum bet validation
    @test
    @should_fail
    transition test_minimum_bet() {
        let market_id: u64 = 1u64;
        let yes_odds: u64 = 200u64;
        let no_odds: u64 = 200u64;
        
        let market: obsidian_market.aleo/Market = obsidian_market.aleo/create_market(market_id, yes_odds, no_odds);
        
        // Try to bet less than minimum (1 ALEO)
        let bet_amount: u64 = 500000u64; // 0.5 ALEO - should fail
        let side: bool = true;
        let bet: obsidian_market.aleo/Bet = obsidian_market.aleo/place_bet(market_id, side, bet_amount);
    }

    @noupgrade
    async constructor() {}
}
