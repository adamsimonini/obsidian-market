'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { LocalizedCategory } from '@/types/supabase';

interface CategoriesBarProps {
  categories: LocalizedCategory[];
  activeSlug?: string;
}

export function CategoriesBar({ categories, activeSlug }: CategoriesBarProps) {
  const tc = useTranslations('common');

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide ml-4">
      <Button variant={!activeSlug ? 'default' : 'outline'} size="sm" className="shrink-0" asChild>
        <Link href="/">{tc('all')}</Link>
      </Button>
      {categories.map((cat) => (
        <Button key={cat.id} variant={activeSlug === cat.slug ? 'default' : 'outline'} size="sm" className="shrink-0" asChild>
          <Link href={`/categories/${cat.slug}`}>{cat.name}</Link>
        </Button>
      ))}
    </div>
  );
}
