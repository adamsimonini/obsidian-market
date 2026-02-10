'use client';

import { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MarketDetailPanel } from '@/components/MarketDetailPanel';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

// --- Change this to 'modal' to use a modal instead of inline expand ---
type InteractionMode = 'expand' | 'modal';
const INTERACTION_MODE: InteractionMode = 'expand';

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
  const tc = useTranslations('common');
  const td = useTranslations('marketDetail');
  const format = useFormatter();
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;

  const handleClick = () => {
    if (INTERACTION_MODE === 'modal') {
      setModalOpen(true);
    } else {
      setExpanded((v) => !v);
    }
  };

  return (
    <>
      <Card className={cn('cursor-pointer transition-all duration-300 hover:border-primary/50')} onClick={handleClick}>
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
            <span>{formatVolume(market.total_volume)} {tc('vol')}</span>
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

          {/* Inline expanded details */}
          <div className={cn('grid overflow-hidden transition-all duration-300', expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
            <div className="overflow-hidden">
              <div className="border-t pt-4">
                <MarketDetailPanel market={market} onTrade={onSelect} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal (used when INTERACTION_MODE === 'modal') */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{market.title}</DialogTitle>
            <DialogDescription>{td('marketDetails')}</DialogDescription>
          </DialogHeader>
          <MarketDetailPanel market={market} onTrade={onSelect} />
        </DialogContent>
      </Dialog>
    </>
  );
}
