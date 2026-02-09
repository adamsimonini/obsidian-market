'use client';

import { Loader2 } from 'lucide-react';
import { useMarkets } from '@/hooks/useMarkets';
import { useCategories } from '@/hooks/useCategories';
import { MarketCard } from './MarketCard';
import { Button } from '@/components/ui/button';
import type { Market, MarketStatus } from '@/types/supabase';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  statusFilter?: MarketStatus;
  categoryId?: string;
  onCategoryChange?: (categoryId: string | undefined) => void;
}

export function MarketList({
  onMarketSelect,
  statusFilter,
  categoryId,
  onCategoryChange,
}: MarketListProps) {
  const { markets, loading, error } = useMarkets({
    status: statusFilter,
    categoryId,
  });
  const { categories } = useCategories();

  // Build category name lookup
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      {onCategoryChange && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!categoryId ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={categoryId === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Loading markets...</p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-10">
          <p className="text-destructive">
            Error loading markets: {error.message}
          </p>
        </div>
      ) : markets.length === 0 ? (
        <div className="flex items-center justify-center p-10">
          <p className="text-muted-foreground">No markets found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {markets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              categoryName={market.category_id ? categoryMap.get(market.category_id) : undefined}
              onSelect={onMarketSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
