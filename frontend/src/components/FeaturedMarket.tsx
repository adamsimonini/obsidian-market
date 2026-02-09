'use client';

import { useMemo } from 'react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMarketSnapshots } from '@/hooks/useMarketSnapshots';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

interface FeaturedMarketProps {
  market: Market;
  categoryName?: string;
  onSelect?: (market: Market) => void;
}

const chartConfig = {
  yes_price: {
    label: 'Yes',
    color: 'var(--color-primary)',
  },
};

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toFixed(0);
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function FeaturedMarket({ market, categoryName, onSelect }: FeaturedMarketProps) {
  const { snapshots, loading: snapshotsLoading } = useMarketSnapshots(market.id);

  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;

  const chartData = useMemo(() => {
    if (snapshots.length === 0) return [];
    return snapshots.map((s) => ({
      date: new Date(s.captured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      yes_price: Math.round(s.yes_price * 100),
    }));
  }, [snapshots]);

  return (
    <Card
      className={cn(
        'cursor-pointer border-primary/30 transition-colors hover:border-primary/60',
      )}
      onClick={() => onSelect?.(market)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl leading-tight md:text-2xl">{market.title}</CardTitle>
            {market.description && (
              <CardDescription className="mt-1.5 line-clamp-2">
                {market.description}
              </CardDescription>
            )}
          </div>
          {categoryName && (
            <Badge variant="outline" className="shrink-0 text-xs">
              {categoryName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Probability Bar */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{yesPercent}%</span>
              <span className="text-sm text-muted-foreground">Yes</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">No</span>
              <span className="text-2xl font-bold text-destructive">{noPercent}%</span>
            </div>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${yesPercent}%` }}
            />
          </div>
        </div>

        {/* Area Chart */}
        {!snapshotsLoading && chartData.length > 1 && (
          <ChartContainer config={chartConfig} className="aspect-[3/1] w-full">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="fillYes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-yes_price)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-yes_price)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => v}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={36}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(v) => v}
                    formatter={(value) => [`${value}%`, 'Yes']}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="yes_price"
                stroke="var(--color-yes_price)"
                fill="url(#fillYes)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{formatVolume(market.total_volume)}</span>{' '}
            volume
          </span>
          <span>
            <span className="font-semibold text-foreground">{market.trade_count}</span>{' '}
            trade{market.trade_count !== 1 ? 's' : ''}
          </span>
          <span>Ends {formatDeadline(market.resolution_deadline)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
