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

`./run.sh` serves the whole site locally in one step: the homepage, the demo center,
and the cockpit from a sibling `kletos` checkout, on ports 4321, 4322 and 5276. A
cockpit that is not built is built on the first run, and `--rebuild` rebuilds one that
is. `DELTA_URL` points the center at a cockpit this host does not serve, and Ctrl-C
stops the servers the run started. `BLOG_PORT` (4323) is held for the blog stack.

## Layout

| | |
|---|---|
| `home/pages/index.astro` | the company home, as an ordered list of sections |
| `home/pages/ktema.astro` | the engine's page, the same way |
| `home/pages/delta.astro` | Delta's page: the cockpit, the loop, and the example campaign |
| `home/components/` | one component per section |
| `home/components/Hero.astro` | the shared hero: the field, the copy a page passes in, and the figure it hands in |
| `home/components/Deck.astro` | the deck every section walks: one idea per slide on the page's own scroll |
| `home/components/DeltaDeck.astro` | Delta's scroll-driven loop and example |
| `home/components/ProofDeck.astro` | the engine's measurements, one number at a time |
| `home/components/Reach.astro` | the engine's reach: one sphere of coordinates and the hosts on it |
| `home/components/AddressFigure.astro` | the lookup against the computed address, drawn as SVG |
| `home/components/Section.astro` | the shared section frame: a sticky label and a body |
| `home/layouts/Base.astro` | the document shell and the metadata |
| `home/styles/global.css` | the layout tokens and the primitives only this site uses; the palette and the faces come from `lib/` |
| `home/config.ts` | the names, the descriptions, each page's strip and call to action, and the links |
| `lib/styles/tokens.css` | the palette, the type stacks and the measure every site here draws from |
| `lib/styles/fonts.css` | the `@font-face` cuts both sites publish |
| `public/` | the logo, the favicon, and `robots.txt` |

`home/`, `demo/` and a future `blog/` are siblings under one Astro install, and each is a
site of its own: its own pages, its own `public/`, its own build. The root `astro.config.ts` names
`home` as the source directory, because Astro's default would claim `src/`. What the sites
agree on lives in `lib/`, which each site's stylesheet imports ahead of its own rules, so
the ground is one definition and a site adds only the tokens it needs.

Component styles are scoped by Astro. Anything two components of one site share belongs in
that site's `global.css`; anything two sites share belongs in `lib/`.

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

Two figures are computed at build time rather than transcribed:

- `Reach.astro` keeps one sphere and its hosts in three dimensions and projects them
  per frame, so the turn is a rotation of the space, two hosts are joined where their
  reads meet, and the closed instant forks into three states at any size.
- `AddressFigure.astro` projects its points from the `(time, event, origin)`
  space with the same orthographic view the pitch figure uses, so the scatter
  stays clear of the query window and the labels at any rendered size.

## The demonstration center

The center is a second site in this repository, built from its own root and served at
its own address. It shows the surfaces this stack builds, and it names each one by
address rather than importing it, so an application is deployed on its own schedule and
the center never builds it.

```
npm run demo         # the center beside a local cockpit, started and stopped together
npm run dev:demo     # astro dev --root demo, alone, on the published cockpit's address
npm run build:demo   # astro build --root demo, into demo-dist/
```

`npm run demo` exists because a center built against the published address shows
the published cockpit even on this host. It starts the cockpit's own preview
server over `dist-demo` in the sibling `kletos` checkout (`DELTA_DIR` names
another), points the center at that address, and stops the preview when the
center exits. `DELTA_URL` names a cockpit this host is not serving and starts no
preview, which is the shape of a check against the deployment; `DEMO_REBUILD=1`
rebuilds the cockpit first. Astro serves one dev server per project, so a site
dev server already running is replaced rather than left to block the run.

Both commands are one file, `tools/demo.mjs`: the whole of what the center does
that is not a page. It lives beside the tree as a command, so it reads and runs
the same on any host npm runs on.

The artifacts are one entry each in `demo/src/data/artifacts.ts`: an id, a title,
a kind, a summary and an address. A kind is a component under `demo/src/kinds`
and a line in the map `demo/src/pages/[id].astro` reads, so a new sort of surface
is one component rather than a change to the page. Every kind is entered through
its own page. `live` draws the still and the lines that say which layer the screen
is and which it is not, then links out to the deployed application at its own
address rather than framing it; `video` plays footage; and `document` points at
prose that lives where it is written.

A product page carries no way into the center: the bar does, and the body describes the product
rather than the demonstration.

The formal part of a page is Markdown under `demo/src/content/`, rendered by `demo/src/components/Markdown.astro`.
The document carries `{{name}}` where a figure goes and the caller hands the values in, so the prose and the numbers
keep one source each and a re-run cannot leave a sentence quoting an older one.

## The published addresses

Both sites declare `site` in their own config (`astro.config.ts` at the root,
`demo/astro.config.mjs`): `https://ktema.systems` for
the company site and `https://demo.ktema.systems` for the center. Every canonical link,
`og:url`, and sitemap entry is built from it, so moving to another domain is one line in
two configs rather than a search through the pages.

Each build emits a sitemap index at `/sitemap-index.xml`, and each `robots.txt` names it.
A page carried with `noindex` is filtered out of the sitemap, because offering a page to a
crawler while telling that crawler to ignore it is the same mistake twice.

Each build also publishes the site as text: a markdown version of every page at
`<path>/index.md`, and an index at `/llms.txt` that links them, in the shape the
llmstxt.org proposal describes. `tools/llms.mjs` takes the text from the rendered pages:
chrome outside `main` is left out, the decoration inside it is dropped, and headings and
lists keep the shape they have on the page. Each page's head names its markdown version
with `rel="alternate"` and the index with `rel="describedby"`.

The social card is `og.png` in each site's `public/`, 1200 by 630. It is captured from the
built page at that viewport, so it carries the real typography rather than a second
rendering of it: build, serve the output, and screenshot the first 1200 by 630 pixels.

The contact address on the page is the SSCCS documentation address, and belongs to
`site.contact` in `home/config.ts`.
