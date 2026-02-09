'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Market } from '@/types/supabase';

interface MarketCardProps {
  market: Market;
  categoryName?: string;
  onSelect?: (market: Market) => void;
}

const statusVariant: Record<Market['status'], string> = {
  open: 'bg-primary text-primary-foreground',
  closed: 'bg-accent text-accent-foreground',
  resolved: 'bg-blue-500 text-white',
  cancelled: 'bg-destructive text-white',
};

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString();
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toFixed(0);
}

function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}

export function MarketCard({ market, categoryName, onSelect }: MarketCardProps) {
  return (
    <Card
      className={cn(
        'transition-colors',
        onSelect && 'cursor-pointer hover:border-primary/50',
        market.featured && 'border-primary/30',
      )}
      onClick={() => onSelect?.(market)}
    >
      <CardHeader>
        <div className="flex items-start gap-2">
          <CardTitle className="line-clamp-2 flex-1">{market.title}</CardTitle>
          <CardAction>
            <Badge className={cn('border-0', statusVariant[market.status])}>
              {market.status.toUpperCase()}
            </Badge>
          </CardAction>
        </div>
        {market.description && (
          <CardDescription className="line-clamp-2">
            {market.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Yes</p>
            <p className={cn(
              'text-lg font-bold',
              market.yes_price > 0.5 ? 'text-green-500' : 'text-muted-foreground',
            )}>
              {formatPercent(market.yes_price)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">No</p>
            <p className={cn(
              'text-lg font-bold',
              market.no_price > 0.5 ? 'text-red-500' : 'text-muted-foreground',
            )}>
              {formatPercent(market.no_price)}
            </p>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-sm font-semibold">{formatVolume(market.total_volume)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          {categoryName && (
            <Badge variant="outline" className="text-xs">
              {categoryName}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground">
            {formatDeadline(market.resolution_deadline)}
          </p>
        </div>
        {market.trade_count > 0 && (
          <p className="text-xs text-muted-foreground">
            {market.trade_count} trade{market.trade_count !== 1 ? 's' : ''}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
