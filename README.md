# ORTODONCJA profesora Lostera — website

Static, bilingual (PL/EN) marketing site for the orthodontics clinic in Kraków.
Built with **Astro** (static output), **Tailwind CSS**, and **Sveltia CMS**
(git-backed). See `../docs/architecture-prd.md` for the full rationale.

## Requirements

- Node.js 18+ (developed on Node 22/25)

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:4321
npm run build      # type-check (astro check) + build static site to dist/
npm run preview    # preview the production build locally
```

The build runs `astro check`, so invalid content (per the Zod schemas in
`src/content.config.ts`) fails the build instead of shipping broken data.

## Project structure

```
public/
  admin/            # Sveltia CMS (index.html + config.yml)
  uploads/          # CMS-managed media (public path /uploads/…)
  favicon.svg, robots.txt
src/
  content/          # content collections (the source of truth)
    content.config.ts       # Zod schemas for all collections
    data/           # settings singleton (settings.{pl,en}.json)
    team/  services/  indications/  pages/   # <slug>.{pl,en}.md
  components/        # Header, Footer, Seo, LangSwitcher + pages/*View
  layouts/          # BaseLayout (head, SEO, JSON-LD, chrome)
  lib/              # i18n.ts, content.ts (locale helpers), seo.ts (JSON-LD)
  pages/            # routes: /pl/… (default) and /en/…
  styles/           # Tailwind entry + design tokens
astro.config.mjs    # static output, i18n, tailwind + sitemap integrations
tailwind.config.mjs # brand design tokens
```

## Content model

Every collection is bilingual: each entry exists once per locale, encoded in the
filename as `<slug>.pl.md` / `<slug>.en.md` (`.json` for `settings`). The Astro
Zod schemas (`src/content/content.config.ts`) are the single source of truth and are
mirrored by the Sveltia collections in `public/admin/config.yml` — **keep the two
in sync** when adding fields.

| Collection    | Files                                  | Purpose                       |
|---------------|----------------------------------------|-------------------------------|
| `settings`    | `data/settings.{pl,en}.json`           | NAP, hours, map, socials      |
| `team`        | `team/<slug>.{pl,en}.md`               | Lekarze / Zespół              |
| `services`    | `services/<slug>.{pl,en}.md`           | Oferta + cennik               |
| `indications` | `indications/<slug>.{pl,en}.md`        | Wskazania do leczenia         |
| `pages`       | `pages/<slug>.{pl,en}.md`              | Page hero copy + per-page SEO |

## Editing content (CMS)

### Local (no auth)
Sveltia CMS edits files directly via the browser's File System Access API —
there is **no proxy server** to run (it dropped Decap's `decap-server` /
`netlify-cms-proxy-server`, and the `local_backend` option is ignored).

1. Start the dev server: `npm run dev`.
2. Open **`http://localhost:4321/admin/index.html`** in **Chrome or Edge**
   (the File System Access API isn't available in Firefox/Safari). Note the
   explicit `index.html`: Astro's dev server doesn't resolve `/admin/` to its
   index file, so the bare path 404s in dev (it works once deployed).
3. Click **"Work with Local Repository"** and select the project root (the
   `website/` folder containing `src/content/`) when prompted.

Changes are written straight to the files on disk. Sveltia does **not** run any
git operations locally — fetch/commit/push with your own git client.

### Remote (GitHub OAuth) — one-time developer setup
1. In `public/admin/config.yml` set `backend.repo` to `owner/repo` and `branch`.
2. Deploy the free [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth)
   relay as a Cloudflare Worker and create a GitHub OAuth App pointing at it.
3. Set `backend.base_url` in `config.yml` to the Worker URL.
4. Editors then visit `https://<site>/admin`, log in with GitHub, and **Publish**
   commits files to git → Cloudflare Pages rebuilds and deploys.

## Deployment

Static output in `dist/`. Recommended: **Cloudflare Pages** —
build command `npm run build`, output directory `dist`. Portable to Netlify /
Vercel / GitHub Pages with no code changes.

**Before go-live:** set the production domain in `astro.config.mjs` (`SITE`) and
in `public/robots.txt` (the `Sitemap:` line).
