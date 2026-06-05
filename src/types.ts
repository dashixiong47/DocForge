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
};

export type Variables = {
  db: ReturnType<typeof createDB>;
};

export type AppType = { Bindings: Env; Variables: Variables };
