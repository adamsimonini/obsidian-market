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

export function MarketCard({ market, onSelect }: MarketCardProps) {
  return (
    <Card
      className={cn('transition-colors', onSelect && 'cursor-pointer hover:border-primary/50')}
      onClick={() => onSelect?.(market)}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2">{market.title}</CardTitle>
        <CardAction>
          <Badge className={cn('border-0', statusVariant[market.status])}>
            {market.status.toUpperCase()}
          </Badge>
        </CardAction>
        {market.description && (
          <CardDescription className="line-clamp-3">
            {market.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Yes Odds</p>
            <p className="text-base font-bold">{market.yes_odds}x</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">No Odds</p>
            <p className="text-base font-bold">{market.no_odds}x</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="justify-between">
        <p className="text-xs text-muted-foreground">
          Deadline: {formatDeadline(market.resolution_deadline)}
        </p>
        {market.market_id_onchain && (
          <p className="text-xs text-muted-foreground/60">
            ID: {market.market_id_onchain}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
