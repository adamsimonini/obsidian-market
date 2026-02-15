'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/hooks/useWallet';
import { fetchUsdcxBalance, buildShieldUsdcxTransaction, USDCX_MICRO } from '@/lib/aleo';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function ShieldUsdcx() {
  const { address, connected, executeTransaction } = useWallet();
  const t = useTranslations('shield');

  const [amount, setAmount] = useState('');
  const [publicBalance, setPublicBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!connected || !address) {
      setPublicBalance(null);
      return;
    }

    async function loadBalance() {
      setLoadingBalance(true);
      try {
        const micro = await fetchUsdcxBalance(address!);
        setPublicBalance(micro !== null ? micro / USDCX_MICRO : null);
      } catch {
        setPublicBalance(null);
      } finally {
        setLoadingBalance(false);
      }
    }

    loadBalance();
  }, [connected, address]);

  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const hasEnough = publicBalance !== null && isValidAmount && parsedAmount <= publicBalance;

  async function handleShield() {
    if (!connected || !address || !isValidAmount || !hasEnough) return;

    setSubmitting(true);
    try {
      const microAmount = Math.round(parsedAmount * USDCX_MICRO);
      const tx = buildShieldUsdcxTransaction({
        recipient: address,
        amount: microAmount,
      });

      await executeTransaction(tx);
      toast.success(t('success', { amount: parsedAmount.toString() }));
      setAmount('');

      // Poll for balance update (explorer API may lag)
      const originalBalance = publicBalance;
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const micro = await fetchUsdcxBalance(address);
        const newBalance = micro !== null ? micro / USDCX_MICRO : null;

        // Stop polling if balance changed or after 30 seconds (10 attempts * 3s)
        if (newBalance !== originalBalance || attempts >= 10) {
          clearInterval(pollInterval);
          setPublicBalance(newBalance);
        }
      }, 3000);
    } catch (err) {
      console.error('Shield failed:', err);
      toast.error(t('failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!connected) {
    return (
      <Card className="flex h-full flex-col border-dashed">
        <CardContent className="flex flex-1 items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">{t('connectWallet')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle className="text-lg">{t('title')}</CardTitle>
        </div>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">{t('amount')}</label>
            <div className="flex items-center gap-2">
              {loadingBalance ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                </span>
              ) : publicBalance !== null && publicBalance > 0 ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    {t('publicBalance', {
                      balance: publicBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      }),
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAmount(publicBalance.toString())}
                    className="text-xs font-medium text-primary hover:underline"
                    disabled={submitting}
                  >
                    Max
                  </button>
                </>
              ) : null}
            </div>
          </div>
          <Input
            type="number"
            min="0"
            step="any"
            placeholder={t('amountPlaceholder')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
          />
        </div>

        {amount && !isValidAmount && (
          <p className="text-sm text-destructive">{t('invalidAmount')}</p>
        )}
        {isValidAmount && !hasEnough && (
          <p className="text-sm text-destructive">{t('insufficientBalance')}</p>
        )}

        <Button
          className="w-full"
          onClick={handleShield}
          disabled={!isValidAmount || !hasEnough || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t('shielding')}
            </>
          ) : (
            t('shieldButton')
          )}
        </Button>

        <p className="text-xs text-muted-foreground">{t('whyShield')}</p>
      </CardContent>
    </Card>
  );
}
