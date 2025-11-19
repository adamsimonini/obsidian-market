import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Input,
  Spinner,
  Text,
  XStack,
  YStack,
} from 'tamagui';
import { useWallet } from '../hooks/useWallet';
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
    <ScrollView>
      <YStack
        padding="$5"
        maxWidth={600}
        alignSelf="center"
        width="100%"
        gap="$6"
      >
        <Text fontSize="$8" fontWeight="bold" color="$color">
          {market.title}
        </Text>
        {market.description && (
          <Text fontSize="$4" color="$colorPress">
            {market.description}
          </Text>
        )}

        {error && (
          <YStack
            padding="$3"
            backgroundColor="$red10"
            borderRadius="$1"
          >
            <Text color="white">{error}</Text>
          </YStack>
        )}

        {market.status !== 'open' && (
          <YStack
            padding="$3"
            backgroundColor="$orange10"
            borderRadius="$1"
          >
            <Text color="white">
              This market is {market.status} and not accepting bets
            </Text>
          </YStack>
        )}

        <YStack gap="$4">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Select Your Prediction
          </Text>
          <XStack gap="$3">
            <Button
              flex={1}
              onPress={() => setSelectedSide(true)}
              backgroundColor={
                selectedSide === true ? '$green10' : '$backgroundHover'
              }
              borderWidth={selectedSide === true ? 2 : 1}
              borderColor={selectedSide === true ? '$green10' : '$borderColor'}
              borderRadius="$2"
              padding="$4"
              alignItems="center"
              pressStyle={{ opacity: 0.8 }}
            >
              <YStack alignItems="center" gap="$2">
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="white"
                >
                  Yes
                </Text>
                <Text fontSize="$4" color="$colorPress">
                  {market.yes_odds}x odds
                </Text>
                {selectedSide === true && (
                  <Text fontSize="$2" color="white" fontWeight="bold" marginTop="$2">
                    Payout: {calculatePayout(parseFloat(betAmount) || 0, true).toFixed(2)} ALEO
                  </Text>
                )}
              </YStack>
            </Button>
            <Button
              flex={1}
              onPress={() => setSelectedSide(false)}
              backgroundColor={
                selectedSide === false ? '$green10' : '$backgroundHover'
              }
              borderWidth={selectedSide === false ? 2 : 1}
              borderColor={selectedSide === false ? '$green10' : '$borderColor'}
              borderRadius="$2"
              padding="$4"
              alignItems="center"
              pressStyle={{ opacity: 0.8 }}
            >
              <YStack alignItems="center" gap="$2">
                <Text
                  fontSize="$6"
                  fontWeight="bold"
                  color="white"
                >
                  No
                </Text>
                <Text fontSize="$4" color="$colorPress">
                  {market.no_odds}x odds
                </Text>
                {selectedSide === false && (
                  <Text fontSize="$2" color="white" fontWeight="bold" marginTop="$2">
                    Payout: {calculatePayout(parseFloat(betAmount) || 0, false).toFixed(2)} ALEO
                  </Text>
                )}
              </YStack>
            </Button>
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="bold" color="$color">
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
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            color="$color"
            placeholderTextColor="$placeholderColor"
          />
          <Text fontSize="$2" color="$placeholderColor">
            Minimum: 1 ALEO
          </Text>
        </YStack>

        {selectedSide !== null && (
          <YStack
            padding="$4"
            backgroundColor="$backgroundHover"
            borderRadius="$2"
            gap="$1"
          >
            <Text color="$color">
              Betting {betAmount || '0'} ALEO on {selectedSide ? 'Yes' : 'No'}
            </Text>
            <Text color="$color">
              Potential Payout: {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
            </Text>
          </YStack>
        )}

        <XStack gap="$3">
          <Button
            flex={1}
            onPress={handlePlaceBet}
            disabled={loading || !selectedSide || market.status !== 'open'}
            backgroundColor={
              loading || !selectedSide || market.status !== 'open'
                ? '$placeholderColor'
                : '$green10'
            }
            opacity={
              loading || !selectedSide || market.status !== 'open' ? 0.5 : 1
            }
            color="white"
            fontWeight="bold"
            paddingVertical="$3"
            paddingHorizontal="$6"
            borderRadius="$2"
            pressStyle={{ opacity: 0.8 }}
          >
            {loading ? (
              <Spinner color="white" />
            ) : (
              <Text color="white" fontWeight="bold">
                Place Bet
              </Text>
            )}
          </Button>
          <Button
            flex={1}
            onPress={onClose}
            backgroundColor="$placeholderColor"
            color="white"
            fontWeight="bold"
            paddingVertical="$3"
            paddingHorizontal="$6"
            borderRadius="$2"
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="white" fontWeight="bold">
              Cancel
            </Text>
          </Button>
        </XStack>
      </YStack>
    </ScrollView>
  );
}


