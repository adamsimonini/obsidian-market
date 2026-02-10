'use client';

import { useCallback, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { address, connected, connecting, disconnecting, network, connect, disconnect } = useWallet();
  const t = useTranslations('wallet');
  const [error, setError] = useState<string | null>(null);
  const busy = connecting || disconnecting;
  const showLoading = connecting; // Only show loading during connect, not disconnect

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleClick = useCallback(async () => {
    if (busy) return;
    try {
      setError(null);
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet error:', error);
      const errorMessage = error instanceof Error ? error.message : t('failedToConnect');
      setError(errorMessage);
    }
  }, [busy, connected, connect, disconnect, t]);

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
        {connected && <span className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">{network}</span>}
        <Button variant={connected ? 'secondary' : 'default'} size="sm" onClick={handleClick} disabled={busy}>
          {showLoading ? '...' : connected ? t('connected', { address: `${address?.slice(0, 4)}...${address?.slice(-4)}` }) : t('connect')}
        </Button>
      </div>
    </div>
  );
}
