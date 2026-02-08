'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAdmin } from '@/hooks/useAdmin';
import { getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreateMarketFormProps {
  onClose: () => void;
}

export function CreateMarketForm({ onClose }: CreateMarketFormProps) {
  const { address, connected } = useWallet();
  const { isAdmin, loading: adminLoading } = useAdmin(address);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_rules: '',
    resolution_source: 'Admin manual',
    resolution_deadline: '',
    yes_odds: '2.0',
    no_odds: '2.0',
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
        setError('Please connect your wallet first');
        return;
      }

      if (!isAdmin) {
        setError('Only admins can create markets');
        return;
      }

      if (!formData.title || !formData.resolution_rules || !formData.resolution_deadline) {
        setError('Please fill in all required fields');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const marketId = Date.now();

        const { error: supabaseError } = await getSupabase().from('markets').insert({
          title: formData.title,
          description: formData.description || null,
          resolution_rules: formData.resolution_rules,
          resolution_source: formData.resolution_source,
          resolution_deadline: formData.resolution_deadline,
          status: 'open',
          yes_odds: parseFloat(formData.yes_odds),
          no_odds: parseFloat(formData.no_odds),
          creator_address: address,
          market_id_onchain: marketId.toString(),
        });

        if (supabaseError) {
          throw supabaseError;
        }

        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create market');
      } finally {
        setLoading(false);
      }
    },
    [connected, address, isAdmin, formData, onClose],
  );

  if (adminLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-3 text-muted-foreground">Checking admin status...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-destructive">Only admins can create markets</p>
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Market</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive p-3">
              <p className="text-sm text-white">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Will Bitcoin reach $100k by end of 2024?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details about the market..."
              rows={3}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Resolution Rules *</label>
            <textarea
              value={formData.resolution_rules}
              onChange={(e) => handleChange('resolution_rules', e.target.value)}
              placeholder="How will this market be resolved?"
              rows={3}
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-[3px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Resolution Deadline *</label>
            <Input
              type="datetime-local"
              value={formData.resolution_deadline}
              onChange={(e) => handleChange('resolution_deadline', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Yes Odds</label>
              <Input
                type="number"
                step="0.1"
                min="1"
                value={formData.yes_odds}
                onChange={(e) => handleChange('yes_odds', e.target.value)}
                placeholder="2.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">No Odds</label>
              <Input
                type="number"
                step="0.1"
                min="1"
                value={formData.no_odds}
                onChange={(e) => handleChange('no_odds', e.target.value)}
                placeholder="2.0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              Create Market
            </Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
