import { defineCollection} from 'astro:content';
import { z } from 'astro/zod';
import { glob, type LoaderContext } from 'astro/loaders';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LOCALE } from './lib/i18n';

/**
 * Content collections for ORTODONCJA profesora Lostera.
 *
 * Every collection is i18n-enabled: each entry exists once per locale as
 * `<slug>.pl.md` / `<slug>.en.md` (or `.json` for data). The locale is encoded
 * in the filename; helpers in `src/lib/content.ts` filter & strip it.
 *
 * These Zod schemas are the single source of truth — they mirror the Sveltia
 * collections in `public/admin/config.yml` and fail the build on invalid content.
 */

// Preserve the `<slug>.<locale>` id (the default glob loader slugifies the dot
// away, e.g. `contact.en` -> `contacten`). Helpers in lib/content.ts rely on it.
const keepLocaleId = ({ entry }: { entry: string }) => entry.replace(/\.(md|json)$/i, '');

const openingHours = z.array(
  z.object({
    days: z.string(), // e.g. "Pon–Pt" / "Mon–Fri"
    hours: z.string(), // e.g. "9:00–18:00"
  }),
);

// settings — clinic-wide singleton.
//
// Sveltia/Decap store i18n *file* collections as ONE locale-keyed JSON file
// (`{ "pl": {...}, "en": {...} }`). So the CMS source of truth is a single
// `src/content/data/settings.json`, loaded here as ONE entry (`settings`) that
// holds every locale. `getSettings(locale)` in `src/lib/content.ts` picks the
// right locale object (falling back to the default locale when one is absent).
const SETTINGS_FILE = 'src/content/data/settings.json';

// Sveltia writes `null` for empty optional fields (objects/strings). Astro's Zod
// `.optional()` treats `null` as a present-but-wrong value, so drop null keys —
// a CMS `null` means "not set", identical to an omitted field.
function stripNull(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripNull);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null)
        .map(([k, v]) => [k, stripNull(v)]),
    );
  }
  return value;
}

const settingsLoader = {
  name: 'clinic-settings-json',
  async load({ store, parseData, config, watcher, logger }: LoaderContext) {
    const filePath = fileURLToPath(new URL(SETTINGS_FILE, config.root));

    const sync = async () => {
      let raw: unknown;
      try {
        raw = JSON.parse(await readFile(filePath, 'utf-8'));
      } catch (err) {
        logger.error(`Could not read ${SETTINGS_FILE}: ${(err as Error).message}`);
        return;
      }
      store.clear();
      const id = 'settings';
      store.set({ id, data: await parseData({ id, data: stripNull(raw) as Record<string, unknown> }) });
    };

    await sync();
    watcher?.on('change', (changed: string) => {
      if (changed === filePath) void sync();
    });
  },
};

// One locale's settings object.
const localeSettings = z.object({
  clinicName: z.string(),
  tagline: z.string().optional(),
  logo: z.string().optional(),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    country: z.string().default('Polska'),
  }),
  phone: z.string(),
  sms: z.string().optional(),
  email: z.email(),
  mapEmbedUrl: z.url().optional(),
  mapLink: z.url().optional(),
  geo: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
  openingHours: openingHours.default([]),
  social: z
    .object({
      facebook: z.url().optional(),
      instagram: z.url().optional(),
    })
    .optional(),
});

const settings = defineCollection({
  loader: settingsLoader,
  // The single entry is the locale-keyed object; the default locale is required,
  // others are optional and fall back to it.
  schema: z
    .object({ [DEFAULT_LOCALE]: localeSettings })
    .catchall(localeSettings.optional()),
});

// team — doctors / staff.
// Team entries are locale-independent: one `<slug>.md` per person, no locale
// suffix (the same staff list is shown on every locale's /zespol page).
const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team', generateId: keepLocaleId }),
  schema: z.object({
    name: z.string(),
    title: z.string(),
    specialties: z.array(z.string()).default([]),
    photo: z.string().optional(), // public path, e.g. /uploads/loster.jpg
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

// services — oferta + cennik
const services = defineCollection({
  loader: glob({ pattern: '**/*.{pl,en}.md', base: './src/content/services', generateId: keepLocaleId }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    price: z.string().optional(), // free-form to allow "od 1500 zł" / ranges
    category: z.string().optional(),
    order: z.number().default(0),
    homepage: z.boolean().default(false),
  }),
});

// indications — wskazania do leczenia ortodontycznego
const indications = defineCollection({
  loader: glob({ pattern: '**/*.{pl,en}.md', base: './src/content/indications', generateId: keepLocaleId }),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    image: z.string().optional(), // public path, e.g. /uploads/wady-zgryzu.jpg
    order: z.number().default(0),
    homepage: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

// pages — editable page copy + per-page SEO
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{pl,en}.md', base: './src/content/pages', generateId: keepLocaleId }),
  schema: z.object({
    title: z.string(),
    heroTitle: z.string().optional(),
    heroSubtitle: z.string().optional(),
    heroImage: z.string().optional(), // public path, e.g. /uploads/hero.jpg — shown behind the hero
    heroSecondaryImage: z.string().optional(), // public path — shown in the hero, right-aligned under the text
    // "Umów wizytę" — ZnanyLekarz booking widgets. List order = display order
    // (configurable via the CMS list drag handles).
    bookingTitle: z.string().optional(),
    bookingWidgets: z
      .array(
        z.object({
          label: z.string().optional(), // e.g. doctor / clinic name shown above the widget
          doctor: z.string(), // ZnanyLekarz profile id (the `data-zlw-doctor` value)
          url: z.string().optional(), // full profile URL; defaults to znanylekarz.pl/<doctor>
          type: z.string().default('big_with_calendar'), // ZnanyLekarz widget type
        }),
      )
      .default([]),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        ogImage: z.string().optional(), // public path, e.g. /uploads/og-home.jpg
      })
      .optional(),
  }),
});

export const collections = { settings, team, services, indications, pages };
