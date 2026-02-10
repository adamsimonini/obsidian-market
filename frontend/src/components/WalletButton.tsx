'use client';

import { useCallback, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { address, connected, network, connect, disconnect } = useWallet();
  const t = useTranslations('wallet');
  const [error, setError] = useState<string | null>(null);

  // Clear error when wallet connects (e.g. via autoConnect after a failed manual attempt)
  useEffect(() => {
    if (connected) setError(null);
  }, [connected]);

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

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
          error instanceof Error ? error.message : t('failedToConnect');
        setError(errorMessage);
      }
    }
  }, [connected, connect, disconnect]);

  return (
    <div>
      {error && (
        <button
          type="button"
          onClick={() => setError(null)}
          className="absolute top-16 right-4 z-50 max-w-sm cursor-pointer rounded-lg bg-destructive px-4 py-2 text-left text-sm text-white shadow-lg"
        >
          {error}
        </button>
      )}
      <div className="flex items-center gap-2">
        {connected && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
            {network}
          </span>
        )}
        <Button
          variant={connected ? 'destructive' : 'default'}
          size="sm"
          onClick={handleClick}
        >
          {connected
            ? t('disconnect', { address: `${address?.slice(0, 8)}...` })
            : t('connect')}
        </Button>
      </div>
    </div>
  );
}
