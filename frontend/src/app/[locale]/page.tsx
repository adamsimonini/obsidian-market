'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MarketList } from '@/components/MarketList';
import { FeaturedMarket } from '@/components/FeaturedMarket';
import { TrendingSidebar } from '@/components/TrendingSidebar';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { CategoriesBar } from '@/components/CategoriesBar';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import { useMarkets } from '@/hooks/useMarkets';
import { useCategories } from '@/hooks/useCategories';

export default function HomePage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);
  const { categories } = useCategories();
  const { markets, loading } = useMarkets({ status: 'open' });
  const t = useTranslations('home');

  const canCreate = isAdmin && (role === 'super_admin' || role === 'market_creator');

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const categorySlugMap = useMemo(() => new Map(categories.map((c) => [c.id, c.slug])), [categories]);

  const featuredMarket = useMemo(() => {
    if (markets.length === 0) return null;
    return [...markets].sort((a, b) => b.total_volume - a.total_volume)[0];
  }, [markets]);

  const excludeIds = useMemo(() => (featuredMarket ? [featuredMarket.id] : []), [featuredMarket]);

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
          <Button variant="ghost" className="mb-4" onClick={() => setShowCreateForm(false)}>
            &larr; {t('backToMarkets')}
          </Button>
          <CreateMarketForm onClose={() => setShowCreateForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-main mx-auto px-4 py-8 md:px-8">
        {canCreate && (
          <div className="mb-6 flex justify-end">
            <Button onClick={() => setShowCreateForm(true)}>{t('createMarket')}</Button>
          </div>
        )}

        <CategoriesBar categories={categories} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
          <div className="min-w-0 space-y-6">
            {!loading && featuredMarket && (
              <FeaturedMarket market={featuredMarket} categoryName={featuredMarket.category_id ? categoryMap.get(featuredMarket.category_id) : undefined} />
            )}
            <MarketList excludeIds={excludeIds} categoryMap={categoryMap} categorySlugMap={categorySlugMap} />
          </div>
          <div className="hidden lg:block">
            <TrendingSidebar markets={markets} excludeId={featuredMarket?.id} categoryMap={categoryMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
