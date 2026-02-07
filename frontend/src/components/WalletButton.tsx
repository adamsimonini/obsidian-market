'use client';

import { useCallback, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';

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
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to connect wallet';
        setError(errorMessage);
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <div>
      {error && (
        <div className="absolute top-16 right-4 z-50 max-w-sm rounded-lg bg-destructive px-4 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
      <Button
        variant={connected ? 'destructive' : 'default'}
        size="sm"
        onClick={handleClick}
      >
        {connected
          ? `Disconnect (${address?.slice(0, 8)}...)`
          : 'Connect Wallet'}
      </Button>
    </div>
  );
}
