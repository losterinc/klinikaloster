export const LOCALES = ['pl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pl';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
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

/** Build an absolute (root-relative) path for a logical page in a locale. */
export function localePath(locale: Locale, page: keyof (typeof routes)['pl']): string {
  const seg = routes[locale][page];
  return seg ? `/${locale}/${seg}/` : `/${locale}/`;
}
