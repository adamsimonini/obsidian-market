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
import { cn } from '@/lib/utils';
import { CardLabel, DetailPanel, formatCurrency } from './shared';
import type { SampleMarket } from './shared';

interface LinearGaugeCardProps {
  market: SampleMarket;
  className?: string;
}

export function LinearGaugeCard({ market, className }: LinearGaugeCardProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card
        className={cn(
          'group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(76,175,80,0.12)]',
          className,
        )}
        onClick={() => {
          // On mobile (<md), open modal. On desktop, toggle inline expand.
          if (window.innerWidth < 768) {
            setOpen(true);
          } else {
            setExpanded((v) => !v);
          }
        }}
      >
        <CardLabel label="Linear Gauge" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">{market.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[0.625rem]">
              {market.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Labels */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold text-primary">{market.yesPercent}%</span>
              <span className="text-xs text-muted-foreground">Yes</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">No</span>
              <span className="font-mono text-2xl font-bold text-destructive">{market.noPercent}%</span>
            </div>
          </div>

          {/* Linear gauge bar */}
          <div className="relative h-5 w-full overflow-hidden rounded-full">
            {/* Yes side: solid fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-full bg-primary transition-all duration-700"
              style={{ width: `${market.yesPercent}%` }}
            />
            {/* No side: striped fill */}
            <div
              className="absolute inset-y-0 right-0 overflow-hidden rounded-r-full"
              style={{ width: `${market.noPercent}%` }}
            >
              <div
                className="h-full w-full bg-destructive/80"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 6px)',
                }}
              />
            </div>
          </div>

          {/* Threshold markers */}
          <div className="relative h-3">
            <div className="absolute left-[25%] top-0 h-2 w-px bg-border" />
            <div className="absolute left-[50%] top-0 h-2 w-px bg-border" />
            <div className="absolute left-[75%] top-0 h-2 w-px bg-border" />
            <div className="absolute left-[25%] top-2 -translate-x-1/2 text-[0.5rem] text-muted-foreground/50">25</div>
            <div className="absolute left-[50%] top-2 -translate-x-1/2 text-[0.5rem] text-muted-foreground/50">50</div>
            <div className="absolute left-[75%] top-2 -translate-x-1/2 text-[0.5rem] text-muted-foreground/50">75</div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
            <span>
              <span className="font-mono font-semibold text-foreground">{formatCurrency(market.volume)}</span> vol
            </span>
            <span className="font-mono text-primary">+{market.change24h}%</span>
            <span>{market.trades.toLocaleString()} trades</span>
          </div>

          {/* Inline expanded stats (desktop) */}
          <div
            className={cn(
              'grid overflow-hidden transition-all duration-300',
              expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <div className="border-t pt-4">
                <DetailPanel market={market} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{market.title}</DialogTitle>
            <DialogDescription>Linear Gauge Variant — Tap to close</DialogDescription>
          </DialogHeader>
          <DetailPanel market={market} />
        </DialogContent>
      </Dialog>
    </>
  );
}
