'use client';

import { Button } from '@/components/ui/button';
import type { Market } from '@/types/supabase';

interface MarketDetailPanelProps {
  market: Market;
  onTrade?: (market: Market) => void;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function formatDeadline(deadline: string) {
  return new Date(deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function MarketDetailPanel({ market, onTrade }: MarketDetailPanelProps) {
  const roiYes = market.yes_price > 0 ? ((1 / market.yes_price) - 1) * 100 : 0;
  const roiNo = market.no_price > 0 ? ((1 / market.no_price) - 1) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Volume" value={formatVolume(market.total_volume)} />
        <Stat label="24h Volume" value={formatVolume(market.volume_24h)} />
        <Stat label="Liquidity" value={formatVolume(market.liquidity)} />
        <Stat label="Trades" value={market.trade_count.toLocaleString()} />
        <Stat label="Fee" value={`${(market.fee_bps / 100).toFixed(1)}%`} />
        <Stat label="Deadline" value={formatDeadline(market.resolution_deadline)} />
      </div>

      {/* ROI */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Potential ROI</p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">Buy Yes</p>
            <p className="font-mono text-sm font-bold text-primary">+{roiYes.toFixed(0)}%</p>
          </div>
          <div className="flex-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">Buy No</p>
            <p className="font-mono text-sm font-bold text-destructive">+{roiNo.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Trade button */}
      {onTrade && (
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onTrade(market);
          }}
        >
          Trade
        </Button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
