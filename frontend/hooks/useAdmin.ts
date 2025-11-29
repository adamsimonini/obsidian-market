import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin(walletAddress: string | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!walletAddress) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('admins')
          .select('wallet_address')
          .eq('wallet_address', walletAddress)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is expected for non-admins
          throw fetchError;
        }

        setIsAdmin(!!data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to check admin status'),
        );
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [walletAddress]);

  return { isAdmin, loading, error };
}

