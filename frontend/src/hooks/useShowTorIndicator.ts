'use client';

import { useSyncExternalStore, useCallback } from 'react';

const STORAGE_KEY = 'show-tor-indicator';

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true; // default: show
  return stored === '1';
}
function getServerSnapshot() {
  return true;
}

function apply(show: boolean) {
  localStorage.setItem(STORAGE_KEY, show ? '1' : '0');
  listeners.forEach((cb) => cb());
}

export function useShowTorIndicator() {
  const show = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setShow = useCallback((value: boolean) => {
    if (value !== show) {
      apply(value);
    }
  }, [show]);

  return { show, setShow } as const;
}
