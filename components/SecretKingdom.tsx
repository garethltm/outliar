"use client";

const roles = [
  {
    icon: "👑",
    name: "King",
    text: "The only player who knows their kingdom's secret topic. Give clues that help your citizens recognize the right word.",
  },
  {
    icon: "🗡️",
    name: "Assassin",
    text: "You receive your kingdom's normal word. Make one guess at which player is the King of another kingdom.",
  },
  {
    icon: "🃏",
    name: "Joker",
    text: "You receive a hint about an opposing kingdom's topic, but no assigned word. Choose a fitting word and try to infiltrate that kingdom.",
  },
  {
    icon: "🛡️",
    name: "Citizen",
    text: "You receive a word related to your King's secret topic. Use it to find your King without revealing your kingdom.",
  },
] as const;

const rounds = [
  {
    number: 1,
    name: "Warm-up",
    rule: "Description only",
    detail:
      "Describe verbally. No gestures, movement or saying the assigned word.",
  },
  {
    number: 2,
    name: "Mixed Signals",
    rule: "Gestures + one word",
    detail: "Use gestures and body movement, but say only one word.",
  },
  {
    number: 3,
    name: "One Word Challenge",
    rule: "One word only",
    detail: "Say exactly one word. Do not say the assigned word.",
  },
  {
    number: 4,
    name: "Silent Kingdom",
    rule: "Gestures only",
    detail:
      "No talking or whispering. Use facial expressions and body movements only.",
  },
] as const;

export function SecretKingdom() {
  return (
    <details className="mt-6 text-sm">
      <summary className="font-bold text-amber">Secret Kingdom rules ▾</summary>
      <div className="mt-4 space-y-5 text-sm">
        <p className="muted">
          Players are assigned to a named, color-coded kingdom when they join,
          and keep that kingdom between rounds. Each kingdom has its own related
          topic and word. Only its King knows the topic; citizens and Assassins
          receive a related word. The host can set how many Assassins and Jokers
          are assigned to each kingdom; remaining players become Citizens.
        </p>

        <div className="rounded-2xl border border-amber/30 bg-amber/5 p-4">
          <div className="eyebrow !text-amber mb-3">3 most important rules</div>
          <ol className="space-y-2 list-decimal pl-5">
            <li>Never show your cards.</li>
            <li>Never mention your team colour.</li>
            <li>Keep your role and assigned word secret.</li>
          </ol>
        </div>

        <section>
          <div className="eyebrow mb-3">Roles</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {roles.map((role) => (
              <article key={role.name} className="chip !p-3">
                <div className="mb-1 font-black">
                  {role.icon} {role.name}
                </div>
                <p className="muted text-xs leading-relaxed">{role.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="eyebrow mb-3">End of each round</div>
          <ol className="muted space-y-1.5 list-decimal pl-5">
            <li>
              Your assigned kingdom stays the same throughout the game.
            </li>
            <li>
              Assassins lock one guess at a player from another kingdom they
              believe is a King.
            </li>
            <li>Jokers lock their assigned target as their infiltration attempt.</li>
            <li>Kings, roles, topics, words, and mission results are revealed.</li>
          </ol>
        </section>

        <section>
          <div className="eyebrow mb-3">Scoring each round</div>
          <ul className="muted space-y-1.5 list-disc pl-5">
            <li>Everyone receives +1 participation point.</li>
            <li>Assassin correctly identifies an opposing King: +2 points.</li>
            <li>Joker chooses their assigned target kingdom: +2 points.</li>
          </ul>
        </section>

        <section>
          <div className="eyebrow mb-3">Round challenges</div>
          <div className="space-y-2">
            {rounds.map((round) => (
              <article key={round.number} className="chip !p-3">
                <div className="flex justify-between gap-3">
                  <b>
                    Round {round.number} — {round.name}
                  </b>
                  <span className="shrink-0 text-xs text-amber">
                    {round.rule}
                  </span>
                </div>
                <p className="muted mt-1 text-xs leading-relaxed">
                  {round.detail}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </details>
  );
}
