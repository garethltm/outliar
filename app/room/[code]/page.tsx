'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from '@/components/Logo';
import { Credit } from '@/components/Credit';
import { PhaseTimer } from '@/components/PhaseTimer';
import { Scoreboard, teamColor } from '@/components/Scoreboard';
import { api, clearSession, loadName, loadSession, saveName, Session } from '@/lib/api';
import { speakingOrder } from '@/lib/order';
import { startRequirement } from '@/lib/rules';
import { DEFAULT_WORD_CATEGORIES, wordCategoryLabel } from '@/lib/word-categories';

type Player = { id: string; name: string; team: string | null };
type State = {
  room: any; players: Player[]; assignment: { word: string; is_imposter: boolean | null } | null;
  playerId: string | null; isHost: boolean; myVote: string | null; votedIds: string[]; votesSubmitted: number;
  result: any; scoreboard: any[]; teamScores: { A: number; B: number }; phaseStartedAt: string | null; serverTime: number;
};

export default function Room() {
  const params = useParams();
  const code = String(params.code);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [target, setTarget] = useState('');
  const [guess, setGuess] = useState('');
  const [peek, setPeek] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    const s = loadSession();
    if (!s || s.code !== code) { router.replace('/'); return; }
    setSession(s);
    setHostName(loadName());
  }, [code, router]);

  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const d = await api('POST', { action: 'state', code, token: session.token });
      setOffset(d.serverTime - Date.now());
      setState(d);
      setError('');
    } catch (e: any) {
      if (e.status === 401 || e.status === 404) { clearSession(); router.replace('/?notice=closed'); return; }
      setError(e.message);
    }
  }, [session, code, router]);

  // Poll every 2s, but not while the phone is locked / tab is hidden (saves battery and server load).
  useEffect(() => {
    if (!session) return;
    refresh();
    const t = setInterval(() => { if (!document.hidden) refresh(); }, 2000);
    const onVis = () => { if (document.hidden) setPeek(false); else refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [session, refresh]);

  // Never carry a revealed word (or a half-picked vote) into the next phase/round.
  const round = state?.room.round; const status = state?.room.status;
  useEffect(() => { setPeek(false); setTarget(''); setGuess(''); }, [round, status]);

  const order = useMemo(() => (state ? speakingOrder(state.players, code + ':' + state.room.round) : []), [state?.players, state?.room.round, code]); // eslint-disable-line react-hooks/exhaustive-deps

  async function act(action: string, extra: Record<string, unknown> = {}) {
    if (!session) return;
    setBusy(true);
    try { await api('POST', { action, code, token: session.token, ...extra }); await refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function castVote() {
    if (!session || !target) return;
    setBusy(true);
    try { await api('PUT', { code, token: session.token, targetId: target }); await refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function leave() {
    if (!session) return;
    if ((status === 'clues' || status === 'voting') && !window.confirm('Leave mid-round? You will not be able to rejoin this game.')) return;
    try { await api('POST', { action: 'leave', code, token: session.token }); } catch { /* leaving anyway */ }
    clearSession(); router.push('/');
  }

  async function endGame() {
    if (!session || !window.confirm('End the game for everyone? This closes the room.')) return;
    try { await api('POST', { action: 'end', code, token: session.token }); } catch { /* ignore */ }
    clearSession(); router.push('/');
  }

  if (!session || !state) return <main className="min-h-screen grid place-items-center muted" role="status">Connecting to room…</main>;

  const room = state.room;
  const me = state.players.find((p) => p.id === state.playerId) || null;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
  const joinUrl = `${origin}/?join=${code}`;
  const problem = startRequirement(room.mode, room.imposter_count, state.players);
  const allVoted = state.players.length > 0 && state.votesSubmitted >= state.players.length;
  const assignment = state.assignment;
  const role = assignment?.is_imposter; // true | false | null (null = hidden in blind mode)
  const nounLiars = room.imposter_count > 1 ? 'liars' : 'liar';

  async function invite() {
    const text = `Join my outLIAR game — room ${code}`;
    try {
      if (typeof navigator.share === 'function' && /Android|iPhone|iPad/i.test(navigator.userAgent)) { await navigator.share({ title: 'outLIAR', text, url: joinUrl }); return; }
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* share sheet dismissed or clipboard blocked */ }
  }

  // Press-and-hold to peek: the word disappears the moment a finger lifts, so nobody can read it over your shoulder.
  const peekHandlers = {
    onPointerDown: (e: PointerEvent) => { e.preventDefault(); setPeek(true); },
    onPointerUp: () => setPeek(false),
    onPointerLeave: () => setPeek(false),
    onPointerCancel: () => setPeek(false),
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
    onKeyDown: (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPeek(true); } },
    onKeyUp: () => setPeek(false),
    onBlur: () => setPeek(false),
  };

  const gained: Record<string, number> = {};
  (state.result?.points || []).forEach((p: any) => { gained[p.id] = p.points; });
  const result = state.result;
  const guessPending = result?.guessStatus === 'pending' || result?.guessStatus === 'submitted';

  return (
    <main className="min-h-screen px-4 py-6 sm:px-5 sm:py-8">
      <div className="max-w-5xl mx-auto min-w-0">
        <header className="flex flex-wrap justify-between items-center gap-3 mb-7">
          <Logo size={30} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="timer" aria-label={`Room code ${code}`}>ROOM {code}</span>
            {state.isHost
              ? <button className="btn-danger text-sm" onClick={endGame}>End game</button>
              : <button className="btn-ghost text-sm" onClick={leave}>Leave</button>}
          </div>
        </header>

        {error && <div role="alert" className="mb-4 text-red-300 text-sm">{error}</div>}

        <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="panel min-w-0 p-4 sm:p-6" aria-live="polite">

            {/* ───────────── LOBBY ───────────── */}
            {room.status === 'lobby' && (
              <>
                <div className="eyebrow">{room.round > 0 ? `Between rounds · ${room.round} played` : 'Waiting room'}</div>
                <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <div className="muted text-xs mb-2 tracking-widest">ROOM CODE</div>
                    <div className="codebox">{code}</div>
                  </div>
                  <button className="btn-ghost" onClick={invite}>{copied ? 'Link copied ✓' : 'Invite friends'}</button>
                </div>
                <p className="muted mt-4 text-sm">
                  {state.players.length} / {room.max_players} joined · {room.mode === 'teams' ? 'Team showdown' : 'Individual'} · {room.imposter_count} {nounLiars}{room.mode === 'teams' ? ' per team' : ''}
                </p>
                <p className="muted mt-1 text-xs">
                  Word mix: <span className="break-words">{(room.word_categories || DEFAULT_WORD_CATEGORIES).map(wordCategoryLabel).join(', ')}</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {state.players.map((p) => (
                    <div key={p.id} className={`chip flex min-w-0 items-center justify-between gap-2 ${p.id === state.playerId ? 'me' : ''}`}>
                      <span className="min-w-0 truncate">{p.name}{p.team && <span className={`text-xs ml-1 ${teamColor(p.team)}`}>· {p.team}</span>}</span>
                      {state.isHost && p.id !== state.playerId && (
                        <button className="muted text-xs hover:text-red-300" aria-label={`Remove ${p.name}`} disabled={busy} onClick={() => act('kick', { playerId: p.id })}>✕</button>
                      )}
                    </div>
                  ))}
                  {state.players.length === 0 && <p className="muted text-sm col-span-full">Nobody has joined yet. Share the code or QR!</p>}
                </div>

                {state.isHost && !state.playerId && (
                  <div className="mt-5 chip !p-4">
                    <div className="text-sm font-bold">Want to play too?</div>
                    <p className="muted text-xs mt-1 mb-3">As host you can also get a secret word and vote — use this phone as both.</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input className="field min-w-0 !py-2.5" maxLength={20} placeholder="Your nickname" value={hostName} onChange={(e) => setHostName(e.target.value)} />
                      <button className="btn-ghost whitespace-nowrap" disabled={busy || !hostName.trim()} onClick={async () => { saveName(hostName); await act('host-join', { name: hostName }); }}>Play too</button>
                    </div>
                  </div>
                )}
                {state.isHost && state.playerId && (
                  <button className="muted text-xs underline mt-4" disabled={busy} onClick={() => act('leave')}>Stop playing (just host)</button>
                )}

                {state.scoreboard.length > 0 && room.round > 0 && (
                  <div className="mt-6">
                    <div className="eyebrow mb-3">Scoreboard</div>
                    <Scoreboard rows={state.scoreboard} teamScores={state.teamScores} mode={room.mode} meId={state.playerId} />
                  </div>
                )}

                {state.isHost ? (
                  <>
                    <button className="btn w-full mt-6" disabled={busy || !!problem} onClick={() => act('start')}>{room.round > 0 ? 'Start next round' : 'Start round'}</button>
                    {problem && <p className="muted text-xs text-center mt-2">{problem}</p>}
                  </>
                ) : (
                  <p className="muted text-sm mt-6">Waiting for the host to start the round…</p>
                )}
              </>
            )}

            {/* ───────────── CLUES ───────────── */}
            {room.status === 'clues' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="eyebrow">Round {room.round} · Clue phase</div>
                  <PhaseTimer since={state.phaseStartedAt} offset={offset} label="Discussing" />
                </div>
                {assignment ? (
                  <>
                    <h2 className="text-2xl font-bold mt-2">Your secret word</h2>
                    <div
                      role="button" tabIndex={0} aria-label="Press and hold to reveal your secret word"
                      {...peekHandlers}
                      className={`peek mt-4 rounded-2xl p-6 text-center border transition-colors ${peek ? 'border-liar/60 bg-[#14111a]' : 'border-[#34364c] bg-[#0b0c15]'}`}
                    >
                      <p className="muted text-xs tracking-widest">YOUR SECRET WORD</p>
                      <div className="my-4 min-h-[48px] break-words text-3xl font-black text-[#ffb3be] sm:text-4xl">{peek ? assignment.word : '••••••••'}</div>
                      {peek && role === true && <p className="text-sm text-liar font-bold pop">You&apos;re the LIAR — your word is different. Blend in.</p>}
                      {peek && role === false && <p className="text-sm text-truth font-bold pop">You&apos;re a truth-teller. Find the liar.</p>}
                      {peek && role === null && <p className="text-sm muted pop">Someone&apos;s word is slightly different. Listen closely…</p>}
                      <p className="muted text-xs mt-2">{peek ? 'Release to hide' : 'Press and hold to peek'}</p>
                    </div>
                  </>
                ) : state.playerId ? (
                  <p className="muted mt-5">Your word is being prepared…</p>
                ) : (
                  <p className="muted mt-5">You&apos;re hosting without playing. Watch the table and start voting when ready.</p>
                )}

                <div className="mt-6">
                  <div className="eyebrow mb-2">Speaking order</div>
                  <ol className="flex flex-wrap gap-2">
                    {order.map((p, i) => (
                      <li key={p.id} className={`chip flex min-w-0 max-w-full items-center gap-2 ${p.id === state.playerId ? 'me' : ''}`}>
                        <span className={`text-xs font-black ${i === 0 ? 'text-amber' : 'muted'}`}>{i + 1}</span>
                        <span className="break-words">{p.name}</span>
                        {i === 0 && <span className="shrink-0 text-[10px] font-bold text-amber tracking-widest">STARTS</span>}
                      </li>
                    ))}
                  </ol>
                  <p className="muted text-sm mt-4">Go in order. Give one short clue about your word — never say the word itself.</p>
                </div>

                {state.isHost && <button className="btn w-full mt-5" disabled={busy} onClick={() => act('begin-vote')}>Start voting</button>}
              </>
            )}

            {/* ───────────── VOTING ───────────── */}
            {room.status === 'voting' && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="eyebrow">Round {room.round} · Voting</div>
                  <PhaseTimer since={state.phaseStartedAt} offset={offset} label="Voting" />
                </div>
                <h2 className="text-xl font-bold mt-2 break-words sm:text-2xl">{room.imposter_count > 1 ? 'Who are the liars?' : 'Who’s the liar?'}</h2>
                {role === true && <p className="muted mt-2 text-sm">You&apos;re a liar. Vote strategically.</p>}

                <div className="grid sm:grid-cols-2 gap-2 mt-5">
                  {state.players.filter((p) => p.id !== state.playerId).map((p) => {
                    const chosen = (state.myVote || target) === p.id;
                    const voted = state.votedIds.includes(p.id);
                    if (!state.playerId) {
                      return <div key={p.id} className="chip flex min-w-0 justify-between gap-2"><span className="break-words">{p.name}</span>{voted && <span className="shrink-0 text-truth text-xs font-bold">VOTED ✓</span>}</div>;
                    }
                    return (
                      <button key={p.id} disabled={!!state.myVote || busy} aria-pressed={chosen} onClick={() => setTarget(p.id)} className={`btn-ghost text-left flex min-w-0 justify-between items-center gap-2 ${chosen ? 'on' : ''}`}>
                        <span className="min-w-0 break-words">{p.name}{p.team && <span className={`text-xs ml-2 ${teamColor(p.team)}`}>{p.team}</span>}</span>
                        {voted && <span className="text-truth text-xs font-bold" title="Has voted">✓</span>}
                      </button>
                    );
                  })}
                </div>

                {state.playerId && (state.myVote
                  ? <p className="text-truth font-bold text-center mt-5 pop">✓ Vote locked in — waiting for the others</p>
                  : <button className="btn w-full mt-5" disabled={!target || busy} onClick={castVote}>Lock in vote</button>)}

                <div className="mt-5">
                  <div className="flex justify-between text-xs muted mb-1.5"><span>Votes in</span><span>{state.votesSubmitted} / {state.players.length}</span></div>
                  <div className={`bar ${allVoted ? 'ok' : ''}`}><i style={{ width: `${state.players.length ? (state.votesSubmitted / state.players.length) * 100 : 0}%` }} /></div>
                </div>

                {state.isHost && (
                  <button className="btn w-full mt-5" disabled={busy} onClick={() => act('reveal')}>
                    {allVoted ? 'Reveal results' : `Reveal anyway (${state.players.length - state.votesSubmitted} still voting)`}
                  </button>
                )}
              </>
            )}

            {/* ───────────── REVEAL ───────────── */}
            {room.status === 'revealed' && result && (
              <>
                <div className="eyebrow">Round {room.round} · Reveal</div>
                <h2 className={`mt-2 break-words text-2xl font-black leading-tight pop sm:text-3xl ${result.caught ? 'text-truth' : 'text-liar'}`}>
                  {result.noVotes ? 'NOBODY VOTED' : result.caught ? (result.liars.length > 1 ? 'A LIAR WAS CAUGHT' : 'LIAR CAUGHT') : (result.liars.length > 1 ? 'THE LIARS ESCAPED' : 'THE LIAR ESCAPED')}
                </h2>
                <p className="muted mt-2 text-sm">
                  {result.noVotes ? 'No votes were cast, so the liar slips away.'
                    : result.mostVoted.length > 1 ? 'The vote was tied, so the liar slips away.'
                    : result.caught ? 'The most votes landed on a liar.' : 'The group voted for an innocent player.'}
                </p>

                <div className="mt-4 space-y-2">
                  {result.liars.map((p: any) => (
                    <div key={p.id} className="break-words bg-liar/10 border border-liar/40 p-3 rounded-xl text-sm">🤥 <b>{p.name}</b> was a liar</div>
                  ))}
                </div>

                {guessPending && (
                  <div className="chip mt-5 !p-4">
                    <div className="eyebrow mb-2">Caught liar&apos;s word guess</div>
                    {result.guessStatus === 'submitted' && state.isHost ? (
                      <>
                        <p className="break-words text-sm">Guess: <b>{result.guessText}</b></p>
                        <p className="muted mt-2 text-sm">Shared word: <b className="text-white">{result.civilianWord}</b></p>
                        <div className="grid gap-2 mt-4 sm:grid-cols-2">
                          <button className="btn" disabled={busy} onClick={() => act('judge-guess', { correct: true })}>Correct — liar gets +3</button>
                          <button className="btn-ghost" disabled={busy} onClick={() => act('judge-guess', { correct: false })}>Incorrect — normal points</button>
                        </div>
                      </>
                    ) : result.guessStatus === 'pending' && state.playerId === result.caughtLiarId ? (
                      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); void act('submit-guess', { guess }); }}>
                        <input className="field min-w-0" maxLength={100} placeholder="What was the shared word?" value={guess} onChange={(e) => setGuess(e.target.value)} />
                        <button className="btn-ghost whitespace-nowrap" disabled={busy || !guess.trim()}>Submit guess</button>
                      </form>
                    ) : result.guessStatus === 'pending' && state.isHost ? (
                      <>
                        <p className="muted text-sm">Waiting for the caught liar to submit a guess.</p>
                        <button className="btn-ghost mt-3 w-full" disabled={busy} onClick={() => act('judge-guess', { correct: false })}>No guess received? Mark incorrect</button>
                      </>
                    ) : result.guessStatus === 'submitted' && state.playerId === result.caughtLiarId ? (
                      <p className="muted text-sm">Your guess has been submitted. Waiting for the host to judge it.</p>
                    ) : (
                      <p className="muted text-sm">{result.guessStatus === 'pending' ? 'The caught liar is making a guess.' : 'The host is checking the guess.'}</p>
                    )}
                  </div>
                )}

                {!guessPending && (
                  <div className="grid grid-cols-1 gap-2 mt-5 sm:grid-cols-2">
                    <div className="chip min-w-0 text-center"><div className="break-words text-[10px] tracking-widest text-truth font-bold">TRUTH-TELLERS HAD</div><div className="mt-1 break-words font-black">{result.civilianWord}</div></div>
                    <div className="chip min-w-0 text-center"><div className="break-words text-[10px] tracking-widest text-liar font-bold">LIAR{result.liars.length > 1 ? 'S' : ''} HAD</div><div className="mt-1 break-words font-black">{result.liarWord}</div></div>
                  </div>
                )}

                {result.guessStatus === 'judged' && (
                  <p className={`mt-4 text-sm font-bold ${result.guessCorrect ? 'text-truth' : 'text-liar'}`}>
                    {result.guessText ? <>Guess: “{result.guessText}” — </> : 'No guess — '}
                    {result.guessCorrect ? 'Correct! The caught liar gets 3 points; no one else scores this round.' : 'Incorrect. Normal round points apply.'}
                  </p>
                )}

                {result.tally.length > 0 && (
                  <div className="mt-5">
                    <div className="eyebrow mb-3">How the votes landed</div>
                    <ul className="space-y-2.5">
                      {result.tally.map((t: any) => (
                        <li key={t.id}>
                          <div className="flex justify-between gap-2 text-sm mb-1"><span className="min-w-0 break-words">{t.name}{t.liar && <span className="text-liar text-[10px] font-bold tracking-widest ml-2">LIAR</span>}</span><b className="shrink-0">{t.votes}</b></div>
                          <div className={`bar ${t.liar ? '' : 'ok'}`}><i style={{ width: `${(t.votes / result.voteCount) * 100}%` }} /></div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!guessPending && (
                  <div className="mt-6">
                    <div className="eyebrow mb-3">Scoreboard</div>
                    <Scoreboard rows={state.scoreboard} teamScores={state.teamScores} mode={room.mode} meId={state.playerId} gained={gained} />
                  </div>
                )}

                {state.isHost
                  ? <button className="btn w-full mt-6" disabled={busy || guessPending} onClick={() => act('next')}>Back to lobby / next round</button>
                  : <p className="muted text-sm mt-6">Waiting for the host to start the next round…</p>}
              </>
            )}
            {room.status === 'revealed' && !result && <p className="muted">Loading results…</p>}
          </section>

          {/* ───────────── SIDEBAR ───────────── */}
          <aside className="panel min-w-0 p-4 h-fit sm:p-5">
            <div className="eyebrow mb-3">{state.isHost ? 'Host panel' : 'Room info'}</div>
            {state.isHost ? (
              <>
                <div className="bg-white rounded-xl p-3 w-fit mx-auto"><QRCodeSVG value={joinUrl} size={170} /></div>
                <p className="muted text-xs text-center mt-3">Scan to open outLIAR with room <b className="text-white">{code}</b> filled in.</p>
                <button className="btn-ghost w-full mt-3 text-sm" onClick={invite}>{copied ? 'Link copied ✓' : 'Copy invite link'}</button>
              </>
            ) : (
              <p className="text-sm muted">You joined as <b className="text-white">{me?.name || session.name}</b>{me?.team && <span className={`ml-1 ${teamColor(me.team)}`}>(Team {me.team})</span>}.</p>
            )}
            <div className="border-t border-line mt-5 pt-4 text-sm space-y-3">
              <div className="flex justify-between gap-3"><span className="muted">Mode</span><b className="text-right">{room.mode === 'teams' ? 'Team vs team' : 'Free-for-all'}</b></div>
              <div className="flex justify-between gap-3"><span className="muted">Players</span><b className="text-right">{state.players.length}/{room.max_players}</b></div>
              <div className="flex justify-between gap-3"><span className="muted">Liars</span><b className="text-right">{room.imposter_count}{room.mode === 'teams' ? ' / team' : ''}</b></div>
              <div>
                <div className="muted mb-1">Word topics</div>
                <div className="flex flex-wrap gap-1.5">
                  {(room.word_categories || DEFAULT_WORD_CATEGORIES).map((category: string) => (
                    <span key={category} className="chip max-w-full break-words !px-2 !py-1 text-xs">{wordCategoryLabel(category)}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between gap-3"><span className="muted">Blind mode</span><b className="text-right">{room.liars_know ? 'Off' : 'On'}</b></div>
              <div className="flex justify-between gap-3"><span className="muted">Phase</span><b className="text-right capitalize">{room.status}</b></div>
            </div>
          </aside>
        </div>

        <p className="text-center muted text-xs mt-8">Keep your word secret. Trust nobody.</p>
        <Credit className="mt-2" />
      </div>
    </main>
  );
}
