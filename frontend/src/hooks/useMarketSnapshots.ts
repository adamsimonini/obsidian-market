'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { MarketSnapshot } from '@/types/supabase';

export function useMarketSnapshots(marketId: string | null) {
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) {
      setSnapshots([]);
      setLoading(false);
      return;
    }

    const fetchSnapshots = async () => {
      try {
        setLoading(true);
        const { data, error } = await getSupabase()
          .from('market_snapshots')
          .select('*')
          .eq('market_id', marketId)
          .order('captured_at', { ascending: true });

        if (error) throw error;
        setSnapshots(data || []);
      } catch {
        setSnapshots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshots();
  }, [marketId]);

  return { snapshots, loading };
}
