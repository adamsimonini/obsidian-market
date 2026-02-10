'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';
import type { LocalizedMarket } from '@/types/supabase';

interface BetFormProps {
  market: LocalizedMarket;
  onClose: () => void;
}

function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}

export function BetForm({ market, onClose }: BetFormProps) {
  const t = useTranslations('betForm');
  const tc = useTranslations('common');
  const tw = useTranslations('wallet');
  const format = useFormatter();
  const { address, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState('1');

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
      // Buying yes: add to no pool, remove from yes pool
      noR += amountMicro;
      yesR = k / noR;
    } else {
      // Buying no: add to yes pool, remove from no pool
      yesR += amountMicro;
      noR = k / yesR;
    }

    const newYesPrice = noR / (yesR + noR);
    const newNoPrice = yesR / (yesR + noR);
    const shares = selectedSide === 'yes'
      ? market.yes_reserves - yesR
      : market.no_reserves - noR;

    return {
      newYesPrice,
      newNoPrice,
      shares,
      estimatedPayout: shares / 1_000_000, // convert back from microcredits
    };
  }, [betAmount, selectedSide, market.yes_reserves, market.no_reserves]);

  const handlePlaceBet = useCallback(async () => {
    if (!connected || !address) {
      setError(tw('connectFirst'));
      return;
    }

    if (selectedSide === null) {
      setError(t('selectYesOrNo'));
      return;
    }

    if (market.status !== 'open') {
      setError(t('notAcceptingBets'));
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 1) {
      setError(t('minimumBet'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Call Aleo place_bet transition
      // const amountMicrocredits = BigInt(Math.floor(amount * 1_000_000));

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToPlace'));
    } finally {
      setLoading(false);
    }
  }, [connected, address, selectedSide, betAmount, market, onClose]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Title and Description */}
      <div>
        <h1 className="mb-3 text-2xl font-bold">{market.title}</h1>
        {market.description && (
          <p className="leading-relaxed text-muted-foreground">
            {market.description}
          </p>
        )}
        <div className="mt-3 flex gap-3 text-sm text-muted-foreground">
          <span>{t('volumeLabel', { value: format.number(market.total_volume) })}</span>
          <span>{t('tradesLabel', { value: market.trade_count })}</span>
          <span>{t('feeLabel', { value: `${market.fee_bps / 100}%` })}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive p-3">
          <p className="text-sm text-white">{error}</p>
        </div>
      )}

      {/* Warning Message */}
      {market.status !== 'open' && (
        <div className="rounded-md bg-accent p-3">
          <p className="text-sm text-accent-foreground">
            {t('marketStatus', { status: market.status })}
          </p>
        </div>
      )}

      {/* Prediction Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t('selectPrediction')}</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedSide('yes')}
            className={cn(
              'flex flex-col items-center rounded-lg border p-4 transition-colors',
              selectedSide === 'yes'
                ? 'border-green-500 bg-green-500/10 text-foreground'
                : 'border-border bg-card text-card-foreground hover:border-green-500/50',
            )}
          >
            <span className="mb-1 text-lg font-semibold">{tc('yes')}</span>
            <span className="text-2xl font-bold text-green-500">
              {formatPercent(market.yes_price)}
            </span>
            {selectedSide === 'yes' && priceImpact && (
              <span className="mt-1 text-xs text-muted-foreground">
                → {formatPercent(priceImpact.newYesPrice)}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSide('no')}
            className={cn(
              'flex flex-col items-center rounded-lg border p-4 transition-colors',
              selectedSide === 'no'
                ? 'border-red-500 bg-red-500/10 text-foreground'
                : 'border-border bg-card text-card-foreground hover:border-red-500/50',
            )}
          >
            <span className="mb-1 text-lg font-semibold">{tc('no')}</span>
            <span className="text-2xl font-bold text-red-500">
              {formatPercent(market.no_price)}
            </span>
            {selectedSide === 'no' && priceImpact && (
              <span className="mt-1 text-xs text-muted-foreground">
                → {formatPercent(priceImpact.newNoPrice)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-semibold">{t('betAmount')}</label>
        <Input
          type="number"
          min="1"
          step="0.1"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="1"
          className="mb-2"
        />
        <p className="text-xs text-muted-foreground">{t('minimum')}</p>
      </div>

      {/* Summary */}
      {selectedSide !== null && priceImpact && (
        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('position')}</span>
              <Badge variant={selectedSide === 'yes' ? 'default' : 'destructive'}>
                {selectedSide === 'yes' ? tc('yes') : tc('no')}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('cost')}</span>
              <span className="font-semibold">{betAmount || '0'} ALEO</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('estShares')}</span>
              <span className="font-semibold">{priceImpact.estimatedPayout.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('maxPayout')}</span>
              <span className="font-semibold text-green-500">
                {priceImpact.estimatedPayout.toFixed(2)} ALEO
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={handlePlaceBet}
          disabled={loading || selectedSide === null || market.status !== 'open'}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {t('placeBet')}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          {tc('cancel')}
        </Button>
      </div>
    </div>
  );
}
