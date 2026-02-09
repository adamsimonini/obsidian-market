'use client';

import { ThemeProvider } from 'next-themes';
import { WalletProvider } from '@/contexts/WalletContext';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <WalletProvider>
        {children}
        <Toaster />
      </WalletProvider>
    </ThemeProvider>
  );
}
