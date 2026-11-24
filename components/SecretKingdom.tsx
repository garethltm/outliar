"use client";

const roles = [
  {
    icon: "👑",
    name: "King",
    text: "Blend in with your citizens, identify them, and gather everyone into your kingdom. Watch for the opposing Assassin.",
  },
  {
    icon: "🗡️",
    name: "Assassin",
    text: "Identify the opposing kingdom’s King. Successfully identifying them earns your kingdom bonus points.",
  },
  {
    icon: "🃏",
    name: "Joker",
    text: "Infiltrate the opposing kingdom using a hint about their topic. Create a fitting word and avoid discovery.",
  },
  {
    icon: "🛡️",
    name: "Citizen",
    text: "Find your King and help them identify you. Describe or act out your assigned word without revealing the kingdom.",
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
      <summary className="font-bold text-amber">
        Bonus: Secret Kingdom ▾
      </summary>
      <div className="mt-4 space-y-5 text-sm">
        <p className="muted">
          Find and stand with the correct kingdom when each round ends. Your
          team colour appears on your card, but hidden roles and misleading
          behaviour make every choice uncertain.
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
              Everyone chooses their believed kingdom and forms a separate line.
            </li>
            <li>The Kings and Assassins are revealed.</li>
            <li>The Joker&apos;s infiltration success is checked.</li>
            <li>Bonus points are awarded.</li>
          </ol>
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

        <section>
          <div className="eyebrow mb-3">Bonus points</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="chip text-center">
              <b className="text-truth">+1</b>
              <div className="muted text-xs mt-1">
                Each correctly identified citizen
              </div>
            </div>
            <div className="chip text-center">
              <b className="text-truth">+2</b>
              <div className="muted text-xs mt-1">Assassin finds the King</div>
            </div>
            <div className="chip text-center">
              <b className="text-amber">+2</b>
              <div className="muted text-xs mt-1">
                Joker successfully infiltrates
              </div>
            </div>
          </div>
          <p className="muted text-xs mt-2">
            If an Assassin identifies the opposing King, the identified King
            loses 2 points.
          </p>
        </section>
      </div>
    </details>
  );
}
