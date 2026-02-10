'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { COMPACT_NUMBER } from '@/lib/locale-utils';
import type { LocalizedMarket } from '@/types/supabase';

interface MarketCardCompactProps {
  market: LocalizedMarket;
  categoryName?: string;
}

export function MarketCardCompact({ market, categoryName }: MarketCardCompactProps) {
  const tc = useTranslations('common');
  const format = useFormatter();

  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;

  return (
    <Link href={`/markets/${market.slug}`} className="block">
      <Card className={cn('cursor-pointer transition-all duration-300 hover:border-primary/50')}>
        <CardContent className="space-y-3 px-6">
          {/* Title — fixed 2-line height so cards stay aligned side-by-side */}
          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">{market.title}</p>

          {/* Labels */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className={cn('font-mono text-lg font-bold', yesPercent >= 50 ? 'text-primary' : 'text-muted-foreground')}>{yesPercent}%</span>
              <span className="text-xs text-muted-foreground">{tc('yes')}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">{tc('no')}</span>
              <span className={cn('font-mono text-lg font-bold', noPercent > 50 ? 'text-destructive' : 'text-muted-foreground')}>{noPercent}%</span>
            </div>
          </div>

          {/* Linear gauge: solid yes + striped no */}
          <div className="relative h-3 w-full overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 rounded-l-full bg-primary transition-all duration-700" style={{ width: `${yesPercent}%` }} />
            <div className="absolute inset-y-0 right-0 overflow-hidden rounded-r-full" style={{ width: `${noPercent}%` }}>
              <div
                className="h-full w-full bg-destructive/80"
                style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 6px)',
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{format.number(market.total_volume, COMPACT_NUMBER)} {tc('vol')}</span>
            <span className="text-border">|</span>
            <span>
              {tc('trades', { count: market.trade_count })}
            </span>
            {categoryName && (
              <>
                <span className="flex-1" />
                <Badge variant="outline" className="h-5 px-1.5 text-[0.625rem]">
                  {categoryName}
                </Badge>
              </>
            )}
          </div>

          {/* End date */}
          <p className="text-xs text-muted-foreground">{tc('ends', { date: format.dateTime(new Date(market.resolution_deadline), { month: 'short', day: 'numeric', year: 'numeric' }) })}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
