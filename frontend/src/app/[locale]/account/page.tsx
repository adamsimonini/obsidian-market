'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';

export default function AccountPage() {
  const { address, connected } = useWallet();
  const t = useTranslations('account');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>
              {connected
                ? t('connectedAs', { address: address ?? '' })
                : t('connectPrompt')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('walletDetails')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
