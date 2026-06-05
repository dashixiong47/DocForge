import type { DB } from '../db/index';
import { siteSettings } from '../db/schema';

export async function getSettingsMap(db: DB): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings).all();
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}
