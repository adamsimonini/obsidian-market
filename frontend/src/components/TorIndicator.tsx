'use client';

import { useTranslations } from 'next-intl';
import { Shield, ShieldCheck } from 'lucide-react';
import { useTorStatus } from '@/hooks/useTorStatus';
import { useShowTorIndicator } from '@/hooks/useShowTorIndicator';
import { cn } from '@/lib/utils';

export function TorIndicator() {
  const { show } = useShowTorIndicator();
  const status = useTorStatus();
  const t = useTranslations('tor');

  // Keep the space reserved even when hidden to prevent navbar jitter
  const shouldHide = !show || status === 'unknown' || status === 'checking' || status === 'error';

  const isTor = status === 'tor';

  return (
    <div
      title={isTor ? t('connected') : t('notConnected')}
      className={cn(
        'flex items-center gap-1.5 rounded-md p-2 transition-colors',
        isTor ? 'text-green-500' : 'text-red-500',
        shouldHide && 'invisible',
      )}
    >
      {isTor ? (
        <>
          <ShieldCheck className="size-4" />
          <span>{t('labelTor')}</span>
        </>
      ) : (
        <>
          <Shield className="size-4" />
          <span>{t('labelNotTor')}</span>
        </>
      )}
    </div>
  );
}
