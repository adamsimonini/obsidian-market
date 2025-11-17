import { useCallback, useState } from '@lynx-js/react';
import { useWallet } from '../hooks/useWallet';
import { ErrorToast } from './ErrorToast';

export function WalletButton() {
  const { address, connected, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleClick = useCallback(async () => {
    if (connected) {
      disconnect();
    } else {
      try {
        setError(null);
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        // Show user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to connect wallet';
        setError(errorMessage);
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <view>
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
      <view
        bindtap={handleClick}
        style={{
          padding: '12px 24px',
          backgroundColor: connected ? '#ff4444' : '#4CAF50',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignSelf: 'flex-start',
        }}
      >
        <text style={{ color: 'white', fontWeight: 'bold' }}>
          {connected
            ? `Disconnect (${address?.slice(0, 8)}...)`
            : 'Connect Wallet'}
        </text>
      </view>
    </view>
  );
}
