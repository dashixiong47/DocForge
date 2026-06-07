import type { createDB } from './db';

export type Env = {
  DB: D1Database;
  MEDIA: R2Bucket;
  KV: KVNamespace;
  JWT_SECRET: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  SITE_TITLE: string;
  SITE_DOMAIN: string;
  ENVIRONMENT?: string;
  AI_TRANSLATE_API_KEY?: string;
};

export type Variables = {
  db: ReturnType<typeof createDB>;
  sysI18n: Record<string, { zh: string; en: string }>;
};

export type AppType = { Bindings: Env; Variables: Variables };
