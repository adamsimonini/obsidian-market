'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { CategoriesBar } from '@/components/CategoriesBar';
import { useCategories } from '@/hooks/useCategories';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { categories } = useCategories();
  const t = useTranslations('home');

  const isHomePage = pathname === '/';
  const isCategoryPage = pathname.startsWith('/categories/');
  // Show categories bar on home page and category pages
  const showCategoriesBar = isHomePage || isCategoryPage;

  // Extract active category slug from pathname
  const activeSlug = isCategoryPage ? pathname.split('/').pop() : undefined;

  // Find active category for header
  const activeCategory = activeSlug ? categories.find((cat) => cat.slug === activeSlug) : null;

  return (
    <>
      {(isHomePage || isCategoryPage) && (
        <div className="bg-background">
          <div className="container-main mx-auto px-4 pt-8 pb-0 md:px-8 lg:px-12">
            <div className="mb-6">
              {isHomePage ? (
                <>
                  <h1 className="text-3xl font-bold">{t('title')}</h1>
                  <p className="mt-2 text-lg text-muted-foreground">{t('description')}</p>
                </>
              ) : activeCategory ? (
                <>
                  <h1 className="text-3xl font-bold">{activeCategory.name}</h1>
                  {activeCategory.description && <p className="mt-2 text-lg text-muted-foreground">{activeCategory.description}</p>}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
      {showCategoriesBar && (
        <div className="bg-background">
          <div className="container-main mx-auto px-4 pb-0 md:px-8 lg:px-8">
            <CategoriesBar categories={categories} activeSlug={activeSlug} />
          </div>
        </div>
      )}
      <div className="container-main mx-auto px-4 md:px-8 lg:px-12">{children}</div>
    </>
  );
}
