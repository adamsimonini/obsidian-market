import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

import en from '../messages/en.json';
import es from '../messages/es.json';
import fr from '../messages/fr.json';

const messages: Record<string, typeof en> = { en, es, fr };

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale],
  };
});
