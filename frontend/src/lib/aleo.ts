/**
 * Aleo transaction helpers for obsidian_market.aleo
 *
 * These build TransactionOptions that the wallet adapter can sign, prove,
 * and broadcast. Leo Wallet handles ZK proof generation + fee payment.
 */

import type { TransactionOptions } from '@provablehq/aleo-types';

// Program constants
export const PROGRAM_ID = 'obsidian_market.aleo';

// Default fee in microcredits (user pays this via wallet)
// 1 ALEO = 1,000,000 microcredits
const DEFAULT_FEE = 500_000; // 0.5 ALEO in microcredits

/**
 * Build TransactionOptions for place_bet_cpmm.
 *
 * Smart contract signature:
 *   async transition place_bet_cpmm(
 *     public market_id: u64,
 *     public current_yes_reserves: u64,
 *     public current_no_reserves: u64,
 *     private amount: u64,    // bet amount in microcredits
 *     private side: bool,     // true = Yes, false = No
 *   ) -> (BetRecord, Future)
 */
export function buildPlaceBetTransaction(params: {
  /** On-chain market ID (u64) */
  marketId: number;
  /** Current YES reserves from the market (u64 microcredits) */
  currentYesReserves: number;
  /** Current NO reserves from the market (u64 microcredits) */
  currentNoReserves: number;
  /** Bet amount in microcredits (u64) */
  amount: number;
  /** true = Yes, false = No */
  side: boolean;
  /** Priority fee in microcredits (optional, default 500_000 = 0.5 ALEO) */
  fee?: number;
}): TransactionOptions {
  const {
    marketId,
    currentYesReserves,
    currentNoReserves,
    amount,
    side,
    fee = DEFAULT_FEE,
  } = params;

  return {
    program: PROGRAM_ID,
    function: 'place_bet_cpmm',
    inputs: [
      `${marketId}u64`,
      `${currentYesReserves}u64`,
      `${currentNoReserves}u64`,
      `${amount}u64`,
      `${side}`,
    ],
    fee,
    privateFee: false,
  };
}

/**
 * Build TransactionOptions for create_market (admin only).
 *
 * Smart contract signature:
 *   async transition create_market(
 *     public market_id: u64,
 *     public yes_odds: u64,
 *     public no_odds: u64
 *   ) -> Future
 */
export function buildCreateMarketTransaction(params: {
  marketId: number;
  yesReserves: number;
  noReserves: number;
  fee?: number;
}): TransactionOptions {
  const { marketId, yesReserves, noReserves, fee = DEFAULT_FEE } = params;

  return {
    program: PROGRAM_ID,
    function: 'create_market',
    inputs: [
      `${marketId}u64`,
      `${yesReserves}u64`,
      `${noReserves}u64`,
    ],
    fee,
    privateFee: false,
  };
}

/**
 * Build a minimal test transaction using credits.aleo transfer_public.
 * Use this to verify the wallet adapter pipeline works independently
 * of obsidian_market.aleo. Pass a recipient address.
 */
export function buildTestTransaction(recipientAddress: string): TransactionOptions {
  return {
    program: 'credits.aleo',
    function: 'transfer_public',
    inputs: [recipientAddress, '100u64'],
    fee: 100_000,
    privateFee: false,
  };
}

/**
 * Poll transaction status until finalized or failed.
 * Returns the final status string.
 */
export async function waitForTransaction(
  pollFn: (txId: string) => Promise<{ status: string; error?: string }>,
  transactionId: string,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<string> {
  const maxAttempts = options?.maxAttempts ?? 60;
  const intervalMs = options?.intervalMs ?? 3000;

  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollFn(transactionId);

    const status = result.status.toLowerCase();

    // Terminal states
    if (status === 'accepted' || status === 'finalized') return result.status;
    if (status === 'rejected') throw new Error(result.error || 'Transaction rejected by network');
    if (status === 'failed') throw new Error(result.error || 'Transaction failed on-chain');

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Transaction confirmation timed out');
}
