import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
