'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCardCompact } from './MarketCardCompact';
import type { Market, MarketStatus } from '@/types/supabase';

interface MarketListProps {
  onMarketSelect?: (market: Market) => void;
  onCategorySelect?: (categoryId: string) => void;
  statusFilter?: MarketStatus;
  categoryId?: string;
  excludeIds?: string[];
  categoryMap?: Map<string, string>;
}

export function MarketList({
  onMarketSelect,
  onCategorySelect,
  statusFilter,
  categoryId,
  excludeIds,
  categoryMap,
}: MarketListProps) {
  const t = useTranslations('home');
  const { markets, loading, error } = useMarkets({
    status: statusFilter,
    categoryId,
  });

  const filtered = excludeIds?.length
    ? markets.filter((m) => !excludeIds.includes(m.id))
    : markets;

  // Group by category when showing all markets
  const groups = useMemo(() => {
    if (categoryId || !categoryMap?.size) return null;

    const map = new Map<string, Market[]>();
    const uncategorized: Market[] = [];

    for (const m of filtered) {
      if (m.category_id && categoryMap.has(m.category_id)) {
        const list = map.get(m.category_id) ?? [];
        list.push(m);
        map.set(m.category_id, list);
      } else {
        uncategorized.push(m);
      }
    }

    const result: { id: string | null; name: string; markets: Market[] }[] = [];
    for (const [id, list] of map) {
      result.push({ id, name: categoryMap.get(id) ?? 'Other', markets: list });
    }
    // Sort groups alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));

    if (uncategorized.length > 0) {
      result.push({ id: null, name: 'Other', markets: uncategorized });
    }

    return result;
  }, [filtered, categoryId, categoryMap]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">{t('loadingMarkets')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-destructive">
          {t('errorLoading', { message: error.message })}
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-muted-foreground">{t('noMarketsFound')}</p>
      </div>
    );
  }

  // Grouped view when showing all categories
  if (groups) {
    return (
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.id ?? 'other'}>
            <button
              className="mb-3 flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => group.id && onCategorySelect?.(group.id)}
              disabled={!group.id}
            >
              {group.name}
              {group.id && <ChevronRight className="size-3.5" />}
            </button>
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              {group.markets.map((market) => (
                <MarketCardCompact
                  key={market.id}
                  market={market}
                  onSelect={onMarketSelect}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Flat grid when a specific category is selected
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
