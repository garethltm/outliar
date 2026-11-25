export const KINGDOM_IDS = ["A", "B", "C", "D"] as const;
export type KingdomId = (typeof KINGDOM_IDS)[number];

export const KINGDOM_TEAMS = [
  {
    id: "A",
    name: "Crimson",
    text: "text-rose-300",
    border: "border-rose-400/50",
    background: "bg-rose-500/10",
  },
  {
    id: "B",
    name: "Azure",
    text: "text-sky-300",
    border: "border-sky-400/50",
    background: "bg-sky-500/10",
  },
  {
    id: "C",
    name: "Emerald",
    text: "text-emerald-300",
    border: "border-emerald-400/50",
    background: "bg-emerald-500/10",
  },
  {
    id: "D",
    name: "Amethyst",
    text: "text-violet-300",
    border: "border-violet-400/50",
    background: "bg-violet-500/10",
  },
] as const;

export function kingdomTeam(team: string | null | undefined) {
  return KINGDOM_TEAMS.find((kingdom) => kingdom.id === team) ?? null;
}

export const KINGDOM_ROLES = {
  king: {
    label: "King",
    icon: "👑",
    description: "You alone know your kingdom's hidden topic.",
  },
  assassin: {
    label: "Assassin",
    icon: "🗡️",
    description: "You have a normal word. Identify the King of an opposing kingdom.",
  },
  joker: {
    label: "Joker",
    icon: "🃏",
    description: "Use your hint to choose a word and infiltrate your target kingdom.",
  },
  citizen: {
    label: "Citizen",
    icon: "🛡️",
    description: "Your word belongs to your kingdom's hidden topic.",
  },
} as const;

export type KingdomRole = keyof typeof KINGDOM_ROLES;
export const CONFIGURABLE_KINGDOM_ROLES = ["assassin", "joker"] as const;
export type ConfigurableKingdomRole =
  (typeof CONFIGURABLE_KINGDOM_ROLES)[number];
export type KingdomRoleCounts = Record<ConfigurableKingdomRole, number>;

export const DEFAULT_KINGDOM_ROLE_COUNTS: KingdomRoleCounts = {
  assassin: 1,
  joker: 1,
};

export const MAX_KINGDOM_ROLE_COUNT = 5;

export const KINGDOM_ROUNDS = [
  { name: "Warm-up", rule: "Description only" },
  { name: "Mixed Signals", rule: "Gestures + one word" },
  { name: "One Word Challenge", rule: "One word only" },
  { name: "Silent Kingdom", rule: "Gestures only" },
] as const;

export const KINGDOM_SCORING = {
  correctKingdomChoice: 1,
  assassinFindsKing: 2,
  jokerInfiltrates: 2,
} as const;

export function kingdomRoundName(round: number) {
  return KINGDOM_ROUNDS[(round - 1) % KINGDOM_ROUNDS.length];
}
