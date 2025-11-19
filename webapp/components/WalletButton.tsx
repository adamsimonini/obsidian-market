import { useCallback, useState } from 'react';
import { Button, Text, YStack } from 'tamagui';
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
    <YStack>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <Button
        onPress={handlePress}
        backgroundColor={connected ? '$red10' : '$green10'}
        color="white"
        fontWeight="bold"
        paddingVertical="$3"
        paddingHorizontal="$6"
        borderRadius="$2"
        pressStyle={{ opacity: 0.8 }}
      >
        <Text color="white" fontWeight="bold">
          {connected
            ? `Disconnect (${address?.slice(0, 8)}...)`
            : 'Connect Wallet'}
        </Text>
      </Button>
    </YStack>
  );
}

