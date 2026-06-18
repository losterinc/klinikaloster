import type { Locale } from './i18n';

interface Settings {
  clinicName: string;
  tagline?: string;
  address: { street: string; postalCode: string; city: string; country: string };
  phone: string;
  email: string;
  mapLink?: string;
  geo?: { lat: number; lng: number };
  openingHours: { days: string; hours: string }[];
  social?: { facebook?: string; };
}

/**
 * LocalBusiness / Dentist JSON-LD — the biggest lever for local SEO.
 * Uses the consistent NAP from the settings collection.
 */
export function clinicJsonLd(settings: Settings, siteUrl: string, _locale: Locale) {
  const sameAs = [settings.social?.facebook].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${siteUrl}#clinic`,
    name: settings.clinicName,
    description: settings.tagline,
    url: siteUrl,
    telephone: settings.phone,
    email: settings.email,
    medicalSpecialty: 'Orthodontic',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address.street,
      postalCode: settings.address.postalCode,
      addressLocality: settings.address.city,
      addressCountry: settings.address.country,
    },
    ...(settings.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: settings.geo.lat,
        longitude: settings.geo.lng,
      },
    }),
    ...(settings.mapLink && { hasMap: settings.mapLink }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}
