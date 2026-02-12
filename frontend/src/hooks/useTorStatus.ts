'use client';

import { useState, useEffect } from 'react';

type TorStatus = 'unknown' | 'checking' | 'tor' | 'not-tor' | 'error';

/**
 * Checks whether the current user is connecting via Tor.
 * Calls /api/tor-check once on mount and caches the result.
 */
export function useTorStatus() {
  const [status, setStatus] = useState<TorStatus>('unknown');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      setStatus('checking');
      try {
        const res = await fetch('/api/tor-check');
        if (!res.ok) throw new Error('check failed');
        const data = await res.json();
        if (!cancelled) {
          setStatus(data.tor ? 'tor' : 'not-tor');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return status;
}
