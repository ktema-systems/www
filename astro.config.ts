// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { llmsTxt } from './packages/astro-llms/index.mjs';
import { references, summary } from './home/corpus';

// The company site and the demonstration center are siblings under one root, and both
// draw their palette and their fonts from lib/. That is why this source directory is
// named rather than left at Astro's default. `site` is what every canonical, og:url and
// sitemap entry is built from, so it is the address the site is published at.
export default defineConfig({
  site: 'https://ktema.systems',
  srcDir: './home',
  integrations: [
    // A page that is reachable but deliberately unlisted carries noindex, so it is kept
    // out of the sitemap rather than offered to a crawler twice. The corpus is text rather
    // than a page, so it is left out of the sitemap too.
    sitemap({ filter: (page) => !page.includes('/one-space') && !page.endsWith('.txt') }),
    // The index at /llms.txt, and a markdown version of every page beside it.
    llmsTxt({ title: 'Ktema Systems', summary, exclude: ['/one-space'], links: references }),
  ],
});
