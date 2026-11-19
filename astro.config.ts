// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { llmsFullText } from './tools/llms.mjs';
import { references } from './home/corpus';

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
    // Every page as one file of text, at /llms.txt and at the name some readers ask for.
    llmsFullText({ title: 'Ktema Systems', exclude: ['/one-space'], references }),
  ],
});
