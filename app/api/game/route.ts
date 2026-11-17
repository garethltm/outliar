import { NextRequest, NextResponse } from 'next/server';
import { adminDb, Db } from '@/lib/supabase';
import { hashToken, newCode, newToken, rateLimit, safeEqual, shuffle } from '@/lib/security';
import { DIFFICULTIES, pickPair } from '@/lib/words';
import { minimumPlayers, startRequirement } from '@/lib/rules';

export const dynamic = 'force-dynamic';

const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
async function body(req: NextRequest) { try { return await req.json(); } catch { return {}; } }
const clientIp = (req: NextRequest) => (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
const cleanName = (raw: unknown) =>
  String(raw ?? '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20);
const nowIso = () => new Date().toISOString();

/** Puts a new player on whichever team has fewer members (stays balanced after kicks/leaves). */
function pickTeam(players: { team: string | null }[]) {
  const a = players.filter((p) => p.team === 'A').length;
  const b = players.filter((p) => p.team === 'B').length;
  return a <= b ? 'A' : 'B';
}

async function addPlayer(db: Db, room: any, name: string, tokenHash: string): Promise<{ error: string } | { player: any }> {
  const { data: existing } = await db.from('players').select('id,name,team').eq('room_id', room.id);
  const list = existing || [];
  if (list.length >= room.max_players) return { error: 'This room is full.' };
  if (list.some((p: any) => p.name.toLowerCase() === name.toLowerCase())) {
    return { error: 'That nickname is already taken in this room. Try another one.' };
  }
  const { data: player, error } = await db
    .from('players')
    .insert({ room_id: room.id, name, token_hash: tokenHash, team: room.mode === 'teams' ? pickTeam(list as any) : null })
    .select('id,name,team')
    .single();
  if (error) throw error;
  return { player };
}

/** Atomic status change: only succeeds if the room is still in the expected phase. */
async function transition(db: Db, room: any, from: string, to: string, extra: Record<string, unknown> = {}) {
  const { data, error } = await db
    .from('rooms')
    .update({ status: to, phase_started_at: nowIso(), ...extra })
    .eq('id', room.id)
    .eq('status', from)
    .select('id');
  if (error) throw error;
  return !!(data && data.length);
}

export async function POST(req: NextRequest) {
  try {
    const data = await body(req);
    const action = data.action;
    const db = adminDb();
    const ip = clientIp(req);

    // ───────────────────────── create ─────────────────────────
    if (action === 'create') {
      if (!rateLimit('create:' + ip, 10, 60000)) return fail('Too many rooms created. Please wait a minute.', 429);
      const mode = data.mode === 'teams' ? 'teams' : 'individual';
      const maxPlayers = Number(data.maxPlayers);
      if (!Number.isInteger(maxPlayers) || maxPlayers < 3 || maxPlayers > 30) {
        return fail('Player limit must be a whole number between 3 and 30.');
      }
      const imposters = Math.min(3, Math.max(1, Number(data.imposters) || 1));
      const minPlayers = minimumPlayers(mode, imposters);
      if (maxPlayers < minPlayers) {
        return fail(`Player limit must be at least ${minPlayers} for ${imposters} ${imposters === 1 ? 'liar' : 'liars'}${mode === 'teams' ? ' per team in 2 Teams mode' : ''}.`);
      }
      const difficulty = DIFFICULTIES.includes(data.difficulty) ? data.difficulty : 'mixed';
      const liarsKnow = data.liarsKnow !== false;
      const hostToken = newToken();
      let room: any = null;
      for (let attempt = 0; attempt < 6 && !room; attempt++) {
        const { data: created, error } = await db
          .from('rooms')
          .insert({
            code: newCode(), mode, max_players: maxPlayers, imposter_count: imposters, difficulty,
            liars_know: liarsKnow, status: 'lobby', host_token_hash: hashToken(hostToken), round: 0,
            phase_started_at: nowIso(),
          })
          .select('id,code,mode,max_players,imposter_count,status,round')
          .single();
        if (error && (error as any).code === '23505') continue; // room code collision — try another
        if (error) throw error;
        room = created;
      }
      if (!room) return fail('Could not create a room. Please try again.', 500);
      return NextResponse.json({ room, token: hostToken, role: 'host' });
    }

    // ───────────────────────── join ─────────────────────────
    if (action === 'join') {
      if (!rateLimit('join:' + ip, 40, 60000)) return fail('Too many attempts. Please wait a minute.', 429);
      const name = cleanName(data.name);
      const code = String(data.code || '').trim();
      if (!name || !/^\d{6}$/.test(code)) return fail('Enter a nickname and a valid six-digit room code.');
      const { data: room } = await db.from('rooms').select('*').eq('code', code).maybeSingle();
      if (!room) return fail('Room not found. Double-check the code.', 404);
      if (room.status !== 'lobby') return fail('This game has already started. Ask the host to finish the round first.');
      const playerToken = newToken();
      const res = await addPlayer(db, room, name, hashToken(playerToken));
      if ('error' in res) return fail(res.error);
      return NextResponse.json({ room: { code: room.code, mode: room.mode, status: room.status }, player: res.player, token: playerToken, role: 'player' });
    }

    // ───────────────────── authenticated actions ─────────────────────
    const code = String(data.code || '');
    const token = String(data.token || '');
    if (!code || !token) return fail('Missing room credentials.', 401);
    const { data: room } = await db.from('rooms').select('*').eq('code', code).maybeSingle();
    if (!room) return fail('Room not found.', 404);
    const th = hashToken(token);
    const isHost = safeEqual(room.host_token_hash, th);
    // A host may also be a player (they "play too"), so always look the player up.
    const { data: player } = await db.from('players').select('*').eq('room_id', room.id).eq('token_hash', th).maybeSingle();
    if (!isHost && !player) return fail('Invalid room credentials.', 401);

    // ───────────────────────── state (poll) ─────────────────────────
    if (action === 'state') {
      const { data: players } = await db.from('players').select('id,name,team,joined_at').eq('room_id', room.id).order('joined_at');
      const roster = players || [];

      let assignment: any = null;
      if (player && room.status !== 'lobby') {
        const { data: a } = await db.from('assignments').select('word,is_imposter').eq('room_id', room.id).eq('player_id', player.id).eq('round', room.round).maybeSingle();
        assignment = a;
        // "Blind liars" mode: nobody (liars included) learns their role until the reveal.
        if (a && room.liars_know === false && room.status !== 'revealed') assignment = { word: a.word, is_imposter: null };
      }

      let votedIds: string[] = []; let myVote: string | null = null;
      if (room.status === 'voting') {
        const { data: votes } = await db.from('votes').select('voter_id,target_id').eq('room_id', room.id).eq('round', room.round);
        votedIds = (votes || []).map((v: any) => v.voter_id);
        myVote = player ? ((votes || []).find((v: any) => v.voter_id === player.id)?.target_id ?? null) : null;
      }

      let result = null;
      if (room.status === 'revealed') {
        const { data: r } = await db.from('round_results').select('result').eq('room_id', room.id).eq('round', room.round).maybeSingle();
        result = r?.result ?? null;
      }

      // Running scoreboard, built from stored per-round points.
      const scoreboard: any[] = []; const teamScores = { A: 0, B: 0 };
      if (room.round > 0) {
        const { data: rows } = await db.from('round_results').select('result').eq('room_id', room.id);
        const totals: Record<string, { id: string; name: string; team: string | null; points: number }> = {};
        (rows || []).forEach((r: any) => (r.result?.points || []).forEach((p: any) => {
          const t = totals[p.id] || (totals[p.id] = { id: p.id, name: p.name, team: p.team ?? null, points: 0 });
          t.points += p.points;
          if (p.team === 'A') teamScores.A += p.points;
          if (p.team === 'B') teamScores.B += p.points;
        }));
        roster.forEach((p: any) => scoreboard.push(totals[p.id] || { id: p.id, name: p.name, team: p.team, points: 0 }));
        scoreboard.sort((x, y) => y.points - x.points || x.name.localeCompare(y.name));
      }

      return NextResponse.json({
        room: {
          code: room.code, mode: room.mode, max_players: room.max_players, imposter_count: room.imposter_count,
          status: room.status, round: room.round, difficulty: room.difficulty || 'mixed', liars_know: room.liars_know !== false,
        },
        players: roster, assignment, playerId: player?.id || null, isHost, myVote,
        votedIds, votesSubmitted: votedIds.length, result, scoreboard, teamScores,
        phaseStartedAt: room.phase_started_at || null, serverTime: Date.now(),
      });
    }

    // ───────────────── actions any member may take ─────────────────
    if (action === 'leave') {
      // Only safe between rounds — removing someone mid-round would corrupt roles and votes.
      if (player && (room.status === 'lobby' || room.status === 'revealed')) {
        await db.from('players').delete().eq('id', player.id);
      }
      return NextResponse.json({ ok: true });
    }

    // ───────────────────────── host-only ─────────────────────────
    if (!isHost) return fail('Only the host can perform this action.', 403);

    if (action === 'host-join') {
      if (room.status !== 'lobby') return fail('You can only join as a player while in the lobby.');
      if (player) return fail('You are already playing.');
      const name = cleanName(data.name);
      if (!name) return fail('Enter a nickname to play.');
      const res = await addPlayer(db, room, name, th);
      if ('error' in res) return fail(res.error);
      return NextResponse.json({ ok: true, player: res.player });
    }

    if (action === 'kick') {
      if (room.status !== 'lobby' && room.status !== 'revealed') return fail('Players can only be removed between rounds.');
      const targetId = String(data.playerId || '');
      if (!targetId) return fail('Choose a player to remove.');
      await db.from('players').delete().eq('id', targetId).eq('room_id', room.id);
      return NextResponse.json({ ok: true });
    }

    if (action === 'end') {
      await db.from('rooms').delete().eq('id', room.id); // cascades to every related table
      return NextResponse.json({ ok: true });
    }

    if (action === 'start') {
      if (room.status !== 'lobby') return fail('A round is already in progress.');
      const { data: players } = await db.from('players').select('id,team').eq('room_id', room.id);
      const list = players || [];
      const problem = startRequirement(room.mode, room.imposter_count, list as any);
      if (problem) return fail(problem);

      // Avoid repeating words within the same room.
      const used = new Set<string>();
      const { data: past } = await db.from('round_results').select('result').eq('room_id', room.id);
      (past || []).forEach((r: any) => { if (r.result?.civilianWord) used.add(r.result.civilianWord); if (r.result?.liarWord) used.add(r.result.liarWord); });
      if (room.word_a) used.add(room.word_a);
      if (room.word_b) used.add(room.word_b);
      const pair = pickPair(room.difficulty || 'mixed', used);

      const round = room.round + 1;
      const shuffled = shuffle(list);
      const liars = new Set<string>();
      if (room.mode === 'teams') {
        for (const team of ['A', 'B']) shuffled.filter((p: any) => p.team === team).slice(0, room.imposter_count).forEach((p: any) => liars.add(p.id));
      } else {
        shuffled.slice(0, room.imposter_count).forEach((p: any) => liars.add(p.id));
      }

      // Claim the phase first so a double-tap on "Start" can't create two rounds.
      const claimed = await transition(db, room, 'lobby', 'clues', { round, word_a: pair.civilian, word_b: pair.liar });
      if (!claimed) return fail('A round is already in progress.');
      const rows = list.map((p: any) => ({ room_id: room.id, player_id: p.id, round, word: liars.has(p.id) ? pair.liar : pair.civilian, is_imposter: liars.has(p.id) }));
      const { error: ae } = await db.from('assignments').insert(rows);
      if (ae) {
        await db.from('rooms').update({ status: 'lobby', round: room.round, phase_started_at: nowIso() }).eq('id', room.id);
        throw ae;
      }
      return NextResponse.json({ ok: true, round });
    }

    if (action === 'begin-vote') {
      if (!(await transition(db, room, 'clues', 'voting'))) return fail('Voting can only start during the clue phase.');
      return NextResponse.json({ ok: true });
    }

    if (action === 'reveal') {
      if (room.status !== 'voting') return fail('Results can only be revealed during voting.');
      const { data: assignments } = await db.from('assignments').select('player_id,is_imposter').eq('room_id', room.id).eq('round', room.round);
      const { data: votes } = await db.from('votes').select('voter_id,target_id').eq('room_id', room.id).eq('round', room.round);
      const { data: people } = await db.from('players').select('id,name,team').eq('room_id', room.id);
      const ppl = people || []; const vs = votes || [];
      const liarIds = new Set((assignments || []).filter((a: any) => a.is_imposter).map((a: any) => a.player_id));

      const tally: Record<string, number> = {};
      vs.forEach((v: any) => { tally[v.target_id] = (tally[v.target_id] || 0) + 1; });
      const max = Math.max(0, ...Object.values(tally));
      const mostVoted = max > 0 ? Object.keys(tally).filter((k) => tally[k] === max) : [];
      const caught = mostVoted.length === 1 && liarIds.has(mostVoted[0]);

      // Scoring: truth-tellers +2 when a liar is caught (+1 sharp-eye bonus for voting a liar),
      // liars +3 when they escape, +1 for a liar who stays hidden while a teammate is caught.
      const points = ppl.map((p: any) => {
        const isLiar = liarIds.has(p.id);
        let pts = 0; const notes: string[] = [];
        if (isLiar) {
          if (!caught) { pts += 3; notes.push('Escaped'); }
          else if (mostVoted[0] !== p.id) { pts += 1; notes.push('Stayed hidden'); }
        } else {
          if (caught) { pts += 2; notes.push('Liar caught'); }
          const v = vs.find((x: any) => x.voter_id === p.id);
          if (v && liarIds.has(v.target_id)) { pts += 1; notes.push('Sharp eye'); }
        }
        return { id: p.id, name: p.name, team: p.team, role: isLiar ? 'liar' : 'truth', points: pts, note: notes.join(' · ') };
      });

      const result = {
        caught, noVotes: max === 0, mostVoted, voteCount: max,
        civilianWord: room.word_a, liarWord: room.word_b,
        liars: ppl.filter((p: any) => liarIds.has(p.id)).map((p: any) => ({ id: p.id, name: p.name, team: p.team })),
        tally: ppl.filter((p: any) => tally[p.id]).map((p: any) => ({ id: p.id, name: p.name, votes: tally[p.id], liar: liarIds.has(p.id) })).sort((a: any, b: any) => b.votes - a.votes),
        points,
      };
      const { error: re } = await db.from('round_results').upsert({ room_id: room.id, round: room.round, result }, { onConflict: 'room_id,round' });
      if (re) throw re;
      await transition(db, room, 'voting', 'revealed');
      return NextResponse.json({ ok: true });
    }

    if (action === 'next') {
      if (!(await transition(db, room, 'revealed', 'lobby'))) return fail('The round has not been revealed yet.');
      return NextResponse.json({ ok: true });
    }

    return fail('Unknown action.');
  } catch (e: any) {
    console.error(e);
    return fail(e?.message || 'Unexpected server error.', 500);
  }
}

// ───────────────────────── vote ─────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const data = await body(req); const db = adminDb();
    const code = String(data.code || ''); const token = String(data.token || '');
    const { data: room } = await db.from('rooms').select('id,round,status').eq('code', code).maybeSingle();
    if (!room) return fail('Room not found.', 404);
    const { data: player } = await db.from('players').select('id').eq('room_id', room.id).eq('token_hash', hashToken(token)).maybeSingle();
    if (!player) return fail('You are not a player in this room.', 401);
    if (room.status !== 'voting') return fail('Voting is not open.');
    const target = String(data.targetId || '');
    if (!target || target === player.id) return fail('Choose another player.');
    const { data: targetPlayer } = await db.from('players').select('id').eq('room_id', room.id).eq('id', target).maybeSingle();
    if (!targetPlayer) return fail('That player is no longer in the room.');
    const { data: existing } = await db.from('votes').select('id').eq('room_id', room.id).eq('round', room.round).eq('voter_id', player.id).maybeSingle();
    if (existing) return fail('Your vote has already been submitted.');
    const { error } = await db.from('votes').insert({ room_id: room.id, round: room.round, voter_id: player.id, target_id: target });
    if (error) {
      if ((error as any).code === '23505') return fail('Your vote has already been submitted.');
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return fail(e?.message || 'Unable to submit vote.', 500);
  }
}
