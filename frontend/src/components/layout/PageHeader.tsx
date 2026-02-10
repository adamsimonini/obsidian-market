'use client';

import { useTranslations } from 'next-intl';

export function PageHeader() {
  const t = useTranslations('home');

  return (
    <div className="bg-background">
      <div className="container-main mx-auto px-4 pt-4 md:px-8">
        <h2 className="text-xl font-bold">{t('title')}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
      </div>
    </div>
  );
}
