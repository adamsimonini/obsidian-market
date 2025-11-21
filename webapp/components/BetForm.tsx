import { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/nativewindui/Text';
import { useWallet } from '../hooks/useWallet';
import { useColorScheme } from '@/lib/useColorScheme';
import type { Market } from '../types/supabase';

interface BetFormProps {
  market: Market;
  onClose: () => void;
}

export function BetForm({ market, onClose }: BetFormProps) {
  const { address, connected } = useWallet();
  const { colors } = useColorScheme();
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

  const dynamicStyles = {
    title: { color: colors.foreground },
    description: { color: colors.mutedForeground },
    sectionTitle: { color: colors.foreground },
    sideButton: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    sideButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sideButtonText: { color: colors.foreground },
    oddsText: { color: colors.mutedForeground },
    payoutText: { color: colors.primaryForeground },
    label: { color: colors.foreground },
    input: {
      backgroundColor: colors.input,
      borderColor: colors.border,
      color: colors.foreground,
    },
    hint: { color: colors.mutedForeground },
    summary: { backgroundColor: colors.card, borderColor: colors.border },
    summaryText: { color: colors.foreground },
    submitButton: { backgroundColor: colors.primary },
    cancelButton: { backgroundColor: colors.muted },
    buttonText: { color: colors.primaryForeground },
    disabledButtonText: { color: colors.mutedForeground },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="title1" style={dynamicStyles.title}>{market.title}</Text>
      {market.description && (
        <Text variant="body" style={dynamicStyles.description}>{market.description}</Text>
      )}

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.destructive }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {market.status !== 'open' && (
        <View style={[styles.warningContainer, { backgroundColor: colors.accent }]}>
          <Text style={styles.warningText}>
            This market is {market.status} and not accepting bets
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text variant="heading" style={dynamicStyles.sectionTitle}>Select Your Prediction</Text>
        <View style={styles.sideRow}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              dynamicStyles.sideButton,
              selectedSide === true && dynamicStyles.sideButtonSelected,
            ]}
            onPress={() => setSelectedSide(true)}
          >
            <Text variant="heading" style={[
              selectedSide === true 
                ? { color: colors.primaryForeground }
                : dynamicStyles.sideButtonText
            ]}>Yes</Text>
            <Text variant="caption1" style={dynamicStyles.oddsText}>
              {market.yes_odds}x odds
            </Text>
            {selectedSide === true && (
              <Text variant="caption2" style={dynamicStyles.payoutText}>
                Payout: {calculatePayout(parseFloat(betAmount) || 0, true).toFixed(2)} ALEO
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sideButton,
              dynamicStyles.sideButton,
              selectedSide === false && dynamicStyles.sideButtonSelected,
            ]}
            onPress={() => setSelectedSide(false)}
          >
            <Text variant="heading" style={[
              selectedSide === false 
                ? { color: colors.primaryForeground }
                : dynamicStyles.sideButtonText
            ]}>No</Text>
            <Text variant="caption1" style={dynamicStyles.oddsText}>
              {market.no_odds}x odds
            </Text>
            {selectedSide === false && (
              <Text variant="caption2" style={dynamicStyles.payoutText}>
                Payout: {calculatePayout(parseFloat(betAmount) || 0, false).toFixed(2)} ALEO
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text variant="body" style={dynamicStyles.label}>Bet Amount (ALEO)</Text>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          value={betAmount}
          onChangeText={(val) => {
            if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
              setBetAmount(val);
            }
          }}
          placeholder="1"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="numeric"
        />
        <Text variant="caption1" style={dynamicStyles.hint}>Minimum: 1 ALEO</Text>
      </View>

      {selectedSide !== null && (
        <View style={[styles.summary, dynamicStyles.summary]}>
          <Text variant="body" style={dynamicStyles.summaryText}>
            Betting {betAmount || '0'} ALEO on {selectedSide ? 'Yes' : 'No'}
          </Text>
          <Text variant="body" style={dynamicStyles.summaryText}>
            Potential Payout: {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            dynamicStyles.submitButton,
            (loading || !selectedSide || market.status !== 'open') && styles.disabled,
          ]}
          onPress={handlePlaceBet}
          disabled={loading || !selectedSide || market.status !== 'open'}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text variant="body" style={[
              dynamicStyles.buttonText,
              (loading || !selectedSide || market.status !== 'open') && dynamicStyles.disabledButtonText
            ]}>Place Bet</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, dynamicStyles.cancelButton]}
          onPress={onClose}
        >
          <Text variant="body" style={{ color: colors.foreground }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: 'white',
  },
  warningContainer: {
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  warningText: {
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sideRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sideButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 8,
  },
  summary: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

