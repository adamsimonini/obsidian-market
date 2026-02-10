'use client';

import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import type { LocalizedMarket } from '@/types/supabase';

interface FeaturedMarketProps {
  market: LocalizedMarket;
  categoryName?: string;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toFixed(0);
}

/**
 * Semi-circular gauge with two competing arcs — Yes (primary) from
 * the left and No (destructive) from the right.
 * Yes/No labels are baked into the SVG, positioned under each arc end.
 */
function SemiGauge({ yesPercent, noPercent }: { yesPercent: number; noPercent: number }) {
  const cx = 100;
  const cy = 85;
  const r = 70;
  const strokeWidth = 12;

  const startAngle = Math.PI;
  const totalAngle = Math.PI;

  const splitAngle = startAngle - totalAngle * (yesPercent / 100);
  const splitX = cx + r * Math.cos(splitAngle);
  const splitY = cy - r * Math.sin(splitAngle);

  const leftX = cx + r * Math.cos(Math.PI);
  const leftY = cy - r * Math.sin(Math.PI);
  const rightX = cx + r * Math.cos(0);
  const rightY = cy - r * Math.sin(0);

  const yesPath = `M ${leftX} ${leftY} A ${r} ${r} 0 0 1 ${splitX} ${splitY}`;
  const noPath = `M ${splitX} ${splitY} A ${r} ${r} 0 0 1 ${rightX} ${rightY}`;

  const labelY = cy + 14;

  return (
    <svg viewBox="0 0 200 120" className="w-full">
      <path
        d={yesPath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-700"
        style={{ filter: 'drop-shadow(0 0 6px rgba(76,175,80,0.4))' }}
      />
      <path
        d={noPath}
        fill="none"
        stroke="var(--color-destructive)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-700"
        style={{ filter: 'drop-shadow(0 0 6px rgba(244,67,54,0.3))' }}
      />
      {/* Center text — show winning side */}
      <text x={cx} y={cy - 8} textAnchor="middle" className={`font-mono text-3xl font-bold ${yesPercent >= noPercent ? 'fill-primary' : 'fill-destructive'}`}>
        {yesPercent >= noPercent ? yesPercent : noPercent}%
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
        {yesPercent >= noPercent ? 'YES' : 'NO'}
      </text>
      {/* Yes label — under left arc end */}
      <circle cx={22} cy={labelY - 1} r={3.5} fill="var(--color-primary)" />
      <text x={30} y={labelY} textAnchor="start" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
        Yes
      </text>
      <text x={50} y={labelY} textAnchor="start" dominantBaseline="middle" className="fill-primary font-mono text-xs font-bold">
        {yesPercent}%
      </text>
      {/* No label — under right arc end */}
      <text x={150} y={labelY} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[10px]">
        No
      </text>
      <text x={155} y={labelY} textAnchor="start" dominantBaseline="middle" className="fill-destructive font-mono text-xs font-bold">
        {noPercent}%
      </text>
      <circle cx={182} cy={labelY - 1} r={3.5} fill="var(--color-destructive)" />
    </svg>
  );
}

export function FeaturedMarket({ market, categoryName }: FeaturedMarketProps) {
  const tc = useTranslations('common');
  const format = useFormatter();

  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;

  return (
    <Link href={`/markets/${market.slug}`} className="block">
      <Card className={cn('cursor-pointer border-primary/30 transition-all duration-300 hover:border-primary/60')}>
        {/* Title + Badge (full width) */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl leading-tight md:text-2xl">{market.title}</CardTitle>
            {categoryName && (
              <Badge variant="outline" className="shrink-0 text-xs">
                {categoryName}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Equal 50/50 split: info left, gauge right */}
          <div className="mb-0 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
            {/* Left: description + stats */}
            <div className="flex flex-col gap-4 order-2 md:order-1 md:pt-3">
              {market.description && <p className="text-sm text-muted-foreground">{market.description}</p>}

              {/* Stats */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{formatVolume(market.total_volume)}</span>
                  <span>{tc('volume')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{market.trade_count}</span>
                  <span>{tc('trades', { count: market.trade_count })}</span>
                </div>
              </div>

              {/* Ends date — pushed to bottom to align with gauge baseline */}
              <div className="mt-auto text-sm text-muted-foreground">
                <span>{tc('ends', { date: format.dateTime(new Date(market.resolution_deadline), { month: 'short', day: 'numeric', year: 'numeric' }) })}</span>
              </div>
            </div>

            {/* Right: radial gauge (with Yes/No labels baked in) */}
            <div className="order-1 md:order-2">
              <SemiGauge yesPercent={yesPercent} noPercent={noPercent} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
