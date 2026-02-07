'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

interface BetFormProps {
  market: Market;
  onClose: () => void;
}

export function BetForm({ market, onClose }: BetFormProps) {
  const { address, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<boolean | null>(null);
  const [betAmount, setBetAmount] = useState('1');

  const handlePlaceBet = useCallback(async () => {
    if (!connected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (selectedSide === null) {
      setError('Please select Yes or No');
      return;
    }

    if (market.status !== 'open') {
      setError('This market is not accepting bets');
      return;
    }

    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount < 1) {
      setError('Minimum bet is 1 ALEO');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Call Aleo place_bet transition
      // const amountMicrocredits = BigInt(Math.floor(amount * 1_000_000));

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  }, [connected, address, selectedSide, betAmount, market, onClose]);

  const calculatePayout = (amount: number, side: boolean) => {
    const odds = side ? market.yes_odds : market.no_odds;
    return amount * odds;
  };

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
            This market is {market.status} and not accepting bets
          </p>
        </div>
      )}

      {/* Prediction Selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Select Your Prediction</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedSide(true)}
            className={cn(
              'flex flex-col items-center rounded-lg border p-4 transition-colors',
              selectedSide === true
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-card-foreground hover:border-primary/50',
            )}
          >
            <span className="mb-2 text-lg font-semibold">Yes</span>
            <span
              className={cn(
                'mb-2 text-xs',
                selectedSide === true ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {market.yes_odds}x odds
            </span>
            {selectedSide === true && (
              <span className="text-xs font-semibold text-primary-foreground/90">
                Payout: {calculatePayout(parseFloat(betAmount) || 0, true).toFixed(2)} ALEO
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSide(false)}
            className={cn(
              'flex flex-col items-center rounded-lg border p-4 transition-colors',
              selectedSide === false
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-card-foreground hover:border-primary/50',
            )}
          >
            <span className="mb-2 text-lg font-semibold">No</span>
            <span
              className={cn(
                'mb-2 text-xs',
                selectedSide === false ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {market.no_odds}x odds
            </span>
            {selectedSide === false && (
              <span className="text-xs font-semibold text-primary-foreground/90">
                Payout: {calculatePayout(parseFloat(betAmount) || 0, false).toFixed(2)} ALEO
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bet Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-semibold">Bet Amount (ALEO)</label>
        <Input
          type="number"
          min="1"
          step="0.1"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="1"
          className="mb-2"
        />
        <p className="text-xs text-muted-foreground">Minimum: 1 ALEO</p>
      </div>

      {/* Summary */}
      {selectedSide !== null && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm">
              Betting {betAmount || '0'} ALEO on{' '}
              <span className="font-semibold">{selectedSide ? 'Yes' : 'No'}</span>
            </p>
            <p className="text-sm">
              Potential Payout:{' '}
              <span className="font-semibold">
                {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
              </span>
            </p>
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
          Place Bet
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
