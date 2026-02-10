'use client';

import { Badge } from '@/components/ui/badge';

// --- Sample data ---

export interface SampleMarket {
  title: string;
  yesPercent: number;
  noPercent: number;
  volume: number;
  volume24h: number;
  change24h: number;
  trades: number;
  liquidity: number;
  deadline: string;
  category: string;
}

export const SAMPLE_MARKET: SampleMarket = {
  title: 'Will BTC hit $120K by Mar 2026?',
  yesPercent: 68,
  noPercent: 32,
  volume: 15_200_000,
  volume24h: 1_850_000,
  change24h: 3.2,
  trades: 12_842,
  liquidity: 2_400_000,
  deadline: 'Mar 31, 2026',
  category: 'Crypto',
};

// --- Helpers ---

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

// --- Shared detail panel (used inside modals/drawers) ---

export function DetailPanel({ market }: { market: SampleMarket }) {
  const roiYes = ((1 / (market.yesPercent / 100)) - 1) * 100;
  const roiNo = ((1 / (market.noPercent / 100)) - 1) * 100;

  return (
    <div className="space-y-4">
      {/* Probability */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">
            Yes <span className="font-mono text-lg font-bold text-primary">{market.yesPercent}%</span>
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-mono text-lg font-bold text-destructive">{market.noPercent}%</span> No
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${market.yesPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCell label="Volume" value={formatCurrency(market.volume)} />
        <StatCell label="24h Volume" value={formatCurrency(market.volume24h)} />
        <StatCell label="Liquidity" value={formatCurrency(market.liquidity)} />
        <StatCell label="Trades" value={market.trades.toLocaleString()} />
        <StatCell label="24h Change" value={`+${market.change24h}%`} accent />
        <StatCell label="Deadline" value={market.deadline} />
      </div>

      {/* ROI */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Potential ROI</p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center">
            <p className="text-[0.625rem] text-muted-foreground">Buy Yes</p>
            <p className="font-mono text-sm font-bold text-primary">+{roiYes.toFixed(0)}%</p>
          </div>
          <div className="flex-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-center">
            <p className="text-[0.625rem] text-muted-foreground">Buy No</p>
            <p className="font-mono text-sm font-bold text-destructive">+{roiNo.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <p className="text-[0.625rem] text-muted-foreground">{label}</p>
      <p className={`font-mono text-sm font-semibold ${accent ? 'text-primary' : ''}`}>{value}</p>
    </div>
  );
}

// --- Card label badge ---

export function CardLabel({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="absolute -top-2.5 left-4 bg-background text-[0.625rem] font-mono uppercase tracking-wider">
      {label}
    </Badge>
  );
}
