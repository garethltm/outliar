type Row = { id: string; name: string; team: string | null; points: number };

export const teamColor = (t: string | null) => (t === 'A' ? 'text-amber' : t === 'B' ? 'text-[#6ec6ff]' : 'muted');

export function Scoreboard({ rows, teamScores, mode, meId, gained }: {
  rows: Row[]; teamScores: { A: number; B: number }; mode: string; meId: string | null; gained?: Record<string, number>;
}) {
  if (!rows.length) return null;
  const lead = teamScores.A === teamScores.B ? null : teamScores.A > teamScores.B ? 'A' : 'B';
  return (
    <div>
      {mode === 'teams' && (
        <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-2">
          {(['A', 'B'] as const).map((t) => (
            <div key={t} className={`chip text-center ${lead === t ? '!border-amber/70' : ''}`}>
              <div className={`text-xs font-bold tracking-widest ${teamColor(t)}`}>TEAM {t}{lead === t ? ' · LEADING' : ''}</div>
              <div className="text-2xl font-black tabular-nums">{teamScores[t]}</div>
            </div>
          ))}
        </div>
      )}
      <ol className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={r.id} className={`chip flex min-w-0 items-center gap-3 ${r.id === meId ? 'me' : ''}`}>
            <span className="w-5 shrink-0 text-center muted text-xs">{i + 1}</span>
            <span className="min-w-0 flex-1 truncate">{r.name}{r.team && <span className={`text-xs ml-2 ${teamColor(r.team)}`}>Team {r.team}</span>}{r.id === meId && <span className="muted text-xs ml-2">(you)</span>}</span>
            {gained && gained[r.id] > 0 && <span className="shrink-0 text-truth text-xs font-bold">+{gained[r.id]}</span>}
            <b className="shrink-0 tabular-nums">{r.points}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
