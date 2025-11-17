import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { ErrorToast } from './ErrorToast';

export function WalletButton() {
  const { address, connected, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handlePress = useCallback(async () => {
    if (connected) {
      disconnect();
    } else {
      try {
        setError(null);
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to connect wallet';
        setError(errorMessage);
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <View>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          { backgroundColor: connected ? '#ff4444' : '#4CAF50' },
        ]}
      >
        <Text style={styles.buttonText}>
          {connected
            ? `Disconnect (${address?.slice(0, 8)}...)`
            : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

