import { useSyncExternalStore, useCallback } from 'react';

const STORAGE_KEY = 'wide-mode';

// Notify all hook instances within the same tab
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot() {
  return document.documentElement.hasAttribute('data-wide');
}
function getServerSnapshot() {
  return false;
}

function applyWide(on: boolean) {
  if (on) {
    document.documentElement.setAttribute('data-wide', '');
  } else {
    document.documentElement.removeAttribute('data-wide');
  }
  localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
}

export function useWideMode() {
  const wide = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleWide = useCallback(() => {
    applyWide(!wide);
    listeners.forEach((cb) => cb());
  }, [wide]);

  const setWide = useCallback((value: boolean) => {
    if (value !== wide) {
      applyWide(value);
      listeners.forEach((cb) => cb());
    }
  }, [wide]);

  return { wide, toggleWide, setWide } as const;
}
