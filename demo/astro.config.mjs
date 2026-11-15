// The center's own Astro root. It is built with `astro build --root demo`, so everything here is relative to this
// directory: the pages under ./src, the files under ./public, and the artifact written beside it.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The center is published at its own address, and it is what its canonical links and sitemap are built from.
  site: 'https://demo.ktema.systems',
  outDir: '../demo-dist',
  integrations: [sitemap()],
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
