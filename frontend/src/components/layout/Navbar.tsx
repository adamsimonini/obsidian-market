'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Sun, Moon, Maximize2, Minimize2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletButton } from '@/components/WalletButton';
import { useWideMode } from '@/hooks/useWideMode';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

const navLinks = [
  { href: '/' as const, key: 'home' as const },
  { href: '/account' as const, key: 'account' as const },
  { href: '/settings' as const, key: 'settings' as const },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const { theme, setTheme } = useTheme();
  const { wide, toggleWide } = useWideMode();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <header className="border-b border-border bg-background px-4 py-4 md:px-8">
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
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden xl:inline-flex"
            onClick={toggleWide}
            title={wide ? t('standardView') : t('wideView')}
          >
            {wide ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('changeLanguage')}>
                <Globe className="size-4" />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={t('toggleTheme')}
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
