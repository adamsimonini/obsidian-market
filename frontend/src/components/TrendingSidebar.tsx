'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

interface TrendingSidebarProps {
  markets: Market[];
  excludeId?: string;
  categoryMap: Map<string, string>;
  onSelect?: (market: Market) => void;
}

function SidebarEntry({ rank, market, categoryName, onSelect }: { rank: number; market: Market; categoryName?: string; onSelect?: (market: Market) => void }) {
  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;
  const yesWins = yesPercent >= noPercent;
  const displayPercent = yesWins ? yesPercent : noPercent;

  return (
    <button className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted/50" onClick={() => onSelect?.(market)}>
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-bold text-muted-foreground">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{market.title}</p>
        <div className="mt-1 flex items-center gap-2">
          {categoryName && (
            <Badge variant="outline" className="h-4 px-1 text-[0.5625rem]">
              {categoryName}
            </Badge>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className={cn('block text-sm font-bold tabular-nums', yesWins ? 'text-primary' : 'text-destructive')}>{displayPercent}%</span>
        <span className={cn('text-[-4px]', yesWins ? 'text-primary/70' : 'text-destructive/70')}>{yesWins ? 'Yes' : 'No'}</span>
      </div>
    </button>
  );
}

export function TrendingSidebar({ markets, excludeId, categoryMap, onSelect }: TrendingSidebarProps) {
  const { topByVolume, latest } = useMemo(() => {
    const filtered = excludeId ? markets.filter((m) => m.id !== excludeId) : markets;

    const topByVolume = [...filtered].sort((a, b) => b.total_volume - a.total_volume).slice(0, 5);

    const latest = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

    return { topByVolume, latest };
  }, [markets, excludeId]);

  return (
    <div className="space-y-4">
      {/* Top Markets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Top Markets</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          {topByVolume.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">No markets yet</p>
          ) : (
            <div className="divide-y divide-border/50">
              {topByVolume.map((market, i) => (
                <SidebarEntry key={market.id} rank={i + 1} market={market} categoryName={market.category_id ? categoryMap.get(market.category_id) : undefined} onSelect={onSelect} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Markets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Latest</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          {latest.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">No markets yet</p>
          ) : (
            <div className="divide-y divide-border/50">
              {latest.map((market, i) => (
                <SidebarEntry key={market.id} rank={i + 1} market={market} categoryName={market.category_id ? categoryMap.get(market.category_id) : undefined} onSelect={onSelect} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
