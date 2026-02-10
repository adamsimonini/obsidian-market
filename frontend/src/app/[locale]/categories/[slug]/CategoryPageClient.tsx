'use client';

import { useTranslations } from 'next-intl';
import { MarketCardCompact } from '@/components/MarketCardCompact';
import { FeaturedMarket } from '@/components/FeaturedMarket';
import type { LocalizedCategory, LocalizedMarket } from '@/types/supabase';

interface CategoryPageClientProps {
  category: LocalizedCategory;
  markets: LocalizedMarket[];
}

export function CategoryPageClient({ category, markets }: CategoryPageClientProps) {
  const t = useTranslations('home');

  if (markets.length === 0) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
          )}
        </div>
        <p className="text-muted-foreground">{t('noMarketsFound')}</p>
      </>
    );
  }

  // First market is the hero (already sorted by volume in server component)
  const [heroMarket, ...remainingMarkets] = markets;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Hero Card */}
      <div className="mb-6">
        <FeaturedMarket market={heroMarket} categoryName={category.name} />
      </div>

      {/* Remaining Markets Grid */}
      {remainingMarkets.length > 0 && (
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          {remainingMarkets.map((market) => (
            <MarketCardCompact key={market.id} market={market} />
          ))}
        </div>
      )}
    </>
  );
}
