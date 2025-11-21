import { useState, useEffect } from 'react';
import { db } from '../lib/db';

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
        const result = await db.admins.checkAdmin(walletAddress);
        setIsAdmin(result);
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

