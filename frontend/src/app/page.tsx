'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MarketList } from '@/components/MarketList';
import { FeaturedMarket } from '@/components/FeaturedMarket';
import { TrendingSidebar } from '@/components/TrendingSidebar';
import { CreateMarketForm } from '@/components/CreateMarketForm';
import { BetForm } from '@/components/BetForm';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import { useMarkets } from '@/hooks/useMarkets';
import { useCategories } from '@/hooks/useCategories';
import type { Market } from '@/types/supabase';

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);
  const { categories } = useCategories();
  const { markets, loading } = useMarkets({
    status: 'open',
    categoryId,
  });

  const canCreate = isAdmin && (role === 'super_admin' || role === 'market_creator');

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  // Hero = highest volume market in the current view; fallback to first
  const featuredMarket = useMemo(() => {
    if (markets.length === 0) return null;
    return [...markets].sort((a, b) => b.total_volume - a.total_volume)[0];
  }, [markets]);

  const excludeIds = useMemo(
    () => (featuredMarket ? [featuredMarket.id] : []),
    [featuredMarket],
  );

  // Full-screen views for BetForm / CreateMarketForm
  if (selectedMarket) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setSelectedMarket(null)}
          >
            &larr; Back to Markets
          </Button>
          <BetForm
            market={selectedMarket}
            onClose={() => setSelectedMarket(null)}
          />
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setShowCreateForm(false)}
          >
            &larr; Back to Markets
          </Button>
          <CreateMarketForm onClose={() => setShowCreateForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-main mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Markets</h1>
          {canCreate && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Market
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={!categoryId ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryId(undefined)}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryId === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryId(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
          {/* Left: Featured + Grid */}
          <div className="min-w-0 space-y-6">
            {/* Featured Market */}
            {!loading && featuredMarket && (
              <FeaturedMarket
                market={featuredMarket}
                categoryName={
                  featuredMarket.category_id
                    ? categoryMap.get(featuredMarket.category_id)
                    : undefined
                }
                onSelect={setSelectedMarket}
              />
            )}

            {/* Compact Grid */}
            <MarketList
              onMarketSelect={setSelectedMarket}
              onCategorySelect={setCategoryId}
              categoryId={categoryId}
              excludeIds={excludeIds}
              categoryMap={categoryMap}
            />
          </div>

          {/* Right: Sidebar (hidden on smaller screens) */}
          <div className="hidden lg:block">
            <TrendingSidebar
              markets={markets}
              excludeId={featuredMarket?.id}
              categoryMap={categoryMap}
              onSelect={setSelectedMarket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
