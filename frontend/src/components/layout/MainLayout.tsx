'use client';

import { usePathname } from '@/i18n/navigation';
import { CategoriesBar } from '@/components/CategoriesBar';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCategories } from '@/hooks/useCategories';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { categories } = useCategories();

  const isHomePage = pathname === '/';
  // Show categories bar on home page and category pages
  const showCategoriesBar = isHomePage || pathname.startsWith('/categories');

  // Extract active category slug from pathname
  const activeSlug = pathname.startsWith('/categories/') ? pathname.split('/').pop() : undefined;

  return (
    <>
      {isHomePage && <PageHeader />}
      {showCategoriesBar && (
        <div className="bg-background">
          <div className="container-main mx-auto px-4 pt-3 pb-0 md:px-8 lg:px-8">
            <CategoriesBar categories={categories} activeSlug={activeSlug} />
          </div>
        </div>
      )}
      <div className="container-main mx-auto px-4 md:px-8 lg:px-12">{children}</div>
    </>
  );
}
