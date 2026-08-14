/**
 * Prefixes an internal path with the site's configured base path
 * (import.meta.env.BASE_URL), so links work whether the site is served
 * from the root (custom domain) or a subpath (e.g. GitHub Pages project
 * site at /ifpe_bloom/). See astro.config.mjs.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (path === '/') return base || '/';
  return `${base}${path}`;
}
