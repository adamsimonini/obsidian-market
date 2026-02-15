'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import { fetchUsdcxBalance, USDCX_MICRO } from '@/lib/aleo';
import { Loader2, ExternalLink } from 'lucide-react';

interface Balance {
  aleo: number | null;
  usdcx: number | null;
}

export default function AccountPage() {
  const { address, connected } = useWallet();
  const t = useTranslations('account');
  const [balance, setBalance] = useState<Balance>({ aleo: null, usdcx: null });
  const [loadingBalance, setLoadingBalance] = useState(false);

  useEffect(() => {
    if (!connected || !address) {
      setBalance({ aleo: null, usdcx: null });
      return;
    }

    async function fetchBalances() {
      setLoadingBalance(true);
      try {
        // Fetch ALEO balance
        const aleoRes = await fetch(
          `https://api.explorer.provable.com/v1/testnet/program/credits.aleo/mapping/account/${address}`
        );

        if (aleoRes.ok) {
          const text = await aleoRes.text();
          const match = text.match(/(\d+)u64/);
          if (match) {
            const microcredits = parseInt(match[1], 10);
            setBalance((prev) => ({ ...prev, aleo: microcredits / 1_000_000 }));
          }
        } else {
          setBalance((prev) => ({ ...prev, aleo: 0 }));
        }

        // Fetch USDCx public balance
        const usdcxMicro = await fetchUsdcxBalance(address!);
        setBalance((prev) => ({
          ...prev,
          usdcx: usdcxMicro !== null ? usdcxMicro / USDCX_MICRO : null,
        }));
      } catch (err) {
        console.error('Failed to fetch balances:', err);
      } finally {
        setLoadingBalance(false);
      }
    }

    fetchBalances();
  }, [connected, address]);

  const formatBalance = (val: number | null, decimals = 2) => {
    if (val === null) return '—';
    return val.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <h1 className="mb-6 text-3xl font-bold">{t('title')}</h1>

        {!connected ? (
          <Card>
            <CardHeader>
              <CardDescription>{t('connectPrompt')}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Wallet Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t('connectedAs', { address: '' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <code className="text-sm text-muted-foreground break-all">{address}</code>
                  <a
                    href={`https://testnet.explorer.provable.com/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <ExternalLink className="size-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              </CardHeader>
            </Card>

            {/* Balances */}
            <Card>
              <CardHeader>
                <CardTitle>{t('balances')}</CardTitle>
                <CardDescription>{t('publicBalanceNote')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* USDCx Balance */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('usdcxBalance')}</p>
                      {loadingBalance ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            {t('loadingBalance')}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-2xl font-bold">
                          ${formatBalance(balance.usdcx)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ALEO Balance (gas) */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('aleoBalance')}</p>
                      {loadingBalance ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            {t('loadingBalance')}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-2xl font-bold">
                          {formatBalance(balance.aleo)}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{t('aleoGasNote')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bet History */}
            <Card>
              <CardHeader>
                <CardTitle>{t('betHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">{t('noBetsYet')}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('privateBetsNote')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
