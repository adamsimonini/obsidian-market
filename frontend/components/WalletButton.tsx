import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { ErrorToast } from './ErrorToast';
import { Button } from './ui/button';

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
      <Button
        variant={connected ? 'destructive' : 'default'}
        onPress={handlePress}
      >
        {connected
          ? `Disconnect (${address?.slice(0, 8)}...)`
          : 'Connect Wallet'}
      </Button>
    </View>
  );
}

