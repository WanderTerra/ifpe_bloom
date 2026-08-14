import { defineConfig } from 'astro/config';

// https://astro.build/config
// TODO: once a custom domain (e.g. ifpebloom.com) is pointed at GitHub
// Pages, change `site` to the custom domain and remove `base` — a custom
// domain serves from the root, so the /ifpe_bloom subpath won't be needed.
export default defineConfig({
  site: 'https://wanderterra.github.io',
  base: '/ifpe_bloom',
  compressHTML: true,
});
