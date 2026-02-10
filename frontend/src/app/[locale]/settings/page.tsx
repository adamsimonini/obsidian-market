'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminPanel } from '@/components/AdminPanel';
import { useAdmin } from '@/hooks/useAdmin';
import { useWallet } from '@/hooks/useWallet';
import { useFontSize, type FontSize } from '@/hooks/useFontSize';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const FONT_OPTIONS: { value: FontSize; key: 'small' | 'medium' | 'large' }[] = [
  { value: '14', key: 'small' },
  { value: '16', key: 'medium' },
  { value: '18', key: 'large' },
];

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};

export default function SettingsPage() {
  const { address } = useWallet();
  const { isAdmin, role } = useAdmin(address);
  const { size, setSize } = useFontSize();
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const isSuperAdmin = isAdmin && role === 'super_admin';

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
                    variant={size === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSize(opt.value)}
                    className={cn('min-w-20', size === opt.value && 'pointer-events-none')}
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
