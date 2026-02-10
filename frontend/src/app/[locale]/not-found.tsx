import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('description')}</p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        {t('backHome')}
      </Link>
    </div>
  );
}
