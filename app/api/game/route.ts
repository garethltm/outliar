import { NextRequest, NextResponse } from "next/server";
import { adminDb, Db } from "@/lib/supabase";
import {
  hashToken,
  newCode,
  newToken,
  rateLimit,
  safeEqual,
  shuffle,
} from "@/lib/security";
import { pickPair } from "@/lib/words";
import { minimumPlayers, startRequirement } from "@/lib/rules";
import { DEFAULT_WORD_CATEGORIES, isWordCategory } from "@/lib/word-categories";
import {
  DEFAULT_KINGDOM_ROLE_COUNTS,
  KINGDOM_IDS,
  KINGDOM_SCORING,
  KINGDOM_TEAMS,
  MAX_KINGDOM_ROLE_COUNT,
  type KingdomRole,
  type KingdomRoleCounts,
} from "@/lib/kingdom";
import { pickKingdomTopics } from "@/lib/kingdom-words";

export const dynamic = "force-dynamic";

const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });
async function body(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
const clientIp = (req: NextRequest) =>
  (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
const cleanName = (raw: unknown) =>
  String(raw ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
const nowIso = () => new Date().toISOString();

/** Puts a new player on whichever team has fewer members (stays balanced after kicks/leaves). */
function pickTeam(players: { team: string | null }[]) {
  const a = players.filter((p) => p.team === "A").length;
  const b = players.filter((p) => p.team === "B").length;
  return a <= b ? "A" : "B";
}

function pickKingdomTeam(
  players: { kingdom_team: string | null }[],
  kingdomCount: number,
) {
  const teams = KINGDOM_IDS.slice(0, kingdomCount);
  const counts = teams.map((team) => ({
    team,
    count: players.filter((player) => player.kingdom_team === team).length,
  }));
  return counts.reduce((least, current) =>
    current.count < least.count ? current : least,
  ).team;
}

async function addPlayer(
  db: Db,
  room: any,
  name: string,
  tokenHash: string,
): Promise<{ error: string } | { player: any }> {
  const { data: existing } = await db
    .from("players")
    .select("id,name,team,kingdom_team")
    .eq("room_id", room.id);
  const list = existing || [];
  if (list.length >= room.max_players) return { error: "This room is full." };
  if (list.some((p: any) => p.name.toLowerCase() === name.toLowerCase())) {
    return {
      error: "That nickname is already taken in this room. Try another one.",
    };
  }
  const { data: player, error } = await db
    .from("players")
    .insert({
      room_id: room.id,
      name,
      token_hash: tokenHash,
      team:
        room.game_mode !== "kingdom" && room.mode === "teams"
          ? pickTeam(list as any)
          : null,
      kingdom_team:
        room.game_mode === "kingdom"
          ? pickKingdomTeam(list as any, room.kingdom_count || 2)
          : null,
    })
    .select("id,name,team,kingdom_team")
    .single();
  if (error) throw error;
  return { player };
}

function parseKingdomRoleCounts(value: unknown): KingdomRoleCounts | null {
  if (value === undefined) return { ...DEFAULT_KINGDOM_ROLE_COUNTS };
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const input = value as Record<string, unknown>;
  const counts = { ...DEFAULT_KINGDOM_ROLE_COUNTS };
  for (const role of ["assassin", "joker"] as const) {
    const count = input[role] ?? DEFAULT_KINGDOM_ROLE_COUNTS[role];
    if (
      typeof count !== "number" ||
      !Number.isInteger(count) ||
      count < 0 ||
      count > MAX_KINGDOM_ROLE_COUNT
    ) {
      return null;
    }
    counts[role] = count;
  }
  return counts;
}

const kingdomMinimumPlayers = (
  kingdomCount: number,
  roleCounts: KingdomRoleCounts,
) => kingdomCount * (2 + roleCounts.assassin + roleCounts.joker);

/** Atomic status change: only succeeds if the room is still in the expected phase. */
async function transition(
  db: Db,
  room: any,
  from: string,
  to: string,
  extra: Record<string, unknown> = {},
) {
  const { data, error } = await db
    .from("rooms")
    .update({ status: to, phase_started_at: nowIso(), ...extra })
    .eq("id", room.id)
    .eq("status", from)
    .select("id");
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
    if (action === "create") {
      if (!rateLimit("create:" + ip, 10, 60000))
        return fail("Too many rooms created. Please wait a minute.", 429);
      const gameMode = data.gameMode === "kingdom" ? "kingdom" : "undercover";
      const mode =
        gameMode === "kingdom"
          ? "teams"
          : data.mode === "teams"
            ? "teams"
            : "individual";
      const kingdomCount =
        gameMode === "kingdom"
          ? Math.min(4, Math.max(2, Number(data.kingdomCount) || 2))
          : 2;
      const kingdomRoleCounts =
        gameMode === "kingdom"
          ? parseKingdomRoleCounts(data.kingdomRoleCounts)
          : { ...DEFAULT_KINGDOM_ROLE_COUNTS };
      if (!kingdomRoleCounts)
        return fail("Choose a valid count for each Secret Kingdom role.");
      const maxPlayers = Number(data.maxPlayers);
      const minimumForMode =
        gameMode === "kingdom"
          ? kingdomMinimumPlayers(kingdomCount, kingdomRoleCounts)
          : 3;
      if (
        !Number.isInteger(maxPlayers) ||
        maxPlayers < minimumForMode ||
        maxPlayers > 30
      ) {
        return fail(
          `Player limit must be a whole number between ${minimumForMode} and 30.`,
        );
      }
      const imposters = Math.min(3, Math.max(1, Number(data.imposters) || 1));
      const minPlayers = minimumPlayers(mode, imposters);
      if (gameMode === "undercover" && maxPlayers < minPlayers) {
        return fail(
          `Player limit must be at least ${minPlayers} for ${imposters} ${imposters === 1 ? "liar" : "liars"}${mode === "teams" ? " per team in 2 Teams mode" : ""}.`,
        );
      }
      const requestedCategories =
        data.wordCategories === undefined
          ? DEFAULT_WORD_CATEGORIES
          : data.wordCategories;
      if (
        !Array.isArray(requestedCategories) ||
        requestedCategories.length === 0 ||
        !requestedCategories.every(isWordCategory)
      ) {
        return fail("Select at least one valid word category.");
      }
      const wordCategories = [...new Set(requestedCategories)];
      const liarsKnow =
        gameMode === "kingdom" || data.liarsKnow !== false;
      const hostToken = newToken();
      let room: any = null;
      for (let attempt = 0; attempt < 6 && !room; attempt++) {
        const { data: created, error } = await db
          .from("rooms")
          .insert({
            code: newCode(),
            game_mode: gameMode,
            kingdom_count: kingdomCount,
            kingdom_role_counts: kingdomRoleCounts,
            mode,
            max_players: maxPlayers,
            imposter_count: imposters,
            word_categories: wordCategories,
            liars_know: liarsKnow,
            status: "lobby",
            host_token_hash: hashToken(hostToken),
            round: 0,
            phase_started_at: nowIso(),
          })
          .select(
            "id,code,game_mode,kingdom_count,kingdom_role_counts,mode,max_players,imposter_count,word_categories,status,round",
          )
          .single();
        if (error && (error as any).code === "23505") continue; // room code collision — try another
        if (error) throw error;
        room = created;
      }
      if (!room) return fail("Could not create a room. Please try again.", 500);
      return NextResponse.json({
        room: { ...room, game_mode: gameMode },
        token: hostToken,
        role: "host",
      });
    }

    // ───────────────────────── join ─────────────────────────
    if (action === "join") {
      if (!rateLimit("join:" + ip, 40, 60000))
        return fail("Too many attempts. Please wait a minute.", 429);
      const name = cleanName(data.name);
      const code = String(data.code || "").trim();
      if (!name || !/^\d{6}$/.test(code))
        return fail("Enter a nickname and a valid six-digit room code.");
      const { data: room } = await db
        .from("rooms")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (!room) return fail("Room not found. Double-check the code.", 404);
      if (room.status !== "lobby")
        return fail(
          "This game has already started. Ask the host to finish the round first.",
        );
      const playerToken = newToken();
      const res = await addPlayer(db, room, name, hashToken(playerToken));
      if ("error" in res) return fail(res.error);
      return NextResponse.json({
        room: {
          code: room.code,
          game_mode: room.game_mode || "undercover",
          kingdom_count: room.kingdom_count || 2,
          mode: room.mode,
          status: room.status,
        },
        player: res.player,
        token: playerToken,
        role: "player",
      });
    }

    // ───────────────────── authenticated actions ─────────────────────
    const code = String(data.code || "");
    const token = String(data.token || "");
    if (!code || !token) return fail("Missing room credentials.", 401);
    const { data: room } = await db
      .from("rooms")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!room) return fail("Room not found.", 404);
    const th = hashToken(token);
    const isHost = safeEqual(room.host_token_hash, th);
    // A host may also be a player (they "play too"), so always look the player up.
    const { data: player } = await db
      .from("players")
      .select("*")
      .eq("room_id", room.id)
      .eq("token_hash", th)
      .maybeSingle();
    if (!isHost && !player) return fail("Invalid room credentials.", 401);

    // ───────────────────────── state (poll) ─────────────────────────
    if (action === "state") {
      const { data: players } = await db
        .from("players")
        .select(
          room.game_mode === "kingdom"
            ? room.status === "voting"
              ? "id,name,team,joined_at"
              : "id,name,team,kingdom_choice,joined_at"
            : "id,name,team,kingdom_choice,joined_at",
        )
        .eq("room_id", room.id)
        .order("joined_at");
      const roster = players || [];

      let assignment: any = null;
      if (player && room.status !== "lobby") {
        const { data: a } = await db
          .from("assignments")
          .select("word,is_imposter,role,kingdom_team,hint,target_team")
          .eq("room_id", room.id)
          .eq("player_id", player.id)
          .eq("round", room.round)
          .maybeSingle();
        assignment = a;
        // "Blind liars" mode: nobody (liars included) learns their role until the reveal.
        if (
          a &&
          room.game_mode !== "kingdom" &&
          room.liars_know === false &&
          room.status !== "revealed"
        )
          assignment = { word: a.word, is_imposter: null };
      }

      let votedIds: string[] = [];
      let myVote: string | null = null;
      if (room.status === "voting") {
        const { data: votes } = await db
          .from("votes")
          .select("voter_id,target_id")
          .eq("room_id", room.id)
          .eq("round", room.round);
        votedIds = (votes || []).map((v: any) => v.voter_id);
        myVote = player
          ? ((votes || []).find((v: any) => v.voter_id === player.id)
              ?.target_id ?? null)
          : null;
        if (room.game_mode === "kingdom") {
          votedIds = [];
          myVote =
            player && assignment?.role === "assassin"
              ? ((votes || []).find((v: any) => v.voter_id === player.id)
                  ?.target_id ?? null)
              : null;
        }
      }

      let result = null;
      if (room.status === "revealed") {
        const { data: r } = await db
          .from("round_results")
          .select("result")
          .eq("room_id", room.id)
          .eq("round", room.round)
          .maybeSingle();
        result = r?.result ?? null;
        if (
          result?.guessStatus === "pending" ||
          result?.guessStatus === "submitted"
        ) {
          result = {
            ...result,
            civilianWord:
              isHost && result.guessStatus === "submitted"
                ? result.civilianWord
                : null,
            liarWord: null,
            guessText:
              isHost || player?.id === result.caughtLiarId
                ? result.guessText
                : null,
            points: [],
          };
        }
      }

      // Running scoreboard, built from stored per-round points.
      const scoreboard: any[] = [];
      const teamScores = { A: 0, B: 0 };
      if (room.round > 0) {
        const { data: rows } = await db
          .from("round_results")
          .select("result")
          .eq("room_id", room.id);
        const totals: Record<
          string,
          { id: string; name: string; team: string | null; points: number }
        > = {};
        (rows || [])
          .filter(
            (r: any) =>
              r.result?.guessStatus !== "pending" &&
              r.result?.guessStatus !== "submitted",
          )
          .forEach((r: any) =>
            (r.result?.points || []).forEach((p: any) => {
              const t =
                totals[p.id] ||
                (totals[p.id] = {
                  id: p.id,
                  name: p.name,
                  team: p.team ?? null,
                  points: 0,
                });
              t.points += p.points;
              if (p.team === "A") teamScores.A += p.points;
              if (p.team === "B") teamScores.B += p.points;
            }),
          );
        roster.forEach((p: any) =>
          scoreboard.push(
            totals[p.id] || { id: p.id, name: p.name, team: p.team, points: 0 },
          ),
        );
        scoreboard.sort(
          (x, y) => y.points - x.points || x.name.localeCompare(y.name),
        );
      }

      return NextResponse.json({
        room: {
          code: room.code,
          game_mode: room.game_mode || "undercover",
          kingdom_count: room.kingdom_count || 2,
          kingdom_role_counts:
            room.kingdom_role_counts || DEFAULT_KINGDOM_ROLE_COUNTS,
          mode: room.mode,
          max_players: room.max_players,
          imposter_count: room.imposter_count,
          word_categories: room.word_categories || DEFAULT_WORD_CATEGORIES,
          status: room.status,
          round: room.round,
          liars_know:
            room.game_mode === "kingdom" || room.liars_know !== false,
        },
        players: roster,
        assignment,
        playerId: player?.id || null,
        myKingdomTeam: player?.kingdom_team ?? null,
        myKingdomChoice: player?.kingdom_choice ?? null,
        isHost,
        myVote,
        votedIds,
        votesSubmitted: votedIds.length,
        result,
        scoreboard,
        teamScores,
        phaseStartedAt: room.phase_started_at || null,
        serverTime: Date.now(),
      });
    }

    // ───────────────── actions any member may take ─────────────────
    if (action === "leave") {
      // Only safe between rounds — removing someone mid-round would corrupt roles and votes.
      if (player && (room.status === "lobby" || room.status === "revealed")) {
        await db.from("players").delete().eq("id", player.id);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "submit-guess") {
      if (room.status !== "revealed")
        return fail("Word guesses are only accepted after the reveal.");
      if (!player)
        return fail("Only the caught player can submit a word guess.", 403);
      const guess = String(data.guess ?? "")
        .replace(/[\u0000-\u001f\u007f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!guess || guess.length > 100)
        return fail("Enter a guess of 1 to 100 characters.");

      const { data: current, error: readError } = await db
        .from("round_results")
        .select("result")
        .eq("room_id", room.id)
        .eq("round", room.round)
        .maybeSingle();
      if (readError) throw readError;
      if (
        current?.result?.guessStatus !== "pending" ||
        current.result.caughtLiarId !== player.id
      ) {
        return fail(
          "This word guess has already been submitted or is not for you.",
        );
      }

      const { data: updated, error: updateError } = await db
        .from("round_results")
        .update({
          result: {
            ...current.result,
            guessStatus: "submitted",
            guessText: guess,
          },
        })
        .eq("room_id", room.id)
        .eq("round", room.round)
        .eq("result->>guessStatus", "pending")
        .select("round");
      if (updateError) throw updateError;
      if (!updated?.length)
        return fail("This word guess has already been submitted.");
      return NextResponse.json({ ok: true });
    }

    // ───────────────────────── host-only ─────────────────────────
    if (!isHost) return fail("Only the host can perform this action.", 403);

    if (action === "update-topics") {
      if (room.status !== "lobby")
        return fail("Topics can only be changed in the lobby or between rounds.");
      if (
        !Array.isArray(data.wordCategories) ||
        data.wordCategories.length === 0 ||
        !data.wordCategories.every(isWordCategory)
      ) {
        return fail("Select at least one valid word topic.");
      }

      const wordCategories = [...new Set(data.wordCategories)];
      const { data: updated, error: updateError } = await db
        .from("rooms")
        .update({ word_categories: wordCategories })
        .eq("id", room.id)
        .eq("status", "lobby")
        .select("id")
        .maybeSingle();
      if (updateError) throw updateError;
      if (!updated)
        return fail("The round started before topics were saved. Try again.");
      return NextResponse.json({ ok: true });
    }

    if (action === "judge-guess") {
      if (room.status !== "revealed")
        return fail("Word guesses can only be judged after the reveal.");
      if (typeof data.correct !== "boolean")
        return fail("Choose whether the guess is correct or incorrect.");

      const { data: current, error: readError } = await db
        .from("round_results")
        .select("result")
        .eq("room_id", room.id)
        .eq("round", room.round)
        .maybeSingle();
      if (readError) throw readError;
      if (
        !current ||
        !["pending", "submitted"].includes(current.result?.guessStatus)
      )
        return fail("This word guess has already been judged.");
      if (data.correct && current.result.guessStatus !== "submitted")
        return fail(
          "The caught player must submit a guess before it can be marked correct.",
        );

      const result = {
        ...current.result,
        guessStatus: "judged",
        guessCorrect: data.correct,
      };
      if (data.correct) {
        result.points = (current.result.points || []).map((p: any) => ({
          ...p,
          points: p.id === current.result.caughtLiarId ? 3 : 0,
          note:
            p.id === current.result.caughtLiarId
              ? "Correctly guessed the word"
              : "",
        }));
      }

      const { data: updated, error: updateError } = await db
        .from("round_results")
        .update({ result })
        .eq("room_id", room.id)
        .eq("round", room.round)
        .eq("result->>guessStatus", current.result.guessStatus)
        .select("round");
      if (updateError) throw updateError;
      if (!updated?.length)
        return fail("This word guess has already been judged.");
      return NextResponse.json({ ok: true });
    }

    if (action === "host-join") {
      if (room.status !== "lobby")
        return fail("You can only join as a player while in the lobby.");
      if (player) return fail("You are already playing.");
      const name = cleanName(data.name);
      if (!name) return fail("Enter a nickname to play.");
      const res = await addPlayer(db, room, name, th);
      if ("error" in res) return fail(res.error);
      return NextResponse.json({ ok: true, player: res.player });
    }

    if (action === "kick") {
      if (room.status !== "lobby" && room.status !== "revealed")
        return fail("Players can only be removed between rounds.");
      const targetId = String(data.playerId || "");
      if (!targetId) return fail("Choose a player to remove.");
      await db
        .from("players")
        .delete()
        .eq("id", targetId)
        .eq("room_id", room.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "end") {
      await db.from("rooms").delete().eq("id", room.id); // cascades to every related table
      return NextResponse.json({ ok: true });
    }

    if (action === "start") {
      if (room.status !== "lobby")
        return fail("A round is already in progress.");
      const { data: players } = await db
        .from("players")
        .select("id,team,kingdom_team")
        .eq("room_id", room.id);
      const list = players || [];
      const kingdomRoleCounts = parseKingdomRoleCounts(
        room.kingdom_role_counts,
      );
      if (!kingdomRoleCounts)
        return fail("This room has invalid Kingdom role settings.", 500);
      const problem =
        room.game_mode === "kingdom"
          ? list.length <
            kingdomMinimumPlayers(room.kingdom_count || 2, kingdomRoleCounts)
            ? `Secret Kingdom needs at least ${kingdomMinimumPlayers(room.kingdom_count || 2, kingdomRoleCounts)} players for ${room.kingdom_count || 2} kingdoms with these role counts.`
            : null
          : startRequirement(room.mode, room.imposter_count, list as any);
      if (problem) return fail(problem);

      const kingdomCount = room.kingdom_count || 2;
      if (room.game_mode === "kingdom") {
        const kingdomIds = KINGDOM_IDS.slice(0, kingdomCount);
        for (const player of shuffle(
          list.filter((person: any) => !kingdomIds.includes(person.kingdom_team)),
        )) {
          const kingdomTeam = pickKingdomTeam(list as any, kingdomCount);
          const { data: updated, error: teamError } = await db
            .from("players")
            .update({ kingdom_team: kingdomTeam })
            .eq("id", player.id)
            .eq("room_id", room.id)
            .is("kingdom_team", null)
            .select("kingdom_team")
            .maybeSingle();
          if (teamError) throw teamError;
          if (updated) {
            player.kingdom_team = updated.kingdom_team;
          } else {
            const { data: current, error: currentError } = await db
              .from("players")
              .select("kingdom_team")
              .eq("id", player.id)
              .eq("room_id", room.id)
              .maybeSingle();
            if (currentError) throw currentError;
            if (!current?.kingdom_team)
              return fail("Could not assign a Kingdom color to every player.");
            player.kingdom_team = current.kingdom_team;
          }
        }

        const minimumPerKingdom =
          2 + kingdomRoleCounts.assassin + kingdomRoleCounts.joker;
        if (
          kingdomIds.some(
            (team) =>
              list.filter((person: any) => person.kingdom_team === team)
                .length < minimumPerKingdom,
          )
        ) {
          return fail(
            `Each kingdom needs at least ${minimumPerKingdom} players with these role counts.`,
          );
        }
      }

      const used = new Set<string>();
      const usedTopics = new Set<string>();
      if (room.game_mode === "kingdom") {
        const { data: pastAssignments, error: historyError } = await db
          .from("assignments")
          .select("word,role")
          .eq("room_id", room.id);
        if (historyError) throw historyError;
        (pastAssignments || []).forEach((assignment: any) => {
          if (assignment.role === "king") usedTopics.add(assignment.word);
          else if (assignment.word) used.add(assignment.word);
        });
      } else {
        const { data: past, error: historyError } = await db
          .from("round_results")
          .select("result")
          .eq("room_id", room.id);
        if (historyError) throw historyError;
        (past || []).forEach((r: any) => {
          if (r.result?.civilianWord) used.add(r.result.civilianWord);
          if (r.result?.liarWord) used.add(r.result.liarWord);
        });
        if (room.word_a) used.add(room.word_a);
        if (room.word_b) used.add(room.word_b);
      }
      const pair =
        room.game_mode === "undercover"
          ? pickPair(room.word_categories || DEFAULT_WORD_CATEGORIES, used)
          : null;

      const round = room.round + 1;
      const shuffled = shuffle(list);
      const liars = new Set<string>();
      if (room.mode === "teams") {
        for (const team of ["A", "B"])
          shuffled
            .filter((p: any) => p.team === team)
            .slice(0, room.imposter_count)
            .forEach((p: any) => liars.add(p.id));
      } else {
        shuffled
          .slice(0, room.imposter_count)
          .forEach((p: any) => liars.add(p.id));
      }

      // Claim the phase first so a double-tap on "Start" can't create two rounds.
      const claimed = await transition(db, room, "lobby", "clues", {
        round,
        word_a: pair?.civilian || null,
        word_b: pair?.liar || null,
      });
      if (!claimed) return fail("A round is already in progress.");

      if (room.game_mode === "kingdom") {
        await db
          .from("players")
          .update({ kingdom_choice: null })
          .eq("room_id", room.id);
      }

      let rows: any[];
      if (room.game_mode === "kingdom") {
        const kingdomIds = KINGDOM_IDS.slice(0, kingdomCount);
        const teams: Record<string, any[]> = {};
        const topicsByTeam: Record<
          string,
          ReturnType<typeof pickKingdomTopics>[number]
        > = {};
        const selectedTopics = pickKingdomTopics(
          kingdomCount,
          usedTopics,
          used,
        );
        kingdomIds.forEach((id, index) => {
          teams[id] = shuffle(
            list.filter((person: any) => person.kingdom_team === id),
          );
          topicsByTeam[id] = selectedTopics[index];
        });
        rows = kingdomIds.flatMap((team) => {
          const kingdomPlayers = teams[team];
          const topic = topicsByTeam[team];
          const roleByPlayer = new Map<string, KingdomRole>();
          let index = 0;
          roleByPlayer.set(kingdomPlayers[index++].id, "king");
          for (let count = 0; count < kingdomRoleCounts.assassin; count++)
            roleByPlayer.set(kingdomPlayers[index++].id, "assassin");
          for (let count = 0; count < kingdomRoleCounts.joker; count++)
            roleByPlayer.set(kingdomPlayers[index++].id, "joker");

          return kingdomPlayers.map((player: any) => {
            const role = roleByPlayer.get(player.id) || "citizen";
            const opposingTeams = kingdomIds.filter((id) => id !== team);
            const targetTeam =
              role === "joker"
                ? shuffle(opposingTeams)[0]
                : null;
            const targetTopic = targetTeam
              ? topicsByTeam[targetTeam]
              : null;
            return {
              room_id: room.id,
              player_id: player.id,
              round,
              word:
                role === "king"
                  ? topic.topic.title
                  : role === "joker"
                    ? ""
                    : topic.word,
              is_imposter: false,
              role,
              kingdom_team: team,
              target_team: targetTeam,
              hint: role === "joker" ? targetTopic?.topic.hint : null,
            };
          });
        });
      } else {
        rows = list.map((p: any) => ({
          room_id: room.id,
          player_id: p.id,
          round,
          word: liars.has(p.id) ? pair!.liar : pair!.civilian,
          is_imposter: liars.has(p.id),
        }));
      }

      const { error: ae } = await db.from("assignments").insert(rows);
      if (ae) {
        await db
          .from("rooms")
          .update({
            status: "lobby",
            round: room.round,
            phase_started_at: nowIso(),
          })
          .eq("id", room.id);
        throw ae;
      }
      return NextResponse.json({ ok: true, round });
    }

    if (action === "begin-vote") {
      if (!(await transition(db, room, "clues", "voting")))
        return fail("Voting can only start during the clue phase.");
      return NextResponse.json({ ok: true });
    }

    if (action === "reveal") {
      if (room.status !== "voting")
        return fail("Results can only be revealed during voting.");
      const { data: assignments, error: assignmentError } = await db
        .from("assignments")
        .select(
          "player_id,word,is_imposter,role,kingdom_team,hint,target_team",
        )
        .eq("room_id", room.id)
        .eq("round", room.round);
      if (assignmentError) throw assignmentError;
      const { data: votes, error: voteError } = await db
        .from("votes")
        .select("voter_id,target_id")
        .eq("room_id", room.id)
        .eq("round", room.round);
      if (voteError) throw voteError;
      const { data: people, error: playerError } = await db
        .from("players")
        .select("id,name,team,kingdom_choice")
        .eq("room_id", room.id);
      if (playerError) throw playerError;
      const ppl = people || [];
      const vs = votes || [];

      if (room.game_mode === "kingdom") {
        const roleByPlayer = new Map(
          (assignments || []).map((assignment: any) => [
            assignment.player_id,
            assignment,
          ]),
        );
        const playerById = new Map(ppl.map((person: any) => [person.id, person]));
        const guessByAssassin = new Map(
          vs.map((vote: any) => [vote.voter_id, vote.target_id]),
        );
        const kingdoms = KINGDOM_IDS.slice(0, room.kingdom_count || 2).map(
          (team) => {
            const teamAssignments = (assignments || []).filter(
              (assignment: any) => assignment.kingdom_team === team,
            );
            const kingAssignment = teamAssignments.find(
              (assignment: any) => assignment.role === "king",
            );
            const king = kingAssignment
              ? playerById.get(kingAssignment.player_id)
              : null;
            return {
              team,
              name: KINGDOM_TEAMS.find((kingdom) => kingdom.id === team)?.name,
              topic: kingAssignment?.word || null,
              word:
                teamAssignments.find(
                  (assignment: any) =>
                    assignment.role === "citizen" ||
                    assignment.role === "assassin",
                )?.word || null,
              king: king?.name || null,
              members: teamAssignments
                .map((assignment: any) =>
                  playerById.get(assignment.player_id),
                )
                .filter(Boolean)
                .map((person: any) => person.name),
            };
          },
        );
        const assassinGuesses = vs
          .filter(
            (vote: any) =>
              roleByPlayer.get(vote.voter_id)?.role === "assassin",
          )
          .map((vote: any) => {
            const assassin = roleByPlayer.get(vote.voter_id);
            const target = roleByPlayer.get(vote.target_id);
            return {
              assassin: playerById.get(vote.voter_id)?.name || "Assassin",
              target: playerById.get(vote.target_id)?.name || "Unknown",
              correct:
                target?.role === "king" &&
                target.kingdom_team !== assassin?.kingdom_team,
            };
          });
        const jokerResults = (assignments || [])
          .filter((assignment: any) => assignment.role === "joker")
          .map((assignment: any) => ({
            name:
              playerById.get(assignment.player_id)?.name || "Joker",
            team: assignment.kingdom_team,
            targetTeam: assignment.target_team,
            selectedTeam:
              playerById.get(assignment.player_id)?.kingdom_choice || null,
            success:
              playerById.get(assignment.player_id)?.kingdom_choice ===
              assignment.target_team,
          }));
        const points = ppl.map((person: any) => {
          const assignment = roleByPlayer.get(person.id);
          let score = 0;
          const notes: string[] = [];
          if (assignment?.role === "joker") {
            if (person.kingdom_choice === assignment.target_team) {
              score += KINGDOM_SCORING.jokerInfiltrates;
              notes.push("Infiltrated the target kingdom");
            }
          }
          const guessedKing = guessByAssassin.get(person.id);
          if (assignment?.role === "assassin" && guessedKing) {
            const target = roleByPlayer.get(guessedKing);
            if (
              target?.role === "king" &&
              target.kingdom_team !== assignment.kingdom_team
            ) {
              score += KINGDOM_SCORING.assassinFindsKing;
              notes.push("Found the opposing King");
            }
          }
          return {
            id: person.id,
            name: person.name,
            team: null,
            role: assignment?.role || "citizen",
            rolePoints: score,
            placementPoints: 0,
            points: score,
            roleNote: notes.join(" · "),
            note: notes.join(" · "),
          };
        });
        const result = {
          gameMode: "kingdom",
          placementVersion: 0,
          kingdoms,
          roles: (assignments || []).map((assignment: any) => ({
            playerId: assignment.player_id,
            name:
              playerById.get(assignment.player_id)?.name || "Player",
            team: assignment.kingdom_team,
            role: assignment.role,
            word: assignment.word,
            hint: assignment.hint,
            targetTeam: assignment.target_team,
          })),
          assassinGuesses,
          jokerResults,
          placements: ppl.map((person: any) => ({
            playerId: person.id,
            name: person.name,
            team: roleByPlayer.get(person.id)?.kingdom_team || null,
            correct: null,
          })),
          points,
        };
        const { error: resultError } = await db
          .from("round_results")
          .upsert(
            { room_id: room.id, round: room.round, result },
            { onConflict: "room_id,round" },
          );
        if (resultError) throw resultError;
        if (!(await transition(db, room, "voting", "revealed")))
          return fail("The round changed before the results could be revealed.");
        return NextResponse.json({ ok: true });
      }

      const liarIds = new Set(
        (assignments || [])
          .filter((a: any) => a.is_imposter)
          .map((a: any) => a.player_id),
      );

      const tally: Record<string, number> = {};
      vs.forEach((v: any) => {
        tally[v.target_id] = (tally[v.target_id] || 0) + 1;
      });
      const max = Math.max(0, ...Object.values(tally));
      const mostVoted =
        max > 0 ? Object.keys(tally).filter((k) => tally[k] === max) : [];
      const caught = mostVoted.length === 1 && liarIds.has(mostVoted[0]);

      // Scoring is provisional when a liar is caught, until the host judges their word guess.
      const points = ppl.map((p: any) => {
        const isLiar = liarIds.has(p.id);
        let pts = 0;
        const notes: string[] = [];
        if (isLiar) {
          if (!caught) {
            pts += 3;
            notes.push("Escaped");
          } else if (mostVoted[0] !== p.id) {
            pts += 1;
            notes.push("Stayed hidden");
          }
        } else {
          if (caught) {
            pts += 2;
            notes.push("Liar caught");
          }
          const v = vs.find((x: any) => x.voter_id === p.id);
          if (v && liarIds.has(v.target_id)) {
            pts += 1;
            notes.push("Sharp eye");
          }
        }
        return {
          id: p.id,
          name: p.name,
          team: p.team,
          role: isLiar ? "liar" : "truth",
          points: pts,
          note: notes.join(" · "),
        };
      });

      const result = {
        caught,
        noVotes: max === 0,
        mostVoted,
        voteCount: max,
        caughtLiarId: caught ? mostVoted[0] : null,
        guessStatus: caught ? "pending" : "not_needed",
        guessText: null,
        guessCorrect: null,
        civilianWord: room.word_a,
        liarWord: room.word_b,
        liars: ppl
          .filter((p: any) => liarIds.has(p.id))
          .map((p: any) => ({ id: p.id, name: p.name, team: p.team })),
        tally: ppl
          .filter((p: any) => tally[p.id])
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            votes: tally[p.id],
            liar: liarIds.has(p.id),
          }))
          .sort((a: any, b: any) => b.votes - a.votes),
        points,
      };
      const { error: re } = await db
        .from("round_results")
        .upsert(
          { room_id: room.id, round: room.round, result },
          { onConflict: "room_id,round" },
        );
      if (re) throw re;
      await transition(db, room, "voting", "revealed");
      return NextResponse.json({ ok: true });
    }

    if (action === "next") {
      const { data: current, error: readError } = await db
        .from("round_results")
        .select("result")
        .eq("room_id", room.id)
        .eq("round", room.round)
        .maybeSingle();
      if (readError) throw readError;
      if (
        room.game_mode === "kingdom" &&
        Array.isArray(current?.result?.placements) &&
        current.result.placements.some(
          (placement: any) => typeof placement.correct !== "boolean",
        )
      ) {
        return fail("The host must review every player's placement before the next round.");
      }
      if (
        current?.result?.guessStatus === "pending" ||
        current?.result?.guessStatus === "submitted"
      ) {
        return fail(
          "The caught player must submit a guess and the host must judge it before the next round.",
        );
      }
      if (!(await transition(db, room, "revealed", "lobby")))
        return fail("The round has not been revealed yet.");
      return NextResponse.json({ ok: true });
    }

    if (action === "judge-placement") {
      if (room.game_mode !== "kingdom")
        return fail("Placement scoring is only available in Secret Kingdom.");
      if (room.status !== "revealed")
        return fail("Placements can only be scored after the reveal.");
      if (!isHost)
        return fail("Only the host can score player placements.", 403);
      if (typeof data.correct !== "boolean")
        return fail("Choose whether the player was correctly placed.");

      const playerId = String(data.playerId || "");
      if (!playerId) return fail("Choose a player to score.");

      const { data: current, error: readError } = await db
        .from("round_results")
        .select("result")
        .eq("room_id", room.id)
        .eq("round", room.round)
        .maybeSingle();
      if (readError) throw readError;
      const placements = current?.result?.placements;
      if (!current || !Array.isArray(placements))
        return fail("This round has no placement review data.");
      if (!placements.some((placement: any) => placement.playerId === playerId))
        return fail("That player was not part of this round.");

      const nextPlacements = placements.map((placement: any) =>
        placement.playerId === playerId
          ? { ...placement, correct: data.correct }
          : placement,
      );
      const placementVersion = Number.isSafeInteger(
        current.result.placementVersion,
      )
        ? current.result.placementVersion
        : 0;
      const correctByPlayer = new Map(
        nextPlacements.map((placement: any) => [
          placement.playerId,
          placement.correct,
        ]),
      );
      const points = (current.result.points || []).map((point: any) => {
        const rolePoints =
          typeof point.rolePoints === "number"
            ? point.rolePoints
            : point.points || 0;
        const correctPlacement =
          correctByPlayer.get(point.id) === true;
        const placementPoints = correctPlacement
          ? KINGDOM_SCORING.correctPlacement
          : 0;
        const placementNote =
          correctByPlayer.get(point.id) === null
            ? ""
            : correctPlacement
              ? "Correct placement"
              : "Incorrect placement";
        const note = [point.roleNote, placementNote].filter(Boolean).join(" · ");
        return {
          ...point,
          rolePoints,
          placementPoints,
          points: rolePoints + placementPoints,
          note,
        };
      });
      const result = {
        ...current.result,
        placementVersion: placementVersion + 1,
        placements: nextPlacements,
        points,
      };
      const { data: updated, error: updateError } = await db
        .from("round_results")
        .update({ result })
        .eq("room_id", room.id)
        .eq("round", room.round)
        .eq("result->>gameMode", "kingdom")
        .eq("result->>placementVersion", String(placementVersion))
        .select("round");
      if (updateError) throw updateError;
      if (!updated?.length)
        return fail("The placement scores changed. Refresh and try again.");
      return NextResponse.json({ ok: true });
    }

    // ───────────────────────── kingdom choice ─────────────────────────
    if (action === "kingdom-choice") {
      if (room.game_mode !== "kingdom")
        return fail("Kingdom choices are only available in Secret Kingdom.");
      if (room.status !== "voting")
        return fail("Kingdom choices can only be made during voting.");
      if (!player) return fail("Only a player can choose a kingdom.", 403);
      const { data: assignment, error: assignmentError } = await db
        .from("assignments")
        .select("role")
        .eq("room_id", room.id)
        .eq("player_id", player.id)
        .eq("round", room.round)
        .maybeSingle();
      if (assignmentError) throw assignmentError;
      if (assignment?.role !== "joker")
        return fail("Only a Joker can choose an infiltration target.", 403);
      const kingdomCount = room.kingdom_count || 2;
      const validTeams = ["A", "B", "C", "D"].slice(0, kingdomCount);
      const choice = validTeams.includes(data.team) ? data.team : null;
      if (!choice) return fail("Choose a kingdom shown on your screen.");
      const { data: updated, error: choiceError } = await db
        .from("players")
        .update({ kingdom_choice: choice })
        .eq("id", player.id)
        .eq("room_id", room.id)
        .is("kingdom_choice", null)
        .select("id")
        .maybeSingle();
      if (choiceError) throw choiceError;
      if (!updated) return fail("Your kingdom choice is already locked.");
      return NextResponse.json({ ok: true });
    }

    // ───────────────────────── kingdom assassin target ─────────────────────────
    if (action === "kingdom-assassin-target") {
      if (room.game_mode !== "kingdom")
        return fail("Assassin targets are only available in Secret Kingdom.");
      if (room.status !== "voting")
        return fail("Assassin targets can only be chosen during voting.");
      if (!player) return fail("Only a player can identify a King.", 403);

      const { data: assassinAssignment } = await db
        .from("assignments")
        .select("role,kingdom_team")
        .eq("room_id", room.id)
        .eq("player_id", player.id)
        .eq("round", room.round)
        .maybeSingle();
      if (assassinAssignment?.role !== "assassin")
        return fail("Only an Assassin can identify a King.", 403);

      const targetId = String(data.targetId || "");
      const { data: targetPlayer } = await db
        .from("players")
        .select("id")
        .eq("room_id", room.id)
        .eq("id", targetId)
        .maybeSingle();
      if (!targetPlayer) return fail("Choose a valid player.");

      const { data: targetAssignment } = await db
        .from("assignments")
        .select("player_id")
        .eq("room_id", room.id)
        .eq("player_id", targetId)
        .eq("round", room.round)
        .maybeSingle();
      if (!targetAssignment || targetId === player.id)
        return fail("Choose another player to make your Assassin guess.");

      const { data: existingGuess, error: guessReadError } = await db
        .from("votes")
        .select("id")
        .eq("room_id", room.id)
        .eq("round", room.round)
        .eq("voter_id", player.id)
        .maybeSingle();
      if (guessReadError) throw guessReadError;
      if (existingGuess)
        return fail("Your Assassin guess is already locked.");
      const { error: guessError } = await db.from("votes").insert({
        room_id: room.id,
        round: room.round,
        voter_id: player.id,
        target_id: targetId,
      });
      if (guessError) {
        if ((guessError as any).code === "23505")
          return fail("Your Assassin guess is already locked.");
        throw guessError;
      }
      return NextResponse.json({ ok: true });
    }

    return fail("Unknown action.");
  } catch (e: any) {
    console.error(e);
    return fail(e?.message || "Unexpected server error.", 500);
  }
}

// ───────────────────────── vote ─────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const data = await body(req);
    const db = adminDb();
    const code = String(data.code || "");
    const token = String(data.token || "");
    const { data: room } = await db
      .from("rooms")
      .select("id,round,status")
      .eq("code", code)
      .maybeSingle();
    if (!room) return fail("Room not found.", 404);
    const { data: player } = await db
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("token_hash", hashToken(token))
      .maybeSingle();
    if (!player) return fail("You are not a player in this room.", 401);
    if (room.status !== "voting") return fail("Voting is not open.");
    const target = String(data.targetId || "");
    if (!target || target === player.id) return fail("Choose another player.");
    const { data: targetPlayer } = await db
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("id", target)
      .maybeSingle();
    if (!targetPlayer) return fail("That player is no longer in the room.");
    const { data: existing } = await db
      .from("votes")
      .select("id")
      .eq("room_id", room.id)
      .eq("round", room.round)
      .eq("voter_id", player.id)
      .maybeSingle();
    if (existing) return fail("Your vote has already been submitted.");
    const { error } = await db.from("votes").insert({
      room_id: room.id,
      round: room.round,
      voter_id: player.id,
      target_id: target,
    });
    if (error) {
      if ((error as any).code === "23505")
        return fail("Your vote has already been submitted.");
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return fail(e?.message || "Unable to submit vote.", 500);
  }
}
