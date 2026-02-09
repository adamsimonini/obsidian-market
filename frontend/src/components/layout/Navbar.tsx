'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/WalletButton';
import { useWideMode } from '@/hooks/useWideMode';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/account', label: 'Account' },
  { href: '/settings', label: 'Settings' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { wide, toggleWide } = useWideMode();

  return (
    <header className="border-b border-border bg-background px-6 py-4">
      <div className="container-main mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Image src="/obsidian-logo.png" alt="Obsidian Market" width={32} height={32} />
            Obsidian Market
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden xl:inline-flex"
            onClick={toggleWide}
            title={wide ? 'Standard view' : 'Wide view'}
          >
            {wide ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </Button>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
