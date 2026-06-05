import type { DB } from '../db';
import { plugins, sections } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getPluginBySlug(db: DB, slug: string) {
  return db.select().from(plugins).where(eq(plugins.slug, slug)).get();
}

export async function getPluginSections(db: DB, pluginId: number) {
  return db.select().from(sections)
    .where(eq(sections.pluginId, pluginId))
    .orderBy(asc(sections.sortOrder))
    .all();
}
