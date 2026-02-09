'use client';

import { useState } from 'react';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardLabel, DetailPanel, formatCurrency } from './shared';
import type { SampleMarket } from './shared';

interface DualBarsCardProps {
  market: SampleMarket;
  className?: string;
}

const chartConfig = {
  yes: { label: 'Yes', color: 'var(--color-primary)' },
  no: { label: 'No', color: 'var(--color-destructive)' },
} satisfies ChartConfig;

export function DualBarsCard({ market, className }: DualBarsCardProps) {
  const [open, setOpen] = useState(false);

  const data = [
    { name: 'Yes', value: market.yesPercent, fill: 'var(--color-yes)' },
    { name: 'No', value: market.noPercent, fill: 'var(--color-no)' },
  ];

  return (
    <>
      <Card
        className={`group relative cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(76,175,80,0.12)] ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        <CardLabel label="Dual Bars" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">{market.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {market.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Bar Chart */}
          <ChartContainer config={chartConfig} className="mx-auto aspect-[4/3] w-full max-h-[180px]">
            <BarChart data={data} barGap={8}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={32}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  const isYes = item.payload.name === 'Yes';
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-semibold">{item.payload.name}</p>
                      <p className="font-mono">{item.value}% probability</p>
                      <p className="text-muted-foreground">
                        Vol: {isYes ? formatCurrency(market.volume * 0.68) : formatCurrency(market.volume * 0.32)}
                      </p>
                      <p className="text-primary">Δ24h: +{market.change24h}%</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

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
            <DialogDescription>Dual Bars Variant — Tap/click to close</DialogDescription>
          </DialogHeader>
          <DetailPanel market={market} />
        </DialogContent>
      </Dialog>
    </>
  );
}
