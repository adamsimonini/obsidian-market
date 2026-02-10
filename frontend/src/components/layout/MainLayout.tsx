'use client';

import { usePathname } from '@/i18n/navigation';
import { CategoriesBar } from '@/components/CategoriesBar';
import { useCategories } from '@/hooks/useCategories';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { categories } = useCategories();

  // Show categories bar on home page and category pages
  const showCategoriesBar = pathname === '/' || pathname.startsWith('/categories');

  // Extract active category slug from pathname
  const activeSlug = pathname.startsWith('/categories/') ? pathname.split('/').pop() : undefined;

  return (
    <>
      {showCategoriesBar && (
        <div className="bg-background">
          <div className="container-main mx-auto px-4 pt-3 pb-0 md:px-8">
            <CategoriesBar categories={categories} activeSlug={activeSlug} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
