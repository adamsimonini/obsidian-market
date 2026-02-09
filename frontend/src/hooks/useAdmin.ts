'use client';

import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { AdminRole } from '@/types/supabase';

export function useAdmin(walletAddress: string | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!walletAddress) {
        setIsAdmin(false);
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await getSupabase()
          .from('admins')
          .select('wallet_address, role')
          .eq('wallet_address', walletAddress)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        setIsAdmin(!!data);
        setRole(data?.role ?? null);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to check admin status'),
        );
        setIsAdmin(false);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [walletAddress]);

  return { isAdmin, role, loading, error };
}
