export type Session = { code: string; token: string; role: 'host' | 'player'; playerId: string | null; name: string };

export const SESSION_KEY = 'outliar_session';
export const NAME_KEY = 'outliar_name';

export async function api(method: 'POST' | 'PUT', payload: Record<string, unknown>) {
  const res = await fetch('/api/game', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data: any = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err: any = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export function loadSession(): Session | null {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function saveSession(s: Session) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* private mode */ } }
export function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } }
export function loadName() { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } }
export function saveName(n: string) { try { localStorage.setItem(NAME_KEY, n); } catch { /* ignore */ } }
