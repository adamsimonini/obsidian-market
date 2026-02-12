'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import { useFontSize, type FontSize } from '@/hooks/useFontSize';
import { useWideMode } from '@/hooks/useWideMode';
import { useShowTorIndicator } from '@/hooks/useShowTorIndicator';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { LOCALE_LABELS } from '@/lib/locale-utils';

const FONT_OPTIONS: { value: FontSize; key: 'small' | 'medium' | 'large' }[] = [
  { value: '14', key: 'small' },
  { value: '16', key: 'medium' },
  { value: '18', key: 'large' },
];

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);
  const { size, setSize } = useFontSize();
  const { theme, setTheme } = useTheme();
  const { wide, setWide } = useWideMode();
  const { show: showTorIndicator, setShow: setShowTorIndicator } = useShowTorIndicator();
  const t = useTranslations('settings');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Avoid hydration mismatch - client-only values (theme, localStorage) differ from SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = isAdmin && role === 'super_admin';

  // Helper to avoid hydration mismatch: only show "selected" state after mount
  const isSelected = (condition: boolean) => mounted && condition;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('fontSize')}</p>
              <div className="flex gap-2">
                {FONT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={isSelected(size === opt.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSize(opt.value)}
                    className={cn('min-w-20', isSelected(size === opt.value) && 'pointer-events-none')}
                  >
                    {t(opt.key)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('fontSizeDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('language')}</p>
              <div className="flex gap-2">
                {routing.locales.map((loc) => (
                  <Button
                    key={loc}
                    variant={locale === loc ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.replace(pathname, { locale: loc })}
                    className={cn('min-w-20', locale === loc && 'pointer-events-none')}
                  >
                    {LOCALE_LABELS[loc]}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('languageDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('theme')}</p>
              <div className="flex gap-2">
                <Button
                  variant={isSelected(theme === 'light') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className={cn('min-w-20', isSelected(theme === 'light') && 'pointer-events-none')}
                >
                  {t('light')}
                </Button>
                <Button
                  variant={isSelected(theme === 'dark') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className={cn('min-w-20', isSelected(theme === 'dark') && 'pointer-events-none')}
                >
                  {t('dark')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('themeDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('layout')}</p>
              <div className="flex gap-2">
                <Button
                  variant={isSelected(!wide) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWide(false)}
                  className={cn('min-w-28', isSelected(!wide) && 'pointer-events-none')}
                >
                  {tn('standardView')}
                </Button>
                <Button
                  variant={isSelected(wide) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWide(true)}
                  className={cn('min-w-28', isSelected(wide) && 'pointer-events-none')}
                >
                  {tn('wideView')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('layoutDescription')}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{t('showTorIndicator')}</p>
              <div className="flex gap-2">
                <Button
                  variant={isSelected(showTorIndicator) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowTorIndicator(true)}
                  className={cn('min-w-16', isSelected(showTorIndicator) && 'pointer-events-none')}
                >
                  {t('on')}
                </Button>
                <Button
                  variant={isSelected(!showTorIndicator) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowTorIndicator(false)}
                  className={cn('min-w-16', isSelected(!showTorIndicator) && 'pointer-events-none')}
                >
                  {t('off')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('showTorIndicatorDescription')}{' '}
                <a
                  href={t('torProjectUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  {t('learnAboutTor')}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <div>
            <h2 className="mb-4 text-xl font-bold">{t('adminManagement')}</h2>
            <AdminPanel />
          </div>
        )}
      </div>
    </div>
  );
}
