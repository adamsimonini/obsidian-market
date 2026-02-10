'use client';

import { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BetForm } from '@/components/BetForm';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import type { LocalizedMarket } from '@/types/supabase';

interface MarketDetailClientProps {
  market: LocalizedMarket;
  categoryName: string | null;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
  return `$${volume.toFixed(0)}`;
}

function formatPercent(price: number): string {
  return `${Math.round(price * 100)}%`;
}

const statusVariant: Record<string, string> = {
  open: 'bg-primary text-primary-foreground',
  closed: 'bg-accent text-accent-foreground',
  resolved: 'bg-blue-500 text-white',
  cancelled: 'bg-destructive text-white',
};

export function MarketDetailClient({ market, categoryName }: MarketDetailClientProps) {
  const t = useTranslations('marketDetail');
  const tc = useTranslations('common');
  const format = useFormatter();
  const [showBetForm, setShowBetForm] = useState(false);

  const yesPercent = Math.round(market.yes_price * 100);
  const noPercent = 100 - yesPercent;
  const roiYes = market.yes_price > 0 ? ((1 / market.yes_price) - 1) * 100 : 0;
  const roiNo = market.no_price > 0 ? ((1 / market.no_price) - 1) * 100 : 0;

  if (showBetForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <Button variant="ghost" className="mb-4" onClick={() => setShowBetForm(false)}>
            &larr; {tc('back')}
          </Button>
          <BetForm market={market} onClose={() => setShowBetForm(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <Link href="/" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          &larr; {tc('back')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {categoryName && (
              <Badge variant="outline">{categoryName}</Badge>
            )}
            <Badge className={cn('border-0', statusVariant[market.status])}>
              {market.status.toUpperCase()}
            </Badge>
          </div>
          <h1 className="mb-3 text-3xl font-bold">{market.title}</h1>
          {market.description && (
            <p className="text-lg text-muted-foreground">{market.description}</p>
          )}
        </div>

        {/* Price cards */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Card className="border-primary/20">
            <CardContent className="py-6 text-center">
              <p className="mb-1 text-sm text-muted-foreground">{tc('yes')}</p>
              <p className={cn('text-4xl font-bold', yesPercent >= 50 ? 'text-primary' : 'text-muted-foreground')}>
                {yesPercent}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ROI: +{roiYes.toFixed(0)}%</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardContent className="py-6 text-center">
              <p className="mb-1 text-sm text-muted-foreground">{tc('no')}</p>
              <p className={cn('text-4xl font-bold', noPercent > 50 ? 'text-destructive' : 'text-muted-foreground')}>
                {noPercent}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">ROI: +{roiNo.toFixed(0)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Trade button */}
        {market.status === 'open' && (
          <Button className="mb-8 w-full" size="lg" onClick={() => setShowBetForm(true)}>
            {tc('trade')}
          </Button>
        )}

        {/* Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">{t('marketDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('volume')}</p>
                <p className="font-mono font-semibold">{formatVolume(market.total_volume)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('volume24h')}</p>
                <p className="font-mono font-semibold">{formatVolume(market.volume_24h)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('liquidity')}</p>
                <p className="font-mono font-semibold">{formatVolume(market.liquidity)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('trades')}</p>
                <p className="font-mono font-semibold">{market.trade_count}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('fee')}</p>
                <p className="font-mono font-semibold">{(market.fee_bps / 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('deadline')}</p>
                <p className="font-mono font-semibold">
                  {format.dateTime(new Date(market.resolution_deadline), { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resolution rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('resolutionRules')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{market.resolution_rules}</p>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t('source')}</p>
              <p className="text-sm">{market.resolution_source}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
