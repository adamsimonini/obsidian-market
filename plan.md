# i18n Implementation Plan — Obsidian Market

## Overview
Add full internationalization using **next-intl** with URL-prefixed locale routing (`/en/`, `/es/`, `/fr/`). English is the default locale. All ~100 static UI strings get extracted into translation JSON files. Dynamic DB content (market titles/descriptions) stays untranslated.

---

## Phase 1: Infrastructure (no visual changes)

### 1.1 Install next-intl
```bash
cd frontend && npm install next-intl
```

### 1.2 Create config files

**`src/i18n/routing.ts`** — locale list + default
```ts
import { defineRouting } from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',  // /en/settings, /es/settings, /fr/settings
});
```

**`src/i18n/request.ts`** — per-request message loader
```ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) locale = routing.defaultLocale;
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
```

**`src/i18n/navigation.ts`** — locale-aware Link, usePathname, useRouter
```ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
```

### 1.3 Create middleware (`src/middleware.ts`)
- Detects locale from Accept-Language header
- Redirects `/` to `/en/`
- Excludes `/api`, `/_next`, and static files from locale routing

### 1.4 Update `next.config.ts`
- Wrap with `createNextIntlPlugin('./src/i18n/request.ts')`

### 1.5 Create translation files
- `messages/en.json` — all English strings extracted from components
- `messages/es.json` — Spanish (placeholder initially, real translations in Phase 5)
- `messages/fr.json` — French (placeholder initially, real translations in Phase 5)

Translation namespaces: `common`, `nav`, `wallet`, `home`, `account`, `settings`, `betForm`, `createMarket`, `marketDetail`, `sidebar`, `admin`, `prototypes`

---

## Phase 2: Route restructuring

### 2.1 Split layout.tsx

**Root layout (`app/layout.tsx`)** becomes a minimal passthrough:
- Keeps only the `metadata` export
- Returns `{children}` directly (no `<html>` or `<body>`)

**Locale layout (`app/[locale]/layout.tsx`)** becomes the real layout:
- `<html lang={locale}>` (dynamic)
- `<head>` with theme-color metas + localStorage init script
- `<NextIntlClientProvider>` wrapping `<Providers>` + `<Navbar>` + `<main>`

### 2.2 Move pages into `[locale]/`
```
app/page.tsx           -> app/[locale]/page.tsx
app/account/page.tsx   -> app/[locale]/account/page.tsx
app/settings/page.tsx  -> app/[locale]/settings/page.tsx
app/prototypes/page.tsx-> app/[locale]/prototypes/page.tsx
```

`app/api/` stays where it is — untouched by locale routing.

### 2.3 Verification checkpoint
Visit `localhost:3000` should redirect to `/en/`. All pages render with original hardcoded English. API routes still work.

---

## Phase 3: Navbar + language switcher

### 3.1 Update Navbar.tsx
- Replace `next/link` with `@/i18n/navigation` Link
- Replace `next/navigation` usePathname with `@/i18n/navigation` usePathname
- Add `useTranslations('nav')` for labels ("Home", "Account", "Settings", etc.)

### 3.2 Add language switcher dropdown
- Globe icon button next to theme toggle
- Dropdown with English / Espanol / Francais (names always in native language)
- Uses `router.replace(pathname, { locale: newLocale })` to switch
- May need `npx shadcn@latest add dropdown-menu`

---

## Phase 4: Component migration (page by page)

Each component gets `useTranslations('namespace')` and replaces hardcoded strings with `t('key')`.

| Priority | Component | Namespace | Strings | Special handling |
|----------|-----------|-----------|---------|-----------------|
| 1 | account/page.tsx | `account` | ~4 | Interpolation for `{address}` |
| 2 | settings/page.tsx | `settings` | ~8 | Font size labels, add Language section |
| 3 | page.tsx (home) | `home`, `common` | ~5 | "All" filter, heading |
| 4 | WalletButton | `wallet` | ~3 | Interpolation for disconnect label |
| 5 | MarketList | `common`, `home` | ~4 | Loading/error/empty states |
| 6 | MarketCardCompact | `common` | ~6 | Pluralization for trades, date formatting |
| 7 | FeaturedMarket | `common`, `marketDetail` | ~8 | Pluralization, useFormatter() for dates, SVG text |
| 8 | MarketDetailPanel | `marketDetail` | ~10 | Stat labels, ROI labels, date formatting |
| 9 | TrendingSidebar | `sidebar`, `common` | ~4 | Section headings |
| 10 | BetForm | `betForm`, `common` | ~15 | Error messages, form labels |
| 11 | CreateMarketForm | `createMarket` | ~15 | Labels, placeholders, errors |
| 12 | AdminPanel | `admin` | ~15 | Role labels, validation, errors |
| 13 | Prototypes | `prototypes` | ~8 | Low priority, developer-facing |

### Date formatting migration
Replace `toLocaleDateString('en-US', ...)` with `useFormatter().dateTime()` from next-intl for locale-aware dates.

### Pluralization
Replace `trade_count !== 1 ? 's' : ''` patterns with ICU MessageFormat:
```json
"trades": "{count, plural, one {1 trade} other {# trades}}"
```

### Navigation links
Replace `import Link from 'next/link'` with `import { Link } from '@/i18n/navigation'` — auto-prefixes current locale. Replace `usePathname` from `next/navigation` with the one from `@/i18n/navigation` (strips locale prefix, so active-link detection keeps working).

---

## Phase 5: Polish

- Replace placeholder es.json / fr.json with real translations
- Locale-aware metadata via `generateMetadata` + `getTranslations`
- `hreflang` link tags for SEO (next-intl middleware `alternateLinks`)
- Language preference persisted via next-intl's built-in `localeCookie`
- Language selector section on settings page alongside font size

---

## Final file structure

```
frontend/src/
  i18n/
    routing.ts
    request.ts
    navigation.ts
  messages/
    en.json
    es.json
    fr.json
  middleware.ts
  app/
    layout.tsx              <- minimal (metadata only, returns children)
    globals.css
    [locale]/
      layout.tsx            <- real layout with NextIntlClientProvider
      page.tsx
      account/page.tsx
      settings/page.tsx
      prototypes/page.tsx
    api/                    <- unchanged
  components/               <- unchanged structure, strings use t()
```

## New files (8)
1. `src/i18n/routing.ts`
2. `src/i18n/request.ts`
3. `src/i18n/navigation.ts`
4. `src/middleware.ts`
5. `src/messages/en.json`
6. `src/messages/es.json`
7. `src/messages/fr.json`
8. `src/app/[locale]/layout.tsx`

## Modified files (17)
1. `next.config.ts` — wrap with createNextIntlPlugin
2. `src/app/layout.tsx` — strip down to minimal passthrough
3. `src/app/page.tsx` — move to [locale]/, add useTranslations
4. `src/app/account/page.tsx` — move to [locale]/, add useTranslations
5. `src/app/settings/page.tsx` — move to [locale]/, add useTranslations + language section
6. `src/app/prototypes/page.tsx` — move to [locale]/
7. `src/components/layout/Navbar.tsx` — locale-aware Link, translations, language switcher
8. `src/components/WalletButton.tsx` — useTranslations
9. `src/components/MarketList.tsx` — useTranslations
10. `src/components/MarketCardCompact.tsx` — useTranslations + useFormatter
11. `src/components/FeaturedMarket.tsx` — useTranslations + useFormatter
12. `src/components/MarketDetailPanel.tsx` — useTranslations + useFormatter
13. `src/components/TrendingSidebar.tsx` — useTranslations
14. `src/components/BetForm.tsx` — useTranslations
15. `src/components/CreateMarketForm.tsx` — useTranslations
16. `src/components/AdminPanel.tsx` — useTranslations
17. `src/components/MarketCard.tsx` — useTranslations

## Key decisions
- **next-intl** over custom solution — industry standard for App Router, handles client components, built-in pluralization/date formatting/middleware
- **`localePrefix: 'always'`** — even `/en/` is explicit in URLs for consistency
- **NextIntlClientProvider in locale layout** — makes useTranslations() available to all client components without modifying Providers.tsx
- **Language names not translated** — "English" always says "English", "Espanol" always says "Espanol" (standard UX so users can find their language)
- **DB content untranslated** — market titles/descriptions from Supabase stay as-is
- **Providers.tsx unchanged** — sits inside NextIntlClientProvider, no modifications needed
