// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Production site URL — used for canonical URLs, sitemap and hreflang.
// Update this to the final domain before going live.
const SITE = 'https://www.loster.pl';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  i18n: {
    defaultLocale: 'pl',
    locales: ['pl'],
    routing: {
      // Both locales are prefixed: /pl/… (default) and /en/…
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      // Exclude the root redirect page (noindex) from the sitemap.
      filter: (page) => page !== `${SITE}/`,
      i18n: {
        defaultLocale: 'pl',
        locales: { pl: 'pl-PL' },
      },
    }),
  ],
});
