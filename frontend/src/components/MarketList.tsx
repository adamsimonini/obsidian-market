'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useMarkets } from '@/hooks/useMarkets';
import { MarketCardCompact } from './MarketCardCompact';
import type { LocalizedMarket, MarketStatus } from '@/types/supabase';

interface MarketListProps {
  statusFilter?: MarketStatus;
  excludeIds?: string[];
  categoryMap?: Map<string, string>;
  categorySlugMap?: Map<string, string>;
}

export function MarketList({ statusFilter, excludeIds, categoryMap, categorySlugMap }: MarketListProps) {
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const { markets, loading, error } = useMarkets({
    status: statusFilter,
  });

  const filtered = excludeIds?.length ? markets.filter((m) => !excludeIds.includes(m.id)) : markets;

  // Group by category when showing all markets
  const groups = useMemo(() => {
    if (!categoryMap?.size) return null;

    const map = new Map<string, LocalizedMarket[]>();
    const uncategorized: LocalizedMarket[] = [];

    for (const m of filtered) {
      if (m.category_id && categoryMap.has(m.category_id)) {
        const list = map.get(m.category_id) ?? [];
        list.push(m);
        map.set(m.category_id, list);
      } else {
        uncategorized.push(m);
      }
    }

    const result: { id: string | null; name: string; slug: string | null; markets: LocalizedMarket[] }[] = [];
    for (const [id, list] of map) {
      result.push({ id, name: categoryMap.get(id) ?? tc('other'), slug: categorySlugMap?.get(id) ?? null, markets: list });
    }
    // Sort groups alphabetically
    result.sort((a, b) => a.name.localeCompare(b.name));

    if (uncategorized.length > 0) {
      result.push({ id: null, name: tc('other'), slug: null, markets: uncategorized });
    }

    return result;
  }, [filtered, categoryMap, categorySlugMap, tc]);

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
        <p className="text-destructive">{t('errorLoading', { message: error.message })}</p>
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
            {group.slug ? (
              <Link
                href={`/categories/${group.slug}`}
                className="mb-3 flex items-center gap-1 text-lg font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                {group.name}
                <ChevronRight className="size-3.5" />
              </Link>
            ) : (
              <span className="mb-3 block text-lg font-bold text-muted-foreground">
                {group.name}
              </span>
            )}
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              {group.markets.map((market) => (
                <MarketCardCompact key={market.id} market={market} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Flat grid fallback (no category map provided)
  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
      {filtered.map((market) => (
        <MarketCardCompact key={market.id} market={market} />
      ))}
    </div>
  );
}
