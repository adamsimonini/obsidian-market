'use client';

import { useTranslations, useFormatter } from 'next-intl';
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

export function MarketDetailPanel({ market, onTrade }: MarketDetailPanelProps) {
  const t = useTranslations('marketDetail');
  const tc = useTranslations('common');
  const format = useFormatter();
  const roiYes = market.yes_price > 0 ? ((1 / market.yes_price) - 1) * 100 : 0;
  const roiNo = market.no_price > 0 ? ((1 / market.no_price) - 1) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label={t('volume')} value={formatVolume(market.total_volume)} />
        <Stat label={t('volume24h')} value={formatVolume(market.volume_24h)} />
        <Stat label={t('liquidity')} value={formatVolume(market.liquidity)} />
        <Stat label={t('trades')} value={market.trade_count.toLocaleString()} />
        <Stat label={t('fee')} value={`${(market.fee_bps / 100).toFixed(1)}%`} />
        <Stat label={t('deadline')} value={format.dateTime(new Date(market.resolution_deadline), { month: 'short', day: 'numeric', year: 'numeric' })} />
      </div>

      {/* ROI */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{t('potentialRoi')}</p>
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center">
            <p className="text-[0.625rem] text-muted-foreground">{t('buyYes')}</p>
            <p className="font-mono text-sm font-bold text-primary">+{roiYes.toFixed(0)}%</p>
          </div>
          <div className="flex-1 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-center">
            <p className="text-[0.625rem] text-muted-foreground">{t('buyNo')}</p>
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
          {tc('trade')}
        </Button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <p className="text-[0.625rem] text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}
