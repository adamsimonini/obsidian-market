'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

interface MarketCardCompactProps {
  market: Market;
  categoryName?: string;
  onSelect?: (market: Market) => void;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toFixed(0);
}

export function MarketCardCompact({ market, categoryName, onSelect }: MarketCardCompactProps) {
  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:border-primary/50',
      )}
      onClick={() => onSelect?.(market)}
    >
      <CardContent className="space-y-3 p-4">
        {/* Title */}
        <p className="line-clamp-2 text-sm font-semibold leading-snug">{market.title}</p>

        {/* Probability Bar */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between text-xs">
            <span>
              <span className={cn('font-bold', yesPercent >= 50 ? 'text-primary' : 'text-muted-foreground')}>
                {yesPercent}%
              </span>{' '}
              <span className="text-muted-foreground">Yes</span>
            </span>
            <span>
              <span className="text-muted-foreground">No</span>{' '}
              <span className={cn('font-bold', noPercent > 50 ? 'text-destructive' : 'text-muted-foreground')}>
                {noPercent}%
              </span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatVolume(market.total_volume)} vol</span>
          <span className="text-border">|</span>
          <span>{market.trade_count} trade{market.trade_count !== 1 ? 's' : ''}</span>
          {categoryName && (
            <>
              <span className="flex-1" />
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {categoryName}
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
