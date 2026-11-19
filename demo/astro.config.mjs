// The center's own Astro root. It is built with `astro build --root demo`, so everything here is relative to this
// directory: the pages under ./src, the files under ./public, and the artifact written beside it.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { llmsText } from '../tools/llms.mjs';

// The cockpit is deployed on its own, so the corpus names its address rather than importing
// it. `PUBLIC_DELTA_URL` is what a build points at when the application moves.
const deltaApp = (process.env.PUBLIC_DELTA_URL ?? 'https://delta.demo.ktema.systems/').replace(/\/?$/, '/');

export default defineConfig({
  // The center is published at its own address, and it is what its canonical links and sitemap are built from.
  site: 'https://demo.ktema.systems',
  outDir: '../demo-dist',
  integrations: [
    // The corpus is text rather than a page, so it stays out of the sitemap.
    sitemap({ filter: (page) => !page.endsWith('.txt') }),
    // The index at /llms.txt, and a markdown version of every page beside it.
    llmsText({
      title: 'Ktema Systems Demo Center',
      summary:
        'The surfaces Ktema Systems builds, running: deployed applications, runs of the engine recorded in a terminal, and hardware on the bench.',
      stripSuffix: ' | Ktema Systems Demo Center',
      references: [
        '- [Ktema Systems](https://ktema.systems/): the company this center demonstrates, whose corpus is at https://ktema.systems/llms.txt',
        `- [Delta application](${deltaApp}): the cockpit this center opens directly.`,
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
