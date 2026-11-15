// @ts-check
import { defineConfig } from 'astro/config';

// `site` stays unset until the production domain is chosen. Setting it is what
// lets Astro emit absolute canonical URLs and a sitemap.
//
// The company site and the demonstration center are siblings under one root, and
// both draw their palette and their fonts from lib/. That is why this source
// directory is named rather than left at Astro's default.
export default defineConfig({
  srcDir: './home',
});
