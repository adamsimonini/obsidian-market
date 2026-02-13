'use client';

import { DualBarsCard } from '@/components/prototypes/DualBarsCard';
import { PieChartCard } from '@/components/prototypes/PieChartCard';
import { DoughnutCard } from '@/components/prototypes/DoughnutCard';
import { LinearGaugeCard } from '@/components/prototypes/LinearGaugeCard';
import { RadialGaugeCard } from '@/components/prototypes/RadialGaugeCard';
import { SplitCard } from '@/components/prototypes/SplitCard';
import { SAMPLE_MARKET } from '@/components/prototypes/shared';
import { DevBanner } from '@/components/DevBanner';

const cards = [
  { Component: DualBarsCard, label: 'Dual Bars — side-by-side vertical bars totaling 100%' },
  { Component: PieChartCard, label: 'Pie Chart — two slices with center label' },
  { Component: DoughnutCard, label: 'Doughnut — donut ring with center icon + %' },
  { Component: LinearGaugeCard, label: 'Linear Gauge — horizontal bar with solid/striped split' },
  { Component: RadialGaugeCard, label: 'Radial Gauge — semi-circular speedometer arc' },
  { Component: SplitCard, label: 'Split Card — dramatic left/right visual split' },
];

export default function PrototypesPage() {
  return (
    <>
    <DevBanner />
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold">Card Prototypes</h1>
          <p className="text-sm text-muted-foreground">
            Binary prediction market card variants. Hover for tooltips, click/tap for details.
            All cards use the same sample market data.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-1 font-mono">
              {SAMPLE_MARKET.title}
            </span>
            <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-primary">
              Yes {SAMPLE_MARKET.yesPercent}%
            </span>
            <span className="rounded-md bg-destructive/10 px-2 py-1 font-mono text-destructive">
              No {SAMPLE_MARKET.noPercent}%
            </span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ Component, label }, i) => (
            <div
              key={label}
              className="animate-in fade-in-0 slide-in-from-bottom-4 fill-mode-both duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="mb-2 text-xs text-muted-foreground">{label}</p>
              <Component market={SAMPLE_MARKET} />
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
