'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAdmin } from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateMarketFormProps {
  onClose: () => void;
}

export function CreateMarketForm({ onClose }: CreateMarketFormProps) {
  const t = useTranslations('createMarket');
  const tc = useTranslations('common');
  const tw = useTranslations('wallet');
  const { address, connected } = useWallet();
  const { isAdmin, role, loading: adminLoading } = useAdmin(address);
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = isAdmin && (role === 'super_admin' || role === 'market_creator');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_rules: '',
    resolution_source: 'Admin manual',
    resolution_deadline: '',
    category_id: '',
    initial_liquidity: '1000',
  });

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!connected || !address) {
        setError(tw('connectFirst'));
        return;
      }

      if (!canCreate) {
        setError(t('noPermission'));
        return;
      }

      if (!formData.title || !formData.resolution_rules || !formData.resolution_deadline) {
        setError(t('fillRequired'));
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/admin/markets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: address,
            title: formData.title,
            description: formData.description || null,
            resolution_rules: formData.resolution_rules,
            resolution_source: formData.resolution_source,
            resolution_deadline: formData.resolution_deadline,
            category_id: formData.category_id || null,
            initial_liquidity: formData.initial_liquidity,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create market');
        }

        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : t('failed'));
      } finally {
        setLoading(false);
      }
    },
    [connected, address, canCreate, formData, onClose],
  );

  if (adminLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">{t('checkingAdmin')}</p>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-destructive">{t('noPermission')}</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive p-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('titleLabel')} *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('titlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('category')}</label>
            <select
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
            >
              <option value="">{t('noCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('resolutionRules')} *</label>
            <textarea
              value={formData.resolution_rules}
              onChange={(e) => handleChange('resolution_rules', e.target.value)}
              placeholder={t('rulesPlaceholder')}
              rows={3}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('resolutionDeadline')} *</label>
            <Input
              type="datetime-local"
              value={formData.resolution_deadline}
              onChange={(e) => handleChange('resolution_deadline', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{t('initialLiquidity')}</label>
            <Input
              type="number"
              min="100"
              value={formData.initial_liquidity}
              onChange={(e) => handleChange('initial_liquidity', e.target.value)}
              placeholder="1000"
            />
            <p className="text-xs text-muted-foreground">
              {t('liquidityHint')}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {t('submit')}
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {tc('cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
