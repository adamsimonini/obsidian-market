'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, ChevronDown, ChevronUp, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { buildPlaceBetTransaction, waitForTransaction, fetchOnchainReserves, USDCX_MICRO } from '@/lib/aleo';
import { cn } from '@/lib/utils';
import type { LocalizedMarket } from '@/types/supabase';

interface BetFormProps {
  market: LocalizedMarket;
  onClose: () => void;
}

function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}

type BetStep = 'idle' | 'signing' | 'confirming' | 'syncing' | 'done';

interface ErrorDetails {
  userMessage: string;
  technicalDetails?: string;
  suggestion?: string;
}

export function BetForm({ market, onClose }: BetFormProps) {
  const t = useTranslations('betForm');
  const tc = useTranslations('common');
  const tw = useTranslations('wallet');
  const { address, connected, executeTransaction, transactionStatus } = useWallet();
  const [step, setStep] = useState<BetStep>('idle');
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('1');

  const loading = step !== 'idle' && step !== 'done';
  const hasOnchainMarket = Boolean(market.market_id_onchain);

  // Calculate ROI for each side
  const roiYes = market.yes_price > 0 ? ((1 / market.yes_price) - 1) * 100 : 0;
  const roiNo = market.no_price > 0 ? ((1 / market.no_price) - 1) * 100 : 0;

  // CPMM price impact calculation
  const priceImpact = useMemo(() => {
    const amount = parseFloat(betAmount) || 0;
    if (amount === 0 || !selectedSide) return null;

    const amountMicro = amount * 1_000_000;
    let yesR = market.yes_reserves;
    let noR = market.no_reserves;

    if (yesR === 0 || noR === 0) return null;

    // CPMM: k = yes * no (constant product)
    const k = yesR * noR;

    if (selectedSide === 'yes') {
      noR += amountMicro;
      yesR = k / noR;
    } else {
      yesR += amountMicro;
      noR = k / yesR;
    }

    const newYesPrice = noR / (yesR + noR);
    const newNoPrice = yesR / (yesR + noR);
    const shares = selectedSide === 'yes' ? market.yes_reserves - yesR : market.no_reserves - noR;

    return {
      newYesPrice,
      newNoPrice,
      newYesReserves: Math.round(yesR),
      newNoReserves: Math.round(noR),
      shares,
      estimatedPayout: shares / 1_000_000,
    };
  }, [betAmount, selectedSide, market.yes_reserves, market.no_reserves]);

  const parseErrorMessage = useCallback(
    (err: unknown): ErrorDetails => {
      if (!(err instanceof Error)) {
        return { userMessage: t('failedToPlace') };
      }

      const errorMsg = err.message.toLowerCase();

      // User rejected transaction
      if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
        return {
          userMessage: 'Transaction cancelled',
          suggestion: 'You rejected the transaction in your wallet. Click "Place Private Bet" to try again.',
        };
      }

      // Insufficient funds
      if (errorMsg.includes('insufficient') || errorMsg.includes('not enough')) {
        return {
          userMessage: 'Insufficient funds',
          technicalDetails: err.message,
          suggestion: 'Make sure you have enough public USDCx balance to cover the bet, plus ALEO credits for the network fee (~0.5 ALEO).',
        };
      }

      // Network/RPC errors
      if (errorMsg.includes('network') || errorMsg.includes('timeout') || errorMsg.includes('rpc')) {
        return {
          userMessage: 'Network error',
          technicalDetails: err.message,
          suggestion: 'The Aleo network may be experiencing issues. Please try again in a few moments.',
        };
      }

      // Transaction rejected by network
      if (errorMsg.includes('rejected') || errorMsg.includes('failed')) {
        return {
          userMessage: 'Transaction rejected by network',
          technicalDetails: err.message,
          suggestion:
            'The transaction was rejected. This could be due to: outdated market reserves (someone placed a bet right before you), insufficient USDCx balance, or network congestion. Try refreshing the page and placing your bet again.',
        };
      }

      // Wallet not connected
      if (errorMsg.includes('wallet not connected')) {
        return {
          userMessage: 'Wallet not connected',
          suggestion: 'Please connect your wallet first.',
        };
      }

      // Generic error with full details
      return {
        userMessage: 'Transaction failed',
        technicalDetails: err.message,
        suggestion: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
      };
    },
    [t],
  );

  const handlePlaceBet = useCallback(async () => {
    if (!hasOnchainMarket) {
      setError({
        userMessage: 'Market not available',
        suggestion: 'This market is not linked to an on-chain contract yet. Betting is disabled.',
      });
      return;
    }

    if (!connected || !address) {
      setError({
        userMessage: tw('connectFirst'),
        suggestion: 'Connect your Aleo wallet to place bets.',
      });
      return;
    }

    if (selectedSide === null) {
      setError({
        userMessage: t('selectYesOrNo'),
        suggestion: 'Choose "Yes" or "No" before placing your bet.',
      });
      return;
    }

    if (market.status !== 'open') {
      setError({
        userMessage: t('notAcceptingBets'),
        suggestion: `This market is ${market.status} and no longer accepts new bets.`,
      });
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 1) {
      setError({
        userMessage: t('minimumBet'),
        suggestion: 'The minimum bet amount is 1 USDCx.',
      });
      return;
    }

    if (!priceImpact) {
      setError({
        userMessage: 'Unable to calculate price impact',
        suggestion: 'Market reserves may be invalid. Try refreshing the page.',
      });
      return;
    }

    const amountMicro = Math.floor(amount * USDCX_MICRO);

    try {
      setError(null);
      setShowErrorDetails(false);

      // Step 1: Fetch fresh reserves from on-chain (source of truth)
      setStep('signing');

      const onchainMarketId = parseInt(market.market_id_onchain || '0');
      const onchainReserves = await fetchOnchainReserves(onchainMarketId);

      if (!onchainReserves) {
        setError({
          userMessage: 'Could not fetch on-chain market data',
          suggestion: 'The Aleo network may be temporarily unavailable. Please try again in a moment.',
        });
        setStep('idle');
        return;
      }

      const transaction = buildPlaceBetTransaction({
        marketId: onchainMarketId,
        currentYesReserves: onchainReserves.yesReserves,
        currentNoReserves: onchainReserves.noReserves,
        amount: amountMicro,
        side: selectedSide === 'yes',
      });

      const transactionId = await executeTransaction(transaction);
      console.log('[BetForm] Transaction ID received:', transactionId);
      setTxId(transactionId);

      // Step 2: Wait for on-chain confirmation
      setStep('confirming');
      const { transactionId: finalTxId } = await waitForTransaction(transactionStatus, transactionId);

      // Update with the actual on-chain transaction ID
      if (finalTxId && finalTxId !== transactionId) {
        console.log('[BetForm] Updated to on-chain transaction ID:', finalTxId);
        setTxId(finalTxId);
      }

      // Step 3: Sync trade to Supabase using actual on-chain reserves
      setStep('syncing');

      // Fetch the real post-trade reserves from chain (source of truth)
      const postTradeReserves = await fetchOnchainReserves(onchainMarketId);
      const finalYesReserves = postTradeReserves?.yesReserves ?? priceImpact.newYesReserves;
      const finalNoReserves = postTradeReserves?.noReserves ?? priceImpact.newNoReserves;
      const totalReserves = finalYesReserves + finalNoReserves;
      const finalYesPrice = totalReserves > 0 ? finalNoReserves / totalReserves : priceImpact.newYesPrice;
      const finalNoPrice = totalReserves > 0 ? finalYesReserves / totalReserves : priceImpact.newNoPrice;

      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: market.id,
          side: selectedSide,
          shares: Math.round(priceImpact.shares),
          amount: amountMicro,
          price_before: selectedSide === 'yes' ? market.yes_price : market.no_price,
          price_after: selectedSide === 'yes' ? finalYesPrice : finalNoPrice,
          yes_reserves_after: finalYesReserves,
          no_reserves_after: finalNoReserves,
          tx_hash: transactionId,
        }),
      });

      setStep('done');
    } catch (err) {
      const errorDetails = parseErrorMessage(err);
      setError(errorDetails);
      setStep('idle');
    }
  }, [connected, address, selectedSide, betAmount, market, priceImpact, executeTransaction, transactionStatus, parseErrorMessage, t, tw, hasOnchainMarket]);

  const stepMessage = useMemo(() => {
    switch (step) {
      case 'signing':
        return t('signingInWallet');
      case 'confirming':
        return t('confirmingOnChain');
      case 'syncing':
        return t('syncingTrade');
      case 'done':
        return t('betPlaced');
      default:
        return null;
    }
  }, [step, t]);

  return (
    <div className="w-full space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50">
          <div className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="flex-1 space-y-2">
              <p className="font-semibold text-red-900 dark:text-red-100">{error.userMessage}</p>
              {error.suggestion && <p className="text-sm text-red-800 dark:text-red-200">{error.suggestion}</p>}
              {error.technicalDetails && (
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="flex items-center gap-1 text-xs text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100 transition-colors"
                >
                  {showErrorDetails ? (
                    <>
                      <ChevronUp className="size-3" />
                      Hide technical details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-3" />
                      Show technical details
                    </>
                  )}
                </button>
              )}
              {showErrorDetails && error.technicalDetails && (
                <div className="mt-2 rounded border border-red-200 bg-white dark:border-red-800 dark:bg-red-900/30 p-3">
                  <pre className="whitespace-pre-wrap wrap-break-word text-xs font-mono text-red-800 dark:text-red-200">{error.technicalDetails}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Message */}
      {stepMessage && (
        <div className={cn('flex items-center gap-2 rounded-md p-3', step === 'done' ? 'text-accent' : 'bg-accent text-accent-foreground')}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          <p className="text-sm font-medium">{stepMessage}</p>
          {txId && txId.startsWith('at1') && (step === 'syncing' || step === 'done') && (
            <a href={`https://testnet.explorer.provable.com/transaction/${txId}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs" onClick={(e) => e.stopPropagation()}>
              {t('viewOnExplorer')} <ExternalLink className="size-3 inline" />
            </a>
          )}
        </div>
      )}

      {/* Warning Messages */}
      {!hasOnchainMarket && (
        <div className="rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
          <p className="text-sm text-amber-600 dark:text-amber-400">This market is not yet linked to the on-chain contract. Betting is disabled.</p>
        </div>
      )}
      {market.status !== 'open' && (
        <div className="rounded-md bg-accent p-3">
          <p className="text-sm text-accent-foreground">{t('marketStatus', { status: market.status })}</p>
        </div>
      )}

      {/* Prediction Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t('selectPrediction')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedSide('yes')}
            disabled={loading}
            className={cn(
              'flex flex-col items-center rounded-lg border p-6 transition-colors',
              selectedSide === 'yes' ? 'border-green-500 bg-green-500/10 text-foreground' : 'border-border bg-card text-card-foreground hover:border-green-500/50',
              loading && 'pointer-events-none opacity-50',
            )}
          >
            <span className="mb-2 text-lg font-semibold">{tc('yes')}</span>
            <span className="text-3xl font-bold text-green-500">{formatPercent(market.yes_price)}</span>
            <span className="mt-2 text-sm font-semibold text-green-600 dark:text-green-400">+{roiYes.toFixed(0)}% ROI</span>
            {selectedSide === 'yes' && priceImpact && <span className="mt-1 text-xs text-muted-foreground">→ {formatPercent(priceImpact.newYesPrice)}</span>}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSide('no')}
            disabled={loading}
            className={cn(
              'flex flex-col items-center rounded-lg border p-6 transition-colors',
              selectedSide === 'no' ? 'border-red-500 bg-red-500/10 text-foreground' : 'border-border bg-card text-card-foreground hover:border-red-500/50',
              loading && 'pointer-events-none opacity-50',
            )}
          >
            <span className="mb-2 text-lg font-semibold">{tc('no')}</span>
            <span className="text-3xl font-bold text-red-500">{formatPercent(market.no_price)}</span>
            <span className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">+{roiNo.toFixed(0)}% ROI</span>
            {selectedSide === 'no' && priceImpact && <span className="mt-1 text-xs text-muted-foreground">→ {formatPercent(priceImpact.newNoPrice)}</span>}
          </button>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('betAmount')}</label>
        <Input type="number" min="1" step="0.1" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} placeholder="1" className="mb-2" disabled={loading} />
        <p className="text-xs text-muted-foreground">{t('minimum')}</p>
      </div>

      {/* Summary */}
      {selectedSide !== null && priceImpact && (
        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('position')}</span>
              <Badge variant={selectedSide === 'yes' ? 'default' : 'destructive'}>{selectedSide === 'yes' ? tc('yes') : tc('no')}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cost')}</span>
              <span className="font-semibold">{betAmount || '0'} USDCx</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('estShares')}</span>
              <span className="font-semibold">{priceImpact.estimatedPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('maxPayout')}</span>
              <span className="font-semibold text-green-500">{priceImpact.estimatedPayout.toFixed(2)} USDCx</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('networkFee')}</span>
              <span className="font-semibold">~0.5 ALEO (gas)</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {step === 'done' ? (
          <Button className="flex-1" onClick={onClose}>
            {tc('done')}
          </Button>
        ) : (
          <>
            <Button className="flex-1" onClick={handlePlaceBet} disabled={loading || selectedSide === null || market.status !== 'open' || !hasOnchainMarket}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {t('placeBet')}
            </Button>
            <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
              {tc('cancel')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
