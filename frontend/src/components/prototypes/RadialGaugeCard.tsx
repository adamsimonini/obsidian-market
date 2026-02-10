'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardLabel, DetailPanel, formatCurrency } from './shared';
import type { SampleMarket } from './shared';

interface RadialGaugeCardProps {
  market: SampleMarket;
  className?: string;
}

/**
 * Semi-circular gauge with two competing arcs — Yes (primary) from
 * the left and No (destructive) from the right, meeting at the split point.
 */
function SemiGauge({ yesPercent, noPercent }: { yesPercent: number; noPercent: number }) {
  const cx = 100;
  const cy = 95;
  const r = 75;
  const strokeWidth = 12;

  // Semi-circle spans from 180° (left) to 0° (right)
  const startAngle = Math.PI;
  const totalAngle = Math.PI;

  // Split point where the two arcs meet
  const splitAngle = startAngle - totalAngle * (yesPercent / 100);
  const splitX = cx + r * Math.cos(splitAngle);
  const splitY = cy - r * Math.sin(splitAngle);

  // Endpoints
  const leftX = cx + r * Math.cos(Math.PI); // 25
  const leftY = cy - r * Math.sin(Math.PI); // 95
  const rightX = cx + r * Math.cos(0); // 175
  const rightY = cy - r * Math.sin(0); // 95

  // Yes arc: left endpoint → split point (clockwise)
  const yesPath = `M ${leftX} ${leftY} A ${r} ${r} 0 0 1 ${splitX} ${splitY}`;
  // No arc: split point → right endpoint (clockwise)
  const noPath = `M ${splitX} ${splitY} A ${r} ${r} 0 0 1 ${rightX} ${rightY}`;

  const labelY = cy + 14;

  return (
    <svg viewBox="0 0 200 120" className="w-full">
      {/* Yes arc (green, from left) */}
      <path
        d={yesPath}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="transition-all duration-700"
        style={{ filter: 'drop-shadow(0 0 6px rgba(76,175,80,0.4))' }}
      />
      {/* No arc (red, from right) */}
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

export function RadialGaugeCard({ market, className }: RadialGaugeCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={`group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(76,175,80,0.12)] ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        <CardLabel label="Radial Gauge" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">{market.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[0.625rem]">
              {market.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Gauge */}
          <div className="mx-auto max-w-60 px-2">
            <SemiGauge yesPercent={market.yesPercent} noPercent={market.noPercent} />
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            <span>
              <span className="font-mono font-semibold text-foreground">{formatCurrency(market.volume)}</span> vol
            </span>
            <span className="font-mono text-primary">+{market.change24h}%</span>
            <span>{market.trades.toLocaleString()} trades</span>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{market.title}</DialogTitle>
            <DialogDescription>Radial Gauge Variant — Tap/click to close</DialogDescription>
          </DialogHeader>
          <DetailPanel market={market} />
        </DialogContent>
      </Dialog>
    </>
  );
}
