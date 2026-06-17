import { getCollection, getEntry, type CollectionKey } from 'astro:content';
import type { Locale } from './i18n';

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

/** A single entry by logical slug + locale. */
export async function getLocalizedEntry<C extends CollectionKey>(
  collection: C,
  slug: string,
  locale: Locale,
) {
  return getEntry(collection, `${slug}.${locale}`);
}

/** Clinic settings singleton for a locale. */
export async function getSettings(locale: Locale) {
  const entry = await getEntry('settings', `settings.${locale}`);
  if (!entry) {
    throw new Error(`Missing settings for locale "${locale}" (src/content/data/settings.${locale}.json)`);
  }
  return entry.data;
}
