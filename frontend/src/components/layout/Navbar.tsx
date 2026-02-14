'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Sun, Moon, Globe, Settings2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletButton } from '@/components/WalletButton';
import { TorIndicator } from '@/components/TorIndicator';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { LOCALE_LABELS } from '@/lib/locale-utils';

const navLinks = [
  { href: '/' as const, key: 'home' as const },
  { href: '/about' as const, key: 'about' as const },
  { href: '/account' as const, key: 'account' as const },
  { href: '/settings' as const, key: 'settings' as const },
];

const devLinks = [
  { href: '/dev/onchain' as const, label: 'On-Chain Markets' },
  { href: '/prototypes' as const, label: 'Card Prototypes' },
];

// Toggle to restrict the Dev tab to localhost only.
// Set to true to hide on deployed environments.
const DEV_TAB_LOCALHOST_ONLY = false;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { theme, setTheme } = useTheme();

  const showDev = DEV_TAB_LOCALHOST_ONLY
    ? typeof window !== 'undefined' && window.location.hostname === 'localhost'
    : true;

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background px-4 py-4 md:px-8">
      <div className="container-main mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Image src="/obsidian-logo.png" alt="Obsidian Market" width={32} height={32} style={{ width: 32, height: 'auto' }} />
            <div>
              <span className="text-xl font-bold leading-tight">Obsidian Market</span>
              <span className="block text-[0.625rem] leading-tight text-muted-foreground">{tc('poweredByAleo')}</span>
            </div>
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
                {t(link.key)}
              </Link>
            ))}
            {showDev && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'ml-4 flex items-center gap-1 border-l-2 border-l-muted-foreground/30 pl-4 pr-3 py-2 rounded-r-md text-sm font-medium transition-colors',
                      pathname.startsWith('/dev') || pathname === '/prototypes'
                        ? 'border-l-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'text-muted-foreground hover:border-l-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400',
                    )}
                  >
                    <Wrench className="size-3.5" />
                    Dev
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {devLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          'w-full',
                          pathname === link.href && 'font-bold',
                        )}
                      >
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* Desktop: Show individual controls above lg breakpoint */}
          <div className="hidden lg:flex">
            <TorIndicator />
          </div>
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={t('changeLanguage')} className="font-semibold">
                  {locale.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {routing.locales.map((loc) => (
                  <DropdownMenuItem
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={cn(locale === loc && 'font-bold')}
                  >
                    {LOCALE_LABELS[loc]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('toggleTheme')}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </Button>
          {/* Settings menu: Show below lg breakpoint */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('menu')}>
                <Settings2 className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* TRO Indicator (only on small/medium screens) */}
              <div className="lg:hidden px-2 py-1.5">
                <TorIndicator />
              </div>
              <DropdownMenuSeparator className="lg:hidden" />
              {/* Navigation links (only on small screens) */}
              <div className="sm:hidden">
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className={cn('w-full', pathname === link.href && 'font-bold')}
                    >
                      {t(link.key)}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {showDev && (
                  <>
                    <DropdownMenuSeparator />
                    {devLinks.map((link) => (
                      <DropdownMenuItem key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            'w-full text-amber-600 dark:text-amber-400',
                            pathname === link.href && 'font-bold',
                          )}
                        >
                          <Wrench className="mr-2 size-4" />
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuSeparator />
              </div>
              {/* Language selector */}
              {routing.locales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={cn(locale === loc && 'font-bold')}
                >
                  <Globe className="mr-2 size-4" />
                  {LOCALE_LABELS[loc]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {/* Theme toggle */}
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }}
              >
                {theme === 'dark' ? (
                  <Sun className="mr-2 size-4" />
                ) : (
                  <Moon className="mr-2 size-4" />
                )}
                {t('toggleTheme')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
