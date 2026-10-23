# www

The Ktema Systems site. Astro, static output, with a scroll-driven deck and a product menu on the home page.

The root is the company. The engine has a page of its own under it, at `/ktema`,
and Delta has one at `/delta`; the three share one masthead, one footer, and one
set of components.

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
| `src/pages/delta.astro` | Delta's page: the cockpit, the loop, and the example campaign |
| `src/components/` | one component per section |
| `src/components/Hero.astro` | the shared hero: the field, the copy a page passes in, and the figure it hands in |
| `src/components/CaseDeck.astro` | the home's scroll-driven cases |
| `src/components/DeltaDeck.astro` | Delta's scroll-driven loop and example |
| `src/components/CockpitDeck.astro` | Delta's scroll-driven cockpit screenshots |
| `src/components/Reach.astro` | the engine's reach: one sphere of coordinates and the hosts on it |
| `src/components/AddressFigure.astro` | the lookup against the computed address, drawn as SVG |
| `src/components/Section.astro` | the shared section frame: a sticky label and a body |
| `src/layouts/Base.astro` | the document shell and the metadata |
| `src/styles/global.css` | the design tokens and the shared primitives |
| `src/config.ts` | the names, the descriptions, each page's strip and call to action, and the links |
| `public/` | the logo, the favicon, and `robots.txt` |

Component styles are scoped by Astro. Anything two components share belongs in
`global.css` instead.

## Presentation

A concept that needs more than a paragraph is shown as a scroll-driven deck: a sticky
stage, real panels, and a figure that moves with the scroll. This is the default for
every concept section, not a one-off. The home Cases and Delta's loop are the reference.

- The panels are real markup; a reader without JavaScript gets a stacked list.
- The scroll drives the figure. There is no autoplay.
- `prefers-reduced-motion` or a narrow viewport collapses the deck to the static list.
  Delta's deck also collapses on a short viewport, where the sticky stage cannot hold the
  header, figure, and progress rail together.
- The copy states the principle. The figure shows it.

## Content

The public pages draw on the product, proof, and use-case material in
`docs/ktmas/pitch.qmd`. The business model, pricing, market sizing, and moat stay in
the pitch and are not published. A product page describes what the product does, how
it ships, and what the buyer can check; the rationale, market case, and competition
stay in the pitch. The internal model and the campaign contract stay in `docs/`. When
the product material changes, change the pages with it.

The Delta page's example follows the campaign contract in `kletos/apps/delta`
(`src/lib/types.ts`, `src/lib/campaign.ts`), and the villa campaign in
`projects.json`. The detailed contract stays in `docs/delta.qmd`. When the
contract changes, change the example and the document with it.

The pages are allowed to be lighter than the pitch, and never heavier: a claim the
deck does not make or measure does not belong here, and a claim the deck makes
three times belongs here once, where it carries its reasoning. Numbers are quoted
exactly, in both directions. The deck's investor material, which is the amount and
the use of funds, is left off the public pages.

Three figures are computed at build time rather than transcribed:

- `Reach.astro` keeps one sphere and its hosts in three dimensions and projects them
  per frame, so the turn is a rotation of the space, two hosts are joined where their
  reads meet, and the closed instant forks into three states at any size.
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

For a local deploy, log Wrangler in once and run the script, which builds the
site and uploads the output:

```
npx wrangler@4 login
./deploy.sh
```

## Not yet set

`astro.config.mjs` leaves `site` unset, because the production domain is not
chosen. Setting it is what lets Astro emit absolute canonical URLs, an
`og:image`, and a sitemap. The contact address on the page is the SSCCS
documentation address, and belongs to `site.contact` in `src/config.ts`.
