import { sign, verify } from 'hono/jwt';

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const adminAuth = {
  async signToken(username: string, secret: string): Promise<string> {
    const payload = { username, exp: Math.floor(Date.now() / 1000) + 86400 };
    return await sign(payload, secret, 'HS256');
  },

  async verifyToken(token: string, secret: string): Promise<{ username: string } | null> {
    try {
      const payload = await verify(token, secret, 'HS256');
      return { username: payload.username as string };
    } catch {
      return null;
    }
  },

  async hashPassword(password: string): Promise<string> {
    return sha256Hex(password);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return (await sha256Hex(password)) === hash;
  },
};
