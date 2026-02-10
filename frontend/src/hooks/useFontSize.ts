import { useSyncExternalStore, useCallback } from 'react';

export type FontSize = '14' | '16' | '18';

const STORAGE_KEY = 'font-size';
const DEFAULT: FontSize = '16';

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): FontSize {
  const v = document.documentElement.style.fontSize;
  if (v === '14px') return '14';
  if (v === '18px') return '18';
  return '16';
}

function getServerSnapshot(): FontSize {
  return DEFAULT;
}

function apply(size: FontSize) {
  if (size === '16') {
    document.documentElement.style.fontSize = '';
    localStorage.removeItem(STORAGE_KEY);
  } else {
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem(STORAGE_KEY, size);
  }
}

export function useFontSize() {
  const size = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSize = useCallback((next: FontSize) => {
    apply(next);
    listeners.forEach((cb) => cb());
  }, []);

  return { size, setSize } as const;
}
