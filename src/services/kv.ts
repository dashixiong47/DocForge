export const KV_SETTINGS_KEY = 'settings:all';
export const KV_EXTENSIONS_KEY = 'ext:enabled';
export const KV_PLUGIN_SLUG_PREFIX = 'plugin:slug:';
export const KV_PLUGIN_ID_SLUG_PREFIX = 'plugin:id-slug:';
export const KV_PLUGIN_DATA_PREFIX = 'plugin:data:';

export const KV_SETTINGS_TTL = 300;
export const KV_EXTENSIONS_TTL = 300;
export const KV_PLUGIN_TTL = 300;

/** Invalidate all KV entries for a plugin (slug cache + data cache). */
export async function kvInvalidatePlugin(kv: KVNamespace, pluginId: number): Promise<void> {
  const slugKey = KV_PLUGIN_ID_SLUG_PREFIX + pluginId;
  const normalizedSlug = await kv.get(slugKey);
  const ops: Promise<void>[] = [
    kv.delete(KV_PLUGIN_DATA_PREFIX + pluginId),
    kv.delete(slugKey),
  ];
  if (normalizedSlug) ops.push(kv.delete(KV_PLUGIN_SLUG_PREFIX + normalizedSlug));
  await Promise.all(ops);
}

/** Invalidate only the content bundle for a plugin (sections/blocks/translations/media). */
export async function kvInvalidatePluginData(kv: KVNamespace, pluginId: number): Promise<void> {
  await kv.delete(KV_PLUGIN_DATA_PREFIX + pluginId);
}
