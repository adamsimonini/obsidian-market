/**
 * Aleo transaction helpers for obsidian_market.aleo
 *
 * These build TransactionOptions that the wallet adapter can sign, prove,
 * and broadcast. Leo Wallet handles ZK proof generation + fee payment.
 */

import type { TransactionOptions } from '@provablehq/aleo-types';

// Program constants
export const PROGRAM_ID = 'obsidian_market_v2.aleo';
export const USDCX_PROGRAM_ID = 'test_usdcx_stablecoin.aleo';

// USDCx has 6 decimals (same as USDC)
export const USDCX_DECIMALS = 6;
export const USDCX_MICRO = 10 ** USDCX_DECIMALS; // 1_000_000

// Aleo explorer API endpoint for querying on-chain state
const ALEO_API = 'https://api.explorer.provable.com/v1';
const ALEO_NETWORK = 'testnet';

// Default fee in microcredits (user pays this via wallet for gas)
const DEFAULT_FEE = 500_000; // 0.5 ALEO in microcredits

/**
 * On-chain market reserves fetched directly from the Aleo mapping.
 */
export interface OnchainReserves {
  yesReserves: number;
  noReserves: number;
}

/**
 * Fetch the current reserves for a market directly from the on-chain mapping.
 * This is the source of truth — always use these values for transaction inputs.
 *
 * @param marketId - The on-chain market ID (u64)
 * @returns The current reserves, or null if the market doesn't exist on-chain
 */
export async function fetchOnchainReserves(marketId: number): Promise<OnchainReserves | null> {
  const url = `${ALEO_API}/${ALEO_NETWORK}/program/${PROGRAM_ID}/mapping/markets/${marketId}u64`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const body = await res.text();
  if (!body || body === 'null') return null;

  // Reserves are now u128 in the updated contract
  const yesMatch = body.match(/yes_reserves:\s*(\d+)u128/);
  const noMatch = body.match(/no_reserves:\s*(\d+)u128/);

  if (!yesMatch || !noMatch) return null;

  return {
    yesReserves: parseInt(yesMatch[1], 10),
    noReserves: parseInt(noMatch[1], 10),
  };
}

/**
 * Fetch the public USDCx balance for an address.
 * Reads from test_usdcx_stablecoin.aleo/mapping/balances/{address}
 *
 * @returns Balance in micro-units, or null if not found
 */
export async function fetchUsdcxBalance(address: string): Promise<number | null> {
  const url = `${ALEO_API}/${ALEO_NETWORK}/program/${USDCX_PROGRAM_ID}/mapping/balances/${address}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return 0;

    const text = await res.text();
    if (!text || text === 'null') return 0;

    const match = text.match(/(\d+)u128/);
    if (!match) return 0;

    return parseInt(match[1], 10);
  } catch {
    return null;
  }
}

/**
 * Build TransactionOptions for place_bet_cpmm.
 *
 * Smart contract signature:
 *   async transition place_bet_cpmm(
 *     public market_id: u64,
 *     public current_yes_reserves: u128,
 *     public current_no_reserves: u128,
 *     public amount: u128,       // USDCx micro-units
 *     private side: bool,        // true = Yes, false = No
 *   ) -> (BetRecord, Future)
 */
export function buildPlaceBetTransaction(params: {
  marketId: number;
  currentYesReserves: number;
  currentNoReserves: number;
  /** Bet amount in USDCx micro-units (u128) */
  amount: number;
  /** true = Yes, false = No */
  side: boolean;
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
      `${currentYesReserves}u128`,
      `${currentNoReserves}u128`,
      `${amount}u128`,
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
 *     public yes_reserves: u128,
 *     public no_reserves: u128,
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
      `${yesReserves}u128`,
      `${noReserves}u128`,
    ],
    fee,
    privateFee: false,
  };
}

/**
 * Build TransactionOptions for resolve_market (admin only).
 */
export function buildResolveMarketTransaction(params: {
  marketId: number;
  winningSide: boolean;
  fee?: number;
}): TransactionOptions {
  const { marketId, winningSide, fee = DEFAULT_FEE } = params;

  return {
    program: PROGRAM_ID,
    function: 'resolve_market',
    inputs: [
      `${marketId}u64`,
      `${winningSide}`,
    ],
    fee,
    privateFee: false,
  };
}

/**
 * Build TransactionOptions for USDCx transfer_public_to_private (shield).
 * Converts public USDCx balance to a private Token record.
 */
export function buildShieldUsdcxTransaction(params: {
  recipient: string;
  /** Amount in USDCx micro-units */
  amount: number;
  fee?: number;
}): TransactionOptions {
  const { recipient, amount, fee = DEFAULT_FEE } = params;

  return {
    program: USDCX_PROGRAM_ID,
    function: 'transfer_public_to_private',
    inputs: [
      recipient,
      `${amount}u128`,
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
