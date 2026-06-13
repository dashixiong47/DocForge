export const R2_STATIC_PREFIX = 'static/';
export const R2_HOME_KEY = `${R2_STATIC_PREFIX}__home__/index.html`;

export function staticKeyForSlug(canonicalSlug: string, version?: string): string {
  if (version) return `${R2_STATIC_PREFIX}${canonicalSlug}/v/${encodeURIComponent(version)}/index.html`;
  return `${R2_STATIC_PREFIX}${canonicalSlug}/index.html`;
}

export async function deleteStaticForSlug(r2: R2Bucket, canonicalSlug: string): Promise<void> {
  const listed = await r2.list({ prefix: `${R2_STATIC_PREFIX}${canonicalSlug}/` });
  await Promise.all(listed.objects.map(obj => r2.delete(obj.key)));
  await r2.delete(R2_HOME_KEY).catch(() => {});
}

export async function deleteAllStatic(r2: R2Bucket): Promise<void> {
  let cursor: string | undefined;
  do {
    const listed: R2Objects = await r2.list({ prefix: R2_STATIC_PREFIX, cursor });
    await Promise.all(listed.objects.map((obj: R2Object) => r2.delete(obj.key)));
    cursor = listed.truncated ? (listed as any).cursor : undefined;
  } while (cursor);
}
