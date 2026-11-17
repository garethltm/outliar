'use client';
import { useEffect, useState } from 'react';

/** Elapsed time in the current phase. `offset` corrects for clock drift between phone and server. */
export function PhaseTimer({ since, offset, label }: { since: string | null; offset: number; label?: string }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!since) return null;
  const started = new Date(since).getTime();
  if (Number.isNaN(started)) return null;
  const s = Math.max(0, Math.floor((Date.now() + offset - started) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return <span className="timer" aria-label={label ? `${label} ${mm} minutes ${ss} seconds` : undefined}>{label ? label + ' ' : ''}{mm}:{ss}</span>;
}
