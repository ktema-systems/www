# www

The Ktema Systems site. Astro, static output, with a scroll-driven deck and a product menu on the home page.

The root is the company. The engine has a page of its own under it, at `/ktema`,
and the two share one masthead, one footer, and one set of components.

## Run

```
npm install
npm run dev      # development server
npm run build    # static output in dist/
npm run preview  # serve the built output
```

## Layout

| | |
|---|---|
| `src/pages/index.astro` | the company home, as an ordered list of sections |
| `src/pages/ktema.astro` | the engine's page, the same way |
| `src/components/` | one component per section |
| `src/components/Hero.astro` | the shared hero: the field, the copy a page passes in, and the figure it hands in |
| `src/components/Reach.astro` | the engine's reach, drawn as a ring of hexagons |
| `src/components/AddressFigure.astro` | the lookup against the computed address, drawn as SVG |
| `src/components/Section.astro` | the shared section frame: a sticky label and a body |
| `src/layouts/Base.astro` | the document shell and the metadata |
| `src/styles/global.css` | the design tokens and the shared primitives |
| `src/config.ts` | the names, the descriptions, each page's strip and call to action, and the links |
| `public/` | the logo, the favicon, and `robots.txt` |

Component styles are scoped by Astro. Anything two components share belongs in
`global.css` instead.

## Content

The copy is drawn from `docs/ktmas/pitch.qmd`, and the numbers quoted on the pages
(heap, flash, query latency, market size) come from that document. When the pitch
changes, change the pages with it.

The pages are allowed to be lighter than the pitch, and never heavier: a claim the
deck does not make or measure does not belong here, and a claim the deck makes
three times belongs here once, where it carries its reasoning. Numbers are quoted
exactly, in both directions. The deck's investor material, which is the amount and
the use of funds, is left off the public pages.

Three figures are computed at build time rather than transcribed:

- `Reach.astro` lays its ring out flat and projects it, so the six hosts sit on one
  ellipse and the joins stop at the two tile outlines at any size.
- `AddressFigure.astro` projects its points from the `(time, event, origin)`
  space with the same orthographic view the pitch figure uses, so the scatter
  stays clear of the query window and the labels at any rendered size.
- `Competition.astro` places its points on a base-10 scale from the published
  byte figures.

## Deploy

The site is on Cloudflare Pages as `ktema-www`, served at
`https://ktema-www.pages.dev`.

`.github/workflows/deploy-cf-pages.yml` builds on every pull request and deploys
on every push to `main`. It needs two repository secrets on
`ktema-systems/www` before the first run:

| Secret | |
|---|---|
| `CF_PAGES_DEPLOY` | a Cloudflare API token with the Account / Cloudflare Pages / Edit permission |
| `CF_ACCOUNT_ID` | the Cloudflare account ID |

For a local deploy, log Wrangler in and push the built output:

```
npm run build
npx wrangler@4 pages deploy dist --project-name=ktema-www
```

## Not yet set

`astro.config.mjs` leaves `site` unset, because the production domain is not
chosen. Setting it is what lets Astro emit absolute canonical URLs, an
`og:image`, and a sitemap. The contact address on the page is the SSCCS
documentation address, and belongs to `site.contact` in `src/config.ts`.
