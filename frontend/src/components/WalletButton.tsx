'use client';

import { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';
import { Shield, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Wallet icon mapping
const WALLET_ICONS: Record<string, string> = {
  'Leo Wallet': '/leo-icon.webp',
  // 'Puzzle Wallet': '/puzzle-icon.png', 
};

export function WalletButton() {
  const { address, connected, connecting, disconnecting, network, availableWallets, connect, disconnect } = useWallet();
  const t = useTranslations('wallet');
  const [error, setError] = useState<string | null>(null);
  const busy = connecting || disconnecting;
  const showLoading = connecting;

  // Auto-dismiss error after 5s
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleConnect = useCallback(
    (walletName: string) => {
      if (busy) return;
      try {
        setError(null);
        connect(walletName);
      } catch (err) {
        console.error('Wallet error:', err);
        const errorMessage = err instanceof Error ? err.message : t('failedToConnect');
        setError(errorMessage);
      }
    },
    [busy, connect, t],
  );

  const handleDisconnect = useCallback(async () => {
    if (busy) return;
    try {
      setError(null);
      await disconnect();
    } catch (err) {
      console.error('Wallet error:', err);
      const errorMessage = err instanceof Error ? err.message : t('failedToConnect');
      setError(errorMessage);
    }
  }, [busy, disconnect, t]);

  // Connected state — simple button to disconnect
  if (connected) {
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
          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">{network}</span>
          <Button variant="secondary" size="sm" onClick={handleDisconnect} disabled={busy}>
            {t('connected', { address: `${address?.slice(0, 4)}...${address?.slice(-4)}` })}
          </Button>
        </div>
      </div>
    );
  }

  // Disconnected state — dropdown to pick wallet, or direct connect if only one
  if (availableWallets.length === 1) {
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
        <Button size="sm" onClick={() => handleConnect(availableWallets[0].name)} disabled={busy}>
          {showLoading ? <Loader2 className="size-4 animate-spin" /> : t('connect')}
        </Button>
      </div>
    );
  }

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
      {showLoading ? (
        <Button size="sm" className="min-w-30" disabled>
          <Loader2 className="size-4 animate-spin" />
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" disabled={busy}>
              {t('connect')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableWallets.map((w) => (
              <DropdownMenuItem key={w.name} onClick={() => handleConnect(w.name)} className="flex items-center gap-2">
                {w.name === 'Shield Wallet' ? (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border-1 border-white rounded-full">
                    <Shield className="size-4" />
                  </div>
                ) : WALLET_ICONS[w.name] ? (
                  <div className="relative size-6 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={WALLET_ICONS[w.name]}
                      alt={w.name}
                      width={24}
                      height={24}
                      className="object-cover border-1 border-white rounded-full"
                    />
                  </div>
                ) : (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {w.name.charAt(0)}
                  </div>
                )}
                <span>{w.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
