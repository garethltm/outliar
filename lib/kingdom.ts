export type KingdomRole = "king" | "assassin" | "joker" | "citizen";

export const KINGDOM_ROLES: Record<
  KingdomRole,
  { label: string; icon: string; description: string }
> = {
  king: {
    label: "King",
    icon: "👑",
    description: "Blend in and gather your citizens.",
  },
  assassin: {
    label: "Assassin",
    icon: "🗡️",
    description: "Identify the opposing kingdom’s King.",
  },
  joker: {
    label: "Joker",
    icon: "🃏",
    description: "Infiltrate the opposing kingdom.",
  },
  citizen: {
    label: "Citizen",
    icon: "🛡️",
    description: "Find your King and support your kingdom.",
  },
};

export const KINGDOM_ROUNDS = [
  { name: "Warm-up", rule: "Description only" },
  { name: "Mixed Signals", rule: "Gestures + one word" },
  { name: "One Word Challenge", rule: "One word only" },
  { name: "Silent Kingdom", rule: "Gestures only" },
] as const;

export function kingdomRoundName(round: number) {
  return KINGDOM_ROUNDS[(round - 1) % KINGDOM_ROUNDS.length];
}
