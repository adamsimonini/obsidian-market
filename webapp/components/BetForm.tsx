import { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/nativewindui/Card';
import { useWallet } from '../hooks/useWallet';
import { cn } from '@/lib/cn';
import type { Market } from '../types/supabase';

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

      const amountMicrocredits = BigInt(Math.floor(amount * 1_000_000));

      // TODO: Call Aleo place_bet transition
      // const bet = await placeBetOnChain(market.market_id_onchain, selectedSide, amountMicrocredits)

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
    <ScrollView className="flex-1 bg-background">
      <View className="p-5 max-w-[600px] self-center w-full">
        {/* Title and Description */}
        <View className="mb-6">
          <Text variant="title1" className="mb-3 font-bold text-foreground">
            {market.title}
          </Text>
          {market.description && (
            <Text variant="body" className="text-muted-foreground leading-6">
              {market.description}
            </Text>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 p-3 rounded bg-destructive">
            <Text className="text-destructive-foreground">{error}</Text>
          </View>
        )}

        {/* Warning Message */}
        {market.status !== 'open' && (
          <View className="mb-4 p-3 rounded bg-accent">
            <Text className="text-accent-foreground">
              This market is {market.status} and not accepting bets
            </Text>
          </View>
        )}

        {/* Prediction Selection */}
        <View className="mb-6">
          <Text variant="heading" className="mb-4 text-foreground">
            Select Your Prediction
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setSelectedSide(true)}
              className={cn(
                'flex-1 p-4 rounded-lg border items-center',
                selectedSide === true
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              )}
            >
              <Text
                variant="heading"
                className={cn(
                  'mb-2',
                  selectedSide === true
                    ? 'text-primary-foreground'
                    : 'text-card-foreground'
                )}
              >
                Yes
              </Text>
              <Text
                variant="caption1"
                className={cn(
                  'mb-2',
                  selectedSide === true
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {market.yes_odds}x odds
              </Text>
              {selectedSide === true && (
                <Text
                  variant="caption2"
                  className="text-primary-foreground/90 font-semibold"
                >
                  Payout: {calculatePayout(parseFloat(betAmount) || 0, true).toFixed(2)} ALEO
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedSide(false)}
              className={cn(
                'flex-1 p-4 rounded-lg border items-center',
                selectedSide === false
                  ? 'bg-primary border-primary'
                  : 'bg-card border-border'
              )}
            >
              <Text
                variant="heading"
                className={cn(
                  'mb-2',
                  selectedSide === false
                    ? 'text-primary-foreground'
                    : 'text-card-foreground'
                )}
              >
                No
              </Text>
              <Text
                variant="caption1"
                className={cn(
                  'mb-2',
                  selectedSide === false
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                )}
              >
                {market.no_odds}x odds
              </Text>
              {selectedSide === false && (
                <Text
                  variant="caption2"
                  className="text-primary-foreground/90 font-semibold"
                >
                  Payout: {calculatePayout(parseFloat(betAmount) || 0, false).toFixed(2)} ALEO
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bet Amount Input */}
        <View className="mb-6">
          <Text variant="body" className="mb-2 font-semibold text-foreground">
            Bet Amount (ALEO)
          </Text>
          <Input
            value={betAmount}
            onChangeText={(val) => {
              if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
                setBetAmount(val);
              }
            }}
            placeholder="1"
            keyboardType="numeric"
            className="mb-2"
          />
          <Text variant="caption1" className="text-muted-foreground">
            Minimum: 1 ALEO
          </Text>
        </View>

        {/* Summary */}
        {selectedSide !== null && (
          <Card className="mb-6 p-4">
            <Text variant="body" className="mb-2 text-card-foreground">
              Betting {betAmount || '0'} ALEO on {selectedSide ? 'Yes' : 'No'}
            </Text>
            <Text variant="body" className="text-card-foreground">
              Potential Payout: {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
            </Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View className="flex-row gap-3">
          <Button
            variant="default"
            className="flex-1"
            onPress={handlePlaceBet}
            disabled={loading || !selectedSide || market.status !== 'open'}
            loading={loading}
          >
            Place Bet
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onPress={onClose}
          >
            Cancel
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}


