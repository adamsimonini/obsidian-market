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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{market.title}</Text>
      {market.description && (
        <Text style={styles.description}>{market.description}</Text>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {market.status !== 'open' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            This market is {market.status} and not accepting bets
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Your Prediction</Text>
        <View style={styles.sideRow}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              selectedSide === true && styles.sideButtonSelected,
            ]}
            onPress={() => setSelectedSide(true)}
          >
            <Text style={styles.sideButtonText}>Yes</Text>
            <Text style={styles.oddsText}>
              {market.yes_odds}x odds
            </Text>
            {selectedSide === true && (
              <Text style={styles.payoutText}>
                Payout: {calculatePayout(parseFloat(betAmount) || 0, true).toFixed(2)} ALEO
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sideButton,
              selectedSide === false && styles.sideButtonSelected,
            ]}
            onPress={() => setSelectedSide(false)}
          >
            <Text style={styles.sideButtonText}>No</Text>
            <Text style={styles.oddsText}>
              {market.no_odds}x odds
            </Text>
            {selectedSide === false && (
              <Text style={styles.payoutText}>
                Payout: {calculatePayout(parseFloat(betAmount) || 0, false).toFixed(2)} ALEO
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Bet Amount (ALEO)</Text>
        <TextInput
          style={styles.input}
          value={betAmount}
          onChangeText={(val) => {
            if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
              setBetAmount(val);
            }
          }}
          placeholder="1"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />
        <Text style={styles.hint}>Minimum: 1 ALEO</Text>
      </View>

      {selectedSide !== null && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Betting {betAmount || '0'} ALEO on {selectedSide ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.summaryText}>
            Potential Payout: {calculatePayout(parseFloat(betAmount) || 0, selectedSide).toFixed(2)} ALEO
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.submitButton,
            (loading || !selectedSide || market.status !== 'open') && styles.disabled,
          ]}
          onPress={handlePlaceBet}
          disabled={loading || !selectedSide || market.status !== 'open'}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Place Bet</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Cancel</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: 'white',
  },
  warningContainer: {
    padding: 12,
    backgroundColor: '#FF9800',
    borderRadius: 4,
    marginBottom: 16,
  },
  warningText: {
    color: 'white',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
  sideRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sideButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  sideButtonSelected: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  sideButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  oddsText: {
    fontSize: 14,
    color: '#ccc',
  },
  payoutText: {
    fontSize: 12,
    color: 'white',
    marginTop: 8,
    fontWeight: 'bold',
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    color: 'white',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#999',
  },
  summary: {
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryText: {
    color: 'white',
    marginBottom: 4,
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
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  disabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

