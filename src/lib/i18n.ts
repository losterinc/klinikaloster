export const LOCALES = ['pl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pl';

/**
 * Locales currently exposed on the public site. English remains a fully
 * functional option — its content, routes, CMS fields and translations all
 * still exist — but it is hidden for now: no language switcher, no `hreflang`
 * advertising, and its pages are `noindex`. Re-enable English across the whole
 * site by adding `'en'` back to this list (no other change required).
 */
export const ACTIVE_LOCALES: readonly Locale[] = ['pl'];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Whether a locale is currently shown on the public site. */
export function isActiveLocale(locale: Locale): boolean {
  return ACTIVE_LOCALES.includes(locale);
}

/** UI string dictionary (chrome/navigation labels not stored in the CMS). */
const ui = {
  pl: {
    'nav.home': 'Strona główna',
    'nav.team': 'Zespół',
    'nav.services': 'Oferta',
    'nav.indications': 'Wskazania',
    'nav.contact': 'Kontakt',
    'cta.call': 'Zadzwoń',
    'cta.sms': 'Wyślij SMS',
    'cta.email': 'Napisz e-mail',
    'contact.address': 'Adres',
    'contact.phone': 'Telefon',
    'contact.hours': 'Godziny otwarcia',
    'services.price': 'Cena',
    'footer.rights': 'Wszelkie prawa zastrzeżone',
    'skip.content': 'Przejdź do treści',
    'lang.switch': 'English',
  },
  en: {
    'nav.home': 'Home',
    'nav.team': 'Team',
    'nav.services': 'Services',
    'nav.indications': 'Indications',
    'nav.contact': 'Contact',
    'cta.call': 'Call us',
    'cta.sms': 'Send SMS',
    'cta.email': 'Email us',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.hours': 'Opening hours',
    'services.price': 'Price',
    'footer.rights': 'All rights reserved',
    'skip.content': 'Skip to content',
    'lang.switch': 'Polski',
  },
} as const;

export type UIKey = keyof (typeof ui)['pl'];

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** Localised route segments per locale. */
export const routes: Record<Locale, Record<string, string>> = {
  pl: {
    home: '',
    team: 'zespol',
    services: 'oferta',
    indications: 'wskazania',
    contact: 'kontakt',
  },
  en: {
    home: '',
    team: 'team',
    services: 'services',
    indications: 'indications',
    contact: 'contact',
  },
};

/**
 * Deployment base path, normalised to always have a single leading and
 * trailing slash. It is `/` for localhost and the production domain
 * (served at the root), and e.g. `/klinikaloster/` for a GitHub Pages
 * project site. Astro exposes the configured `base` as `BASE_URL`.
 */
export const BASE_PATH: string = `/${(import.meta.env.BASE_URL || '/')
  .replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/');

/** Prefix a root-relative path with the deployment base path. */
export function withBase(path: string): string {
  return `${BASE_PATH}${path.replace(/^\/+/, '')}`;
}

/**
 * Build a base-aware, root-relative path for a logical page in a locale.
 * Includes the deployment base so links work when the site is served from
 * a sub-path (e.g. GitHub Pages project sites).
 */
export function localePath(locale: Locale, page: keyof (typeof routes)['pl']): string {
  const seg = routes[locale][page];
  return withBase(seg ? `${locale}/${seg}/` : `${locale}/`);
}
