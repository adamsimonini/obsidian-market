'use client';

import { useParams } from 'next/navigation';
import { CategoriesBar } from '@/components/CategoriesBar';
import { useCategories } from '@/hooks/useCategories';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string | undefined;
  const { categories } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <div className="container-main mx-auto px-4 py-3 md:px-8">
        <CategoriesBar categories={categories} activeSlug={slug} />
        {children}
      </div>
    </div>
  );
}
