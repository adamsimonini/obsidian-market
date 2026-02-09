'use client';

import { Loader2 } from 'lucide-react';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCardCompact } from './MarketCardCompact';
import type { Market, MarketStatus } from '@/types/supabase';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  statusFilter?: MarketStatus;
  categoryId?: string;
  excludeIds?: string[];
  categoryMap?: Map<string, string>;
}

export function MarketList({
  onMarketSelect,
  statusFilter,
  categoryId,
  excludeIds,
  categoryMap,
}: MarketListProps) {
  const { markets, loading, error } = useMarkets({
    status: statusFilter,
    categoryId,
  });

  const filtered = excludeIds?.length
    ? markets.filter((m) => !excludeIds.includes(m.id))
    : markets;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Loading markets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-destructive">
          Error loading markets: {error.message}
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-muted-foreground">No markets found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      {filtered.map((market) => (
        <MarketCardCompact
          key={market.id}
          market={market}
          categoryName={market.category_id ? categoryMap?.get(market.category_id) : undefined}
          onSelect={onMarketSelect}
        />
      ))}
    </div>
  );
}
