import { getCollection, getEntry, type CollectionKey } from 'astro:content';
import { DEFAULT_LOCALE, type Locale } from './i18n';

/**
 * Locale is encoded as the filename suffix (`<slug>.<locale>.md|json`), so the
 * glob loader produces ids like `franciszek-loster.pl`. These helpers filter a
 * collection to one locale and expose the clean slug.
 */

function localeOf(id: string): string | undefined {
  return id.split('.').pop();
}

function slugOf(id: string): string {
  // drop the trailing ".<locale>" segment
  return id.replace(/\.(pl|en)$/, '');
}

/** All non-draft entries of a collection for one locale, sorted by `order`. */
export async function getLocalized<C extends CollectionKey>(collection: C, locale: Locale) {
  const entries = await getCollection(collection, ({ id, data }) => {
    const isDraft = (data as { draft?: boolean }).draft === true;
    return localeOf(id) === locale && !isDraft;
  });

  return entries
    .map((entry) => ({ ...entry, slug: slugOf(entry.id) }))
    .sort((a, b) => {
      const oa = (a.data as { order?: number }).order ?? 0;
      const ob = (b.data as { order?: number }).order ?? 0;
      return oa - ob;
    });
}

/**
 * A single entry by logical slug + locale. Falls back to the default-locale
 * entry when the requested locale has no file yet, so hidden/secondary locales
 * (e.g. the currently noindex `/en/` routes) still build instead of throwing on
 * a missing translation. A real `<slug>.<locale>.md` always overrides this.
 */
export async function getLocalizedEntry<C extends CollectionKey>(
  collection: C,
  slug: string,
  locale: Locale,
) {
  const entry = await getEntry(collection, `${slug}.${locale}`);
  if (entry || locale === DEFAULT_LOCALE) return entry;
  return getEntry(collection, `${slug}.${DEFAULT_LOCALE}`);
}

/** Clinic settings singleton for a locale. */
export async function getSettings(locale: Locale) {
  const entry = await getEntry('settings', 'settings');
  if (!entry) {
    throw new Error('Missing settings entry (expected src/content/data/settings.json)');
  }
  const data = (entry.data as Record<Locale, unknown>)[locale] ?? (entry.data as Record<Locale, unknown>)[DEFAULT_LOCALE];
  if (!data) {
    throw new Error(`Missing settings for locale "${locale}" (expected a "${locale}" or "${DEFAULT_LOCALE}" key in src/content/data/settings.json)`);
  }
  return data as (typeof entry.data)[Locale];
}
