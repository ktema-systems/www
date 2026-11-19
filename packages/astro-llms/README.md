# @ktema-systems/astro-llms

An Astro integration that publishes each page of a site as markdown and writes an
`llms.txt` index that links them, following the proposal at <https://llmstxt.org>.

The integration is provisional: it lives inside this repository and is not published. It is
written as a package so it can be lifted out, and so another generator can adopt it, without
carrying this site with it. `private` is set because no license has been chosen yet; both
change together if it is published.

## What it writes

For a site that declares `site`, and a page at `/ktema/`:

- `ktema/index.md`, the page as markdown
- `llms.txt` at the site root, an index whose list points at the markdown files

The index follows the proposal's order: an H1 with the name, a blockquote with the summary,
a line about what the links open, then `## Pages` with one `- [name](url): note` per page,
then an optional `## Links` section for addresses no page carries.

A route that ends in a directory takes `index.md`, the address the proposal gives a page
without a file name. The not-found page is left out, and so is any prefix passed in
`exclude`.

## Use

```ts
import { llmsTxt } from '@ktema-systems/astro-llms';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    llmsTxt({
      title: 'Example',
      summary: 'One line about the site, shown as the blockquote.',
      exclude: ['/preview'],
      links: ['- [Contact](mailto:hello@example.com)'],
    }),
  ],
});
```

## Options

| Option | Type | Default | Meaning |
| --- | --- | --- | --- |
| `title` | string | required | The H1 the index opens with. |
| `summary` | string | required | The blockquote under it. |
| `indexFile` | string | `llms.txt` | The index written at the site root. |
| `links` | string[] | `[]` | Lines the index closes with, for addresses no page carries. |
| `exclude` | string[] | `[]` | Path prefixes with no markdown version and no index entry. |
| `titleSuffix` | string | `''` | A suffix every `<title>` carries, removed before display. |
| `markdown` | boolean | `true` | Write a markdown file per page. |

## What the text keeps

The sites this was written for carry their prose in `.astro` markup and have no content
collection, so the text is taken from the rendered page. Chrome is what sits outside
`<main>`. Inside it, these are dropped: `script`, `style`, `svg`, `canvas`, `video`,
`audio`, `iframe`, `button`, `select`, `form`, `object`, and anything marked
`aria-hidden="true"`. Headings, paragraphs, lists, definition lists and tables are kept.

Inline elements carry no whitespace of their own, so their edges are marked and the mark
becomes a space only where two words would otherwise run together.

The page's own `<h1>` is removed when it repeats the `<title>`, and the remaining headings
move down one level so a page has one H1.

## What it does not do

No content collection, no `.md` source, no HTML templating for site-specific blocks. The
text is what the page renders. A figure whose caption carries the meaning survives; a
chart drawn inside an inline SVG does not, because the drawing is dropped with the element.

## Test

```sh
node --test
```
