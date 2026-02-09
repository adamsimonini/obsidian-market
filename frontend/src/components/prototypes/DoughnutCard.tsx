'use client';

import { useState } from 'react';
import { Pie, PieChart, Cell, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { CardLabel, DetailPanel, formatCurrency } from './shared';
import type { SampleMarket } from './shared';

interface DoughnutCardProps {
  market: SampleMarket;
  className?: string;
}

const chartConfig = {
  yes: { label: 'Yes', color: 'var(--color-primary)' },
  no: { label: 'No', color: 'var(--color-destructive)' },
} satisfies ChartConfig;

export function DoughnutCard({ market, className }: DoughnutCardProps) {
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
        <CardLabel label="Doughnut" />

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm leading-snug">{market.title}</CardTitle>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {market.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Doughnut Chart */}
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-semibold">{item.name}</p>
                      <p className="font-mono">{item.value}%</p>
                      <p className="text-muted-foreground">
                        Vol: {formatCurrency(market.volume * ((item.value as number) / 100))}
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
                innerRadius={55}
                outerRadius={80}
                strokeWidth={2}
                stroke="var(--color-background)"
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <g>
                          {/* Center icon */}
                          <foreignObject
                            x={(viewBox.cx ?? 0) - 8}
                            y={(viewBox.cy ?? 0) - 22}
                            width={16}
                            height={16}
                          >
                            <TrendingUp className="size-4 text-primary" />
                          </foreignObject>
                          {/* Percentage */}
                          <text
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan className="fill-foreground font-mono text-2xl font-bold">
                              {market.yesPercent}%
                            </tspan>
                          </text>
                          <text
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 24}
                            textAnchor="middle"
                          >
                            <tspan className="fill-muted-foreground text-[10px]">
                              YES
                            </tspan>
                          </text>
                        </g>
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

      {/* Bottom-sheet Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{market.title}</DrawerTitle>
            <DrawerDescription>Doughnut Variant — Swipe down to close</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <DetailPanel market={market} />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
