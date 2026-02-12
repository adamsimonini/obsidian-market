import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Shield, Eye, EyeOff, Lock, Fingerprint, Globe, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="flex gap-4 p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <h3 className="mb-1 font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12 md:px-8">
        {/* Hero */}
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
        </header>

        {/* Why Privacy Matters */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">{t('whyPrivacyTitle')}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {t('whyPrivacyIntro')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={Zap}
              title={t('frontRunningTitle')}
              description={t('frontRunningDesc')}
            />
            <FeatureCard
              icon={Shield}
              title={t('retaliationTitle')}
              description={t('retaliationDesc')}
            />
            <FeatureCard
              icon={Fingerprint}
              title={t('financialPrivacyTitle')}
              description={t('financialPrivacyDesc')}
            />
            <FeatureCard
              icon={Eye}
              title={t('priceDiscoveryTitle')}
              description={t('priceDiscoveryDesc')}
            />
          </div>
        </section>

        {/* How Obsidian Protects You */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">{t('howWeProtectTitle')}</h2>
          <p className="leading-relaxed text-muted-foreground">
            {t('howWeProtectIntro')}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              icon={Lock}
              title={t('zkProofsTitle')}
              description={t('zkProofsDesc')}
            />
            <FeatureCard
              icon={EyeOff}
              title={t('privateBetsTitle')}
              description={t('privateBetsDesc')}
            />
            <FeatureCard
              icon={Globe}
              title={t('torSupportTitle')}
              description={t('torSupportDesc')}
            />
            <FeatureCard
              icon={Fingerprint}
              title={t('noKycTitle')}
              description={t('noKycDesc')}
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">{t('ctaTitle')}</h2>
          <p className="text-muted-foreground">{t('ctaDescription')}</p>
        </section>
      </div>
    </div>
  );
}
