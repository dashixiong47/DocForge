export const R2_STATIC_PREFIX = 'static/';

// Languages to proactively purge from edge cache on invalidation.
// Add more here if you support additional locales.
const CACHE_LANGS = ['zh', 'en'];

export function staticKeyForSlug(canonicalSlug: string, lang: string, version?: string): string {
  if (version) return `${R2_STATIC_PREFIX}${canonicalSlug}/${lang}/v/${encodeURIComponent(version)}/index.html`;
  return `${R2_STATIC_PREFIX}${canonicalSlug}/${lang}/index.html`;
}

export function staticKeyForHome(lang: string): string {
  return `${R2_STATIC_PREFIX}__home__/${lang}/index.html`;
}

export function edgeCacheKeyUrl(origin: string, path: string, lang: string): string {
  return `${origin}${path}?__lang=${encodeURIComponent(lang)}`;
}

export async function deleteEdgeCacheForSlug(origin: string, slug: string): Promise<void> {
  if (typeof caches === 'undefined') return;
  const edgeCache = (caches as unknown as CacheStorage).default;
  const keys: string[] = [];
  for (const lang of CACHE_LANGS) {
    keys.push(edgeCacheKeyUrl(origin, `/${slug}`, lang));
    keys.push(edgeCacheKeyUrl(origin, '/', lang));
  }
  await Promise.all(keys.map(k => edgeCache.delete(new Request(k)).catch(() => {})));
}

export async function deleteAllEdgeCache(origin: string, slugs: string[]): Promise<void> {
  if (typeof caches === 'undefined') return;
  const edgeCache = (caches as unknown as CacheStorage).default;
  const keys: string[] = [];
  for (const slug of slugs) {
    for (const lang of CACHE_LANGS) {
      keys.push(edgeCacheKeyUrl(origin, `/${slug}`, lang));
    }
  }
  for (const lang of CACHE_LANGS) {
    keys.push(edgeCacheKeyUrl(origin, '/', lang));
  }
  await Promise.all(keys.map(k => edgeCache.delete(new Request(k)).catch(() => {})));
}

export async function deleteStaticForSlug(r2: R2Bucket, canonicalSlug: string): Promise<void> {
  const listed = await r2.list({ prefix: `${R2_STATIC_PREFIX}${canonicalSlug}/` });
  await Promise.all(listed.objects.map(obj => r2.delete(obj.key)));
  const homeListed = await r2.list({ prefix: `${R2_STATIC_PREFIX}__home__/` });
  await Promise.all(homeListed.objects.map(obj => r2.delete(obj.key)));
}

export async function deleteAllStatic(r2: R2Bucket): Promise<void> {
  let cursor: string | undefined;
  do {
    const listed: R2Objects = await r2.list({ prefix: R2_STATIC_PREFIX, cursor });
    await Promise.all(listed.objects.map((obj: R2Object) => r2.delete(obj.key)));
    cursor = listed.truncated ? (listed as any).cursor : undefined;
  } while (cursor);
}
