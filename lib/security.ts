import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';

function secret() {
  const s = process.env.TOKEN_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('TOKEN_SECRET is not set. Add it in your Vercel environment variables and redeploy.');
  }
  return 'development-only-change-me';
}

export function newToken() { return randomBytes(32).toString('hex'); }
export function hashToken(token: string) {
  return createHmac('sha256', secret()).update(token).digest('hex');
}
export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
export function newCode() { return randomInt(100000, 1000000).toString(); }

/** Unbiased Fisher–Yates shuffle (the old sort(random) trick is biased). */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tiny best-effort limiter (per server instance). It will not stop a determined
 * attacker on serverless, but it blunts accidental spam and button-mashing.
 */
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    if (hits.size > 5000) hits.forEach((v, k) => { if (v.reset < now) hits.delete(k); });
    return true;
  }
  h.n += 1;
  return h.n <= limit;
}
