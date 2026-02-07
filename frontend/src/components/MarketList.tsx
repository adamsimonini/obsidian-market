'use client';

import { Loader2 } from 'lucide-react';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCard } from './MarketCard';
import type { Market, MarketStatus } from '@/types/supabase';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  statusFilter?: MarketStatus;
}

export function MarketList({ onMarketSelect, statusFilter }: MarketListProps) {
  const { markets, loading, error } = useMarkets(statusFilter);

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

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-muted-foreground">No markets found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} onSelect={onMarketSelect} />
      ))}
    </div>
  );
}
