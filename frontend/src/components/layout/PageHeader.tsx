'use client';

import { useTranslations } from 'next-intl';

export function PageHeader() {
  const t = useTranslations('home');

  return (
    <div className="bg-background">
      <div className="container-main mx-auto px-4 pt-4 md:px-8 ">
        <div className="ml-4">
          <h2 className="text-2xl font-bold">{t('description')}</h2>
          {/* <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p> */}
        </div>
      </div>
    </div>
  );
}
