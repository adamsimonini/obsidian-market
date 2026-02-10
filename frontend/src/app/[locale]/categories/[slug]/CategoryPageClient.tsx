'use client';

import { useTranslations } from 'next-intl';
import { MarketCardCompact } from '@/components/MarketCardCompact';
import { Link } from '@/i18n/navigation';
import type { LocalizedCategory, LocalizedMarket } from '@/types/supabase';

interface CategoryPageClientProps {
  category: LocalizedCategory;
  markets: LocalizedMarket[];
}

export function CategoryPageClient({ category, markets }: CategoryPageClientProps) {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <div className="min-h-screen bg-background">
      <div className="container-main mx-auto px-4 py-8 md:px-8">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          &larr; {tc('back')}
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>

        {markets.length === 0 ? (
          <p className="text-muted-foreground">{t('noMarketsFound')}</p>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            {markets.map((market) => (
              <MarketCardCompact key={market.id} market={market} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
