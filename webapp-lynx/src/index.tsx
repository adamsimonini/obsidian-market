import '@lynx-js/preact-devtools';
import '@lynx-js/react/debug';
import { root } from '@lynx-js/react';

// Polyfill window and document for wallet adapter compatibility
if (typeof window !== 'undefined') {
  // Ensure window.addEventListener exists
  if (!window.addEventListener) {
    (window as any).addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      // No-op for Lynx environments that don't support events
    };
  }
  if (!window.removeEventListener) {
    (window as any).removeEventListener = function () {
      // No-op
    };
  }
  
  // Ensure document exists
  if (typeof document === 'undefined') {
    (window as any).document = {
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  } else {
    // Ensure document.addEventListener exists
    if (!document.addEventListener) {
      (document as any).addEventListener = () => {};
    }
    if (!document.removeEventListener) {
      (document as any).removeEventListener = () => {};
    }
  }
}

import { App } from './App.js';

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
