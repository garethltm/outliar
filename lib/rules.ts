/**
 * Shared by the API (authoritative) and the UI (to explain why Start is disabled).
 * Returns a human-readable problem, or null when the round can start.
 */
export function minimumPlayers(mode: string, liars: number): number {
  const playersPerTeam = 2 * liars + 1;
  return mode === 'teams' ? playersPerTeam * 2 : playersPerTeam;
}

export function startRequirement(
  mode: string,
  liars: number,
  players: { team?: string | null }[],
): string | null {
  const need = 2 * liars + 1; // liars must always be a minority
  const noun = liars > 1 ? 'liars' : 'liar';
  if (mode === 'teams') {
    for (const t of ['A', 'B']) {
      const n = players.filter((p) => p.team === t).length;
      if (n < need) return `Team ${t} needs at least ${need} players for ${liars} ${noun} (it has ${n}).`;
    }
    return null;
  }
  if (players.length < need) return `You need at least ${need} players for ${liars} ${noun}.`;
  return null;
}
