import type { DB } from '../db/index';
import { siteSettings } from '../db/schema';
import { KV_SETTINGS_KEY, KV_SETTINGS_TTL } from './kv';

export async function getSettingsMap(db: DB, kv?: KVNamespace): Promise<Record<string, string>> {
  if (kv) {
    const cached = await kv.get(KV_SETTINGS_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch {}
    }
  }
  const rows = await db.select().from(siteSettings).all();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  if (kv) {
    kv.put(KV_SETTINGS_KEY, JSON.stringify(map), { expirationTtl: KV_SETTINGS_TTL }).catch(() => {});
  }
  return map;
}
