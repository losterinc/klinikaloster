import { defineCollection} from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

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

// settings — clinic-wide singleton (one entry per locale)
const settings = defineCollection({
  loader: glob({ pattern: '*.{pl,en}.json', base: './src/content/data', generateId: keepLocaleId }),
  schema: z.object({
    clinicName: z.string(),
    tagline: z.string().optional(),
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
  }),
});

// team — doctors / staff
const team = defineCollection({
  loader: glob({ pattern: '**/*.{pl,en}.md', base: './src/content/team', generateId: keepLocaleId }),
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
    draft: z.boolean().default(false),
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
