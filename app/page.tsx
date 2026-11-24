"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/Logo";
import { Credit } from "@/components/Credit";
import { api, loadName, saveName, saveSession } from "@/lib/api";
import { minimumPlayers } from "@/lib/rules";
import {
  DEFAULT_WORD_CATEGORIES,
  WORD_CATEGORIES,
  type WordCategory,
} from "@/lib/word-categories";
import { SecretKingdom } from "@/components/SecretKingdom";
import { KINGDOM_IDS } from "@/lib/kingdom";

const CATEGORY_GROUPS = [
  { id: "everyday", label: "Everyday topics" },
  { id: "bible", label: "Bible topics" },
  { id: "wildcard", label: "Wildcard topics" },
] as const;

export default function Home() {
  const router = useRouter();
  const [gameMode, setGameMode] = useState<"undercover" | "kingdom">(
    "undercover",
  );
  const [kingdomCount, setKingdomCount] = useState(2);
  const [mode, setMode] = useState<"individual" | "teams">("individual");
  const [maxPlayers, setMaxPlayers] = useState("16");
  const [liars, setLiars] = useState(1);
  const [wordCategories, setWordCategories] = useState<WordCategory[]>(
    DEFAULT_WORD_CATEGORIES,
  );
  const [liarsKnow, setLiarsKnow] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const minPlayers =
    gameMode === "kingdom" ? kingdomCount * 4 : minimumPlayers(mode, liars);
  const playerLimit = Number(maxPlayers);
  const validPlayerLimit =
    Number.isInteger(playerLimit) &&
    playerLimit >= minPlayers &&
    playerLimit <= 30;
  const validWordCategories = wordCategories.length > 0;

  function toggleWordCategory(category: WordCategory) {
    setWordCategories((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category],
    );
  }

  function toggleCategoryGroup(group: (typeof CATEGORY_GROUPS)[number]["id"]) {
    const categoryIds = WORD_CATEGORIES.filter(
      (category) => category.group === group,
    ).map((category) => category.id);
    const categorySet = new Set<WordCategory>(categoryIds);
    const allSelected = categoryIds.every((category) =>
      wordCategories.includes(category),
    );
    setWordCategories((selected) =>
      allSelected
        ? selected.filter((category) => !categorySet.has(category))
        : [...new Set([...selected, ...categoryIds])],
    );
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("join");
    if (invite) setCode(invite.replace(/\D/g, "").slice(0, 6));
    if (params.get("notice") === "closed")
      setNotice("That room has closed, or you were removed from it.");
    setName(loadName());
  }, []);

  async function send(payload: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const d = await api("POST", payload);
      if (payload.action === "join") saveName(String(payload.name));
      saveSession({
        code: d.room.code,
        token: d.token,
        role: d.role,
        playerId: d.player?.id || null,
        name: d.player?.name || "Host",
      });
      router.push("/room/" + d.room.code);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-9">
          <LogoMark size={92} animate className="mx-auto mb-3" />
          <h1>
            <Wordmark className="text-6xl md:text-7xl" />
          </h1>
          <p className="muted mt-3 text-lg">
            Blend in. Choose your allegiance.
          </p>
          <p className="eyebrow mt-3">The social deduction party game</p>
        </header>

        {notice && (
          <p role="status" className="text-center text-amber mb-5 text-sm">
            {notice}
          </p>
        )}

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
          <section className="panel min-w-0 p-5 sm:p-6">
            <div className="eyebrow mb-2">Host a game</div>
            <h2 className="text-2xl font-bold mb-5">Create a room</h2>

            <fieldset className="mb-5">
              <legend className="text-sm muted">Choose a game mode</legend>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  aria-pressed={gameMode === "undercover"}
                  onClick={() => setGameMode("undercover")}
                  className={`btn-ghost flex flex-col items-start gap-1 !px-4 !py-3 text-left ${gameMode === "undercover" ? "on" : ""}`}
                >
                  <span className="font-bold">Undercover</span>
                  <span className="muted text-xs leading-relaxed">
                    Find the liar with secret, similar words.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={gameMode === "kingdom"}
                  onClick={() => setGameMode("kingdom")}
                  className={`btn-ghost flex flex-col items-start gap-1 !px-4 !py-3 text-left ${gameMode === "kingdom" ? "on" : ""}`}
                >
                  <span className="font-bold">Secret Kingdom</span>
                  <span className="muted text-xs leading-relaxed">
                    Roles, multiple kingdoms, clues and infiltration.
                  </span>
                </button>
              </div>
            </fieldset>

            {gameMode === "undercover" && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor="max" className="text-sm muted">
                    Player limit
                  </label>
                  <input
                    id="max"
                    type="number"
                    className="field mt-2"
                    min={minPlayers}
                    max={30}
                    step={1}
                    inputMode="numeric"
                    value={maxPlayers}
                    aria-invalid={!validPlayerLimit}
                    aria-describedby={
                      !validPlayerLimit ? "player-limit-error" : undefined
                    }
                    onChange={(e) => setMaxPlayers(e.target.value)}
                  />
                  {!validPlayerLimit && (
                    <p
                      id="player-limit-error"
                      className="text-red-300 text-xs mt-1"
                    >
                      Enter a whole number from {minPlayers} to 30.
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="liars" className="text-sm muted">
                    Liars{mode === "teams" ? " / team" : ""}
                  </label>
                  <select
                    id="liars"
                    className="field mt-2"
                    value={liars}
                    onChange={(e) => setLiars(Number(e.target.value))}
                  >
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {gameMode === "kingdom" && (
              <>
                <fieldset className="mb-5">
                  <legend className="text-sm muted">Number of kingdoms</legend>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        aria-pressed={kingdomCount === count}
                        onClick={() => setKingdomCount(count)}
                        className={`btn-ghost text-center ${kingdomCount === count ? "on" : ""}`}
                      >
                        <b>{count}</b>
                        <span className="muted block text-xs">kingdoms</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="mb-5">
                  <label htmlFor="kingdom-max" className="text-sm muted">
                    Player limit
                  </label>
                  <input
                    id="kingdom-max"
                    type="number"
                    className="field mt-2"
                    min={kingdomCount * 4}
                    max={30}
                    step={1}
                    inputMode="numeric"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                  />
                  {!validPlayerLimit && (
                    <p className="text-red-300 text-xs mt-1">
                      Enter a whole number from {kingdomCount * 4} to 30.
                    </p>
                  )}
                </div>
              </>
            )}

            <fieldset className="mb-5">
              <legend className="text-sm muted">Choose word categories</legend>
              <p className="muted text-xs mt-1">
                Words are drawn from all selected topics.
              </p>
              <div className="space-y-3 mt-3">
                {CATEGORY_GROUPS.map(({ id: group, label }) => {
                  const categories = WORD_CATEGORIES.filter(
                    (category) => category.group === group,
                  );
                  const selectedCount = categories.filter((category) =>
                    wordCategories.includes(category.id),
                  ).length;
                  const allSelected = selectedCount === categories.length;
                  return (
                    <section
                      key={group}
                      className="rounded-2xl border border-[#272a40] bg-[#0b0c15] p-3"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-sm font-bold">
                          {label}
                          <span className="muted font-normal ml-2">
                            {selectedCount}/{categories.length}
                          </span>
                        </h3>
                        <button
                          type="button"
                          className="text-xs text-[#ff8a9b] hover:text-white"
                          onClick={() => toggleCategoryGroup(group)}
                        >
                          {allSelected ? "Clear all" : "Select all"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map(({ id, label: categoryLabel }) => (
                          <label
                            key={id}
                            className={`btn-ghost flex items-center gap-2 !px-3 !py-2 text-xs cursor-pointer ${wordCategories.includes(id) ? "on" : ""}`}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 shrink-0 accent-[#ff3d5a]"
                              checked={wordCategories.includes(id)}
                              onChange={() => toggleWordCategory(id)}
                            />
                            <span>{categoryLabel}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
              {!validWordCategories && (
                <p role="alert" className="text-red-300 text-xs mt-2">
                  Select at least one word category.
                </p>
              )}
            </fieldset>

            <button
              className="btn w-full"
              disabled={busy || !validPlayerLimit || !validWordCategories}
              onClick={() =>
                send({
                  action: "create",
                  gameMode,
                  kingdomCount,
                  mode: gameMode === "kingdom" ? "teams" : mode,
                  maxPlayers: playerLimit,
                  imposters: gameMode === "kingdom" ? 1 : liars,
                  wordCategories,
                  liarsKnow,
                })
              }
            >
              {busy ? "Creating…" : "Create game room"}
            </button>
          </section>

          <section className="panel min-w-0 p-5 sm:p-6">
            <div className="eyebrow mb-2">Join a game</div>
            <h2 className="text-2xl font-bold mb-5">Enter the room</h2>

            <label htmlFor="nick" className="text-sm muted">
              Your nickname
            </label>
            <input
              id="nick"
              className="field mt-2 mb-4"
              maxLength={20}
              placeholder="e.g. Alex"
              autoComplete="nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="code" className="text-sm muted">
              6-digit room code
            </label>
            <input
              id="code"
              className="field mt-2 mb-5 tracking-widest text-lg"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />

            <button
              className="btn w-full"
              disabled={busy || !name.trim() || code.length !== 6}
              onClick={() => send({ action: "join", name, code })}
            >
              {busy ? "Joining…" : "Join game"}
            </button>

            {gameMode === "undercover" ? (
              <details className="mt-6 text-sm">
                <summary className="font-bold text-[#ff8a9b]">
                  How to play Undercover ▾
                </summary>
                <ol className="muted mt-3 space-y-2 list-decimal pl-5">
                  <li>
                    Everyone gets a secret word on their phone. Most people
                    share the <b className="text-white">same</b> word — the liar
                    gets a <b className="text-white">similar but different</b>{" "}
                    one.
                  </li>
                  <li>
                    Take turns giving one short clue about your word. Never say
                    the word itself.
                  </li>
                  <li>
                    Listen for the clue that doesn&apos;t quite fit, then vote
                    for who you think the liar is.
                  </li>
                  <li>
                    Most votes wins the round. A tie means the liar escapes.
                  </li>
                  <li>
                    <b className="text-white">Points:</b> truth-tellers +2 for
                    catching a liar (+1 for voting right). If caught, a liar can
                    guess the shared word: the host judges it, and a correct
                    guess gives the liar +3 while everyone else scores 0. A
                    wrong guess keeps the normal points. Liars get +3 for
                    escaping.
                  </li>
                </ol>
              </details>
            ) : null}
            {gameMode === "kingdom" && <SecretKingdom />}
          </section>
        </div>

        {error && (
          <p role="alert" className="text-red-300 text-center mt-5">
            {error}
          </p>
        )}
        <p className="text-center muted text-xs mt-8">
          No app download required · Works on phones, tablets and laptops
        </p>
        <Credit className="mt-3" />
      </div>
    </main>
  );
}
