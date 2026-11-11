// The center's own Astro root. It is built with `astro build --root demo`, so everything here is relative to this
// directory: the pages under ./src, the files under ./public, and the artifact written beside it.
import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: '../demo-dist',
});
