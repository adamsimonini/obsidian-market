'use client';

import { useState } from 'react';
import { Pie, PieChart, Cell, Label } from 'recharts';
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

interface PieChartCardProps {
  market: SampleMarket;
  className?: string;
}

const chartConfig = {
  yes: { label: 'Yes', color: 'var(--color-primary)' },
  no: { label: 'No', color: 'var(--color-destructive)' },
} satisfies ChartConfig;

export function PieChartCard({ market, className }: PieChartCardProps) {
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
        <CardLabel label="Pie Chart" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">{market.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {market.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Pie Chart */}
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  const isYes = item.name === 'Yes';
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-semibold">{item.name}</p>
                      <p className="font-mono">{item.value}% probability</p>
                      <p className="text-muted-foreground">
                        Odds: {isYes ? '1:0.47' : '1:2.13'}
                      </p>
                      <p className="text-muted-foreground">
                        Vol: {formatCurrency(market.volume * (isYes ? 0.68 : 0.32))}
                      </p>
                    </div>
                  );
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                strokeWidth={2}
                stroke="var(--color-background)"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 8}
                            className="fill-foreground font-mono text-3xl font-bold"
                          >
                            {market.yesPercent}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                            className="fill-muted-foreground text-xs"
                          >
                            Yes
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
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

      {/* Detail Modal (overlay) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{market.title}</DialogTitle>
            <DialogDescription>Pie Chart Variant — Tap/click to close</DialogDescription>
          </DialogHeader>
          <DetailPanel market={market} />
        </DialogContent>
      </Dialog>
    </>
  );
}
