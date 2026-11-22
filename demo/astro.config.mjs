// The center's own Astro root. It is built with `astro build --root demo`, so everything here is relative to this
// directory: the pages under ./src, the files under ./public, and the artifact written beside it.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { llmsTxt } from '../packages/astro-llms/index.mjs';

// The viewer is deployed on its own, so the index names its address rather than importing it. `PUBLIC_CENTER_URL` is what
// a build points at when the application moves, and the viewer's own address is what the bar opens: the hub is the
// entrance, and a page is where a reader goes on from.
const deltaApp = (process.env.PUBLIC_CENTER_URL ?? 'https://delta.ktema.systems/').replace(/\/?$/, '/');

export default defineConfig({
  // The hub is published at its own address, and it is what its canonical links and sitemap are built from.
  site: 'https://corpus.ktema.systems',
  outDir: '../demo-dist',
  integrations: [
    // The index and the markdown pages are text rather than pages, so they stay out of the sitemap.
    sitemap({ filter: (page) => !page.endsWith('.txt') }),
    // The index at /llms.txt, and a markdown version of every page beside it.
    llmsTxt({
      title: 'Ktema Systems Corpus Hub',
      summary:
        'The corpus Ktema Systems publishes: the demonstrations it recorded, the measurements it took, and the surfaces it plans.',
      titleSuffix: ' | Ktema Systems Corpus Hub',
      links: [
        '- [Ktema Systems](https://ktema.systems/): the company this center demonstrates, whose corpus is at https://ktema.systems/llms.txt',
        `- [Corpus](${deltaApp}): this corpus as Delta reads it, whose entries open the page they belong to.`,
        '- [Documentation](https://docs.ktema.systems)',
        '- [Email](mailto:demo@ktema.systems)',
      ],
    }),
  ],
  // The toolbar is a development overlay, so it sits over the bottom of every page and over the embedded application in
  // particular. What is being looked at is the page, so it is off.
  devToolbar: { enabled: false },
  vite: {
    server: {
      // The shared sheet lives one level up, outside this root, so the dev server has to be told it exists.
      fs: { allow: ['..'] },
    },
  },
});
