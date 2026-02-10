'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { CardLabel, DetailPanel, formatCurrency } from './shared';
import type { SampleMarket } from './shared';

interface SplitCardProps {
  market: SampleMarket;
  className?: string;
}

export function SplitCard({ market, className }: SplitCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className={`group relative cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(76,175,80,0.12)] ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        <CardLabel label="Split Card" />

        {/* Title bar */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-snug">{market.title}</p>
            <Badge variant="outline" className="shrink-0 text-[0.625rem]">
              {market.category}
            </Badge>
          </div>
        </div>

        {/* Split visualization */}
        <div className="relative flex h-36 overflow-hidden">
          {/* Yes side */}
          <div
            className="flex flex-col items-center justify-center bg-primary/10 transition-all duration-500"
            style={{ width: `${market.yesPercent}%` }}
          >
            <span className="font-mono text-3xl font-bold text-primary">
              {market.yesPercent}%
            </span>
            <span className="mt-0.5 text-xs font-medium tracking-wider text-primary/70">YES</span>
          </div>

          {/* Divider */}
          <div className="relative z-10 w-px shrink-0">
            <div className="absolute inset-y-0 -left-px w-0.5 bg-border" />
            {/* Diagonal cut effect */}
            <div
              className="absolute -left-3 top-0 h-full w-6"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, transparent 40%, transparent 60%, var(--color-destructive) 100%)',
                opacity: 0.08,
              }}
            />
          </div>

          {/* No side */}
          <div
            className="flex flex-col items-center justify-center bg-destructive/10 transition-all duration-500"
            style={{ width: `${market.noPercent}%` }}
          >
            <span className="font-mono text-3xl font-bold text-destructive">
              {market.noPercent}%
            </span>
            <span className="mt-0.5 text-xs font-medium tracking-wider text-destructive/70">NO</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between px-6 py-3 text-xs text-muted-foreground">
          <span>
            <span className="font-mono font-semibold text-foreground">{formatCurrency(market.volume)}</span> vol
          </span>
          <span className="font-mono text-primary">+{market.change24h}%</span>
          <span>{market.trades.toLocaleString()} trades</span>
        </div>
      </Card>

      {/* Bottom-sheet Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{market.title}</DrawerTitle>
            <DrawerDescription>Split Card Variant — Swipe down to close</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <DetailPanel market={market} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
