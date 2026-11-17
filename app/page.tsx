'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark, Wordmark } from '@/components/Logo';
import { Credit } from '@/components/Credit';
import { api, loadName, saveName, saveSession } from '@/lib/api';

const DIFFICULTY_LABELS: Record<string, string> = { mixed: 'Mixed', easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'individual' | 'teams'>('individual');
  const [max, setMax] = useState(16);
  const [liars, setLiars] = useState(1);
  const [difficulty, setDifficulty] = useState('mixed');
  const [liarsKnow, setLiarsKnow] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('join');
    if (invite) setCode(invite.replace(/\D/g, '').slice(0, 6));
    if (params.get('notice') === 'closed') setNotice('That room has closed, or you were removed from it.');
    setName(loadName());
  }, []);

  async function send(payload: Record<string, unknown>) {
    setBusy(true); setError('');
    try {
      const d = await api('POST', payload);
      if (payload.action === 'join') saveName(String(payload.name));
      saveSession({ code: d.room.code, token: d.token, role: d.role, playerId: d.player?.id || null, name: d.player?.name || 'Host' });
      router.push('/room/' + d.room.code);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <header className="text-center mb-9">
          <LogoMark size={92} animate className="mx-auto mb-3" />
          <h1><Wordmark className="text-6xl md:text-7xl" /></h1>
          <p className="muted mt-3 text-lg">Blend in. Spot the liar.</p>
          <p className="eyebrow mt-3">The social deduction party game</p>
        </header>

        {notice && <p role="status" className="text-center text-amber mb-5 text-sm">{notice}</p>}

        <div className="grid md:grid-cols-2 gap-5">
          <section className="panel p-6">
            <div className="eyebrow mb-2">Host a game</div>
            <h2 className="text-2xl font-bold mb-5">Create a room</h2>

            <div className="grid grid-cols-2 gap-2 mb-5">
              <button onClick={() => setMode('individual')} className={`btn-ghost ${mode === 'individual' ? 'on' : ''}`}>Individual</button>
              <button onClick={() => setMode('teams')} className={`btn-ghost ${mode === 'teams' ? 'on' : ''}`}>2 Teams</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label htmlFor="max" className="text-sm muted">Player limit</label>
                <select id="max" className="field mt-2" value={max} onChange={(e) => setMax(Number(e.target.value))}>
                  {[4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30].map((n) => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="liars" className="text-sm muted">Liars{mode === 'teams' ? ' / team' : ''}</label>
                <select id="liars" className="field mt-2" value={liars} onChange={(e) => setLiars(Number(e.target.value))}>
                  {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <label className="text-sm muted">Word difficulty</label>
            <div className="grid grid-cols-4 gap-2 mt-2 mb-5">
              {Object.keys(DIFFICULTY_LABELS).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`btn-ghost !px-0 text-sm ${difficulty === d ? 'on' : ''}`}>{DIFFICULTY_LABELS[d]}</button>
              ))}
            </div>

            <label className="flex items-start gap-3 mb-5 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#ff3d5a]" checked={!liarsKnow} onChange={(e) => setLiarsKnow(!e.target.checked)} />
              <span className="text-sm">
                <b>Blind mode</b>
                <span className="muted block">Liars aren&apos;t told they&apos;re liars — they have to work it out from the clues. Harder, and funnier.</span>
              </span>
            </label>

            <button className="btn w-full" disabled={busy} onClick={() => send({ action: 'create', mode, maxPlayers: max, imposters: liars, difficulty, liarsKnow })}>
              {busy ? 'Creating…' : 'Create game room'}
            </button>
          </section>

          <section className="panel p-6">
            <div className="eyebrow mb-2">Join a game</div>
            <h2 className="text-2xl font-bold mb-5">Enter the room</h2>

            <label htmlFor="nick" className="text-sm muted">Your nickname</label>
            <input id="nick" className="field mt-2 mb-4" maxLength={20} placeholder="e.g. Alex" autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor="code" className="text-sm muted">6-digit room code</label>
            <input id="code" className="field mt-2 mb-5 tracking-widest text-lg" inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />

            <button className="btn w-full" disabled={busy || !name.trim() || code.length !== 6} onClick={() => send({ action: 'join', name, code })}>
              {busy ? 'Joining…' : 'Join game'}
            </button>

            <details className="mt-6 text-sm">
              <summary className="font-bold text-[#ff8a9b]">How to play ▾</summary>
              <ol className="muted mt-3 space-y-2 list-decimal pl-5">
                <li>Everyone gets a secret word on their phone. Most people share the <b className="text-white">same</b> word — the liar gets a <b className="text-white">similar but different</b> one.</li>
                <li>Take turns giving one short clue about your word. Never say the word itself.</li>
                <li>Listen for the clue that doesn&apos;t quite fit, then vote for who you think the liar is.</li>
                <li>Most votes wins the round. A tie means the liar escapes.</li>
                <li><b className="text-white">Points:</b> truth-tellers +2 for catching a liar (+1 for voting right). Liars +3 for escaping.</li>
              </ol>
            </details>
          </section>
        </div>

        {error && <p role="alert" className="text-red-300 text-center mt-5">{error}</p>}
        <p className="text-center muted text-xs mt-8">No app download required · Works on phones, tablets and laptops</p>
        <Credit className="mt-3" />
      </div>
    </main>
  );
}
