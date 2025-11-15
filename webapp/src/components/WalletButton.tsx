import { useCallback } from '@lynx-js/react';
import { useWallet } from '../hooks/useWallet';

export function WalletButton() {
  const { address, connected, connect, disconnect } = useWallet();

  const handleClick = useCallback(async () => {
    if (connected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        // In a real app, show error toast/notification
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <view>
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
