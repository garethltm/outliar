import { randomInt } from 'crypto';

export type Difficulty = 'mixed' | 'easy' | 'medium' | 'hard';
export const DIFFICULTIES: Difficulty[] = ['mixed', 'easy', 'medium', 'hard'];

type Pair = { a: string; b: string; category: string; level: 'Easy' | 'Medium' | 'Hard' };

/**
 * Each pair is "similar but not the same" — close enough that the liar can
 * bluff, different enough that a sharp listener can spot the slip.
 */
export const WORD_PAIRS: Pair[] = [
  // ── Easy ────────────────────────────────────────────────
  { a: 'BEACH', b: 'SWIMMING POOL', category: 'Places', level: 'Easy' },
  { a: 'COFFEE', b: 'TEA', category: 'Food & Drink', level: 'Easy' },
  { a: 'PIZZA', b: 'BURGER', category: 'Food & Drink', level: 'Easy' },
  { a: 'CAT', b: 'DOG', category: 'Animals', level: 'Easy' },
  { a: 'RAIN', b: 'SNOW', category: 'Nature', level: 'Easy' },
  { a: 'LION', b: 'TIGER', category: 'Animals', level: 'Easy' },
  { a: 'GUITAR', b: 'PIANO', category: 'Music', level: 'Easy' },
  { a: 'PEN', b: 'PENCIL', category: 'Objects', level: 'Easy' },
  { a: 'SOFA', b: 'ARMCHAIR', category: 'Home', level: 'Easy' },
  { a: 'BUS', b: 'TRAIN', category: 'Transport', level: 'Easy' },
  { a: 'MILK', b: 'YOGURT', category: 'Food & Drink', level: 'Easy' },
  { a: 'SOCCER', b: 'BASKETBALL', category: 'Sports', level: 'Easy' },
  { a: 'JACKET', b: 'HOODIE', category: 'Clothing', level: 'Easy' },
  { a: 'RICE', b: 'NOODLES', category: 'Food & Drink', level: 'Easy' },
  { a: 'SUN', b: 'MOON', category: 'Nature', level: 'Easy' },
  { a: 'BANANA', b: 'MANGO', category: 'Food & Drink', level: 'Easy' },
  { a: 'SHOWER', b: 'BATHTUB', category: 'Home', level: 'Easy' },
  { a: 'SPOON', b: 'FORK', category: 'Objects', level: 'Easy' },

  // ── Medium ──────────────────────────────────────────────
  { a: 'AIRPORT', b: 'TRAIN STATION', category: 'Places', level: 'Medium' },
  { a: 'HOTEL', b: 'AIRBNB', category: 'Places', level: 'Medium' },
  { a: 'BIRTHDAY', b: 'WEDDING', category: 'Events', level: 'Medium' },
  { a: 'DOCTOR', b: 'DENTIST', category: 'People', level: 'Medium' },
  { a: 'NETFLIX', b: 'YOUTUBE', category: 'Entertainment', level: 'Medium' },
  { a: 'INSTAGRAM', b: 'TIKTOK', category: 'Apps', level: 'Medium' },
  { a: 'TAXI', b: 'UBER', category: 'Transport', level: 'Medium' },
  { a: 'CINEMA', b: 'THEATRE', category: 'Entertainment', level: 'Medium' },
  { a: 'LIBRARY', b: 'BOOKSTORE', category: 'Places', level: 'Medium' },
  { a: 'SUSHI', b: 'SASHIMI', category: 'Food & Drink', level: 'Medium' },
  { a: 'ICE CREAM', b: 'GELATO', category: 'Food & Drink', level: 'Medium' },
  { a: 'LAPTOP', b: 'TABLET', category: 'Tech', level: 'Medium' },
  { a: 'CAMPING', b: 'HIKING', category: 'Outdoors', level: 'Medium' },
  { a: 'TEACHER', b: 'PROFESSOR', category: 'People', level: 'Medium' },
  { a: 'CHOCOLATE', b: 'CARAMEL', category: 'Food & Drink', level: 'Medium' },
  { a: 'WINE', b: 'BEER', category: 'Food & Drink', level: 'Medium' },
  { a: 'LAKE', b: 'RIVER', category: 'Nature', level: 'Medium' },
  { a: 'TATTOO', b: 'PIERCING', category: 'Style', level: 'Medium' },
  { a: 'SHAMPOO', b: 'BODY WASH', category: 'Home', level: 'Medium' },
  { a: 'GYM', b: 'YOGA STUDIO', category: 'Places', level: 'Medium' },
  { a: 'SMARTWATCH', b: 'FITNESS TRACKER', category: 'Tech', level: 'Medium' },
  { a: 'MARATHON', b: 'TRIATHLON', category: 'Sports', level: 'Medium' },
  { a: 'PERFUME', b: 'DEODORANT', category: 'Style', level: 'Medium' },
  { a: 'ZOO', b: 'AQUARIUM', category: 'Places', level: 'Medium' },

  // ── Hard ────────────────────────────────────────────────
  { a: 'MANAGER', b: 'TEAM LEADER', category: 'Work', level: 'Hard' },
  { a: 'PODCAST', b: 'RADIO SHOW', category: 'Entertainment', level: 'Hard' },
  { a: 'MUSEUM', b: 'ART GALLERY', category: 'Places', level: 'Hard' },
  { a: 'JOURNALIST', b: 'AUTHOR', category: 'People', level: 'Hard' },
  { a: 'SARCASM', b: 'IRONY', category: 'Ideas', level: 'Hard' },
  { a: 'JEALOUSY', b: 'ENVY', category: 'Feelings', level: 'Hard' },
  { a: 'MENTOR', b: 'COACH', category: 'People', level: 'Hard' },
  { a: 'RUMOUR', b: 'GOSSIP', category: 'Ideas', level: 'Hard' },
  { a: 'VACATION', b: 'STAYCATION', category: 'Travel', level: 'Hard' },
  { a: 'FESTIVAL', b: 'CONCERT', category: 'Events', level: 'Hard' },
  { a: 'STARTUP', b: 'SMALL BUSINESS', category: 'Work', level: 'Hard' },
  { a: 'HOBBY', b: 'HABIT', category: 'Ideas', level: 'Hard' },
  { a: 'ROOMMATE', b: 'HOUSEMATE', category: 'People', level: 'Hard' },
  { a: 'DEBATE', b: 'ARGUMENT', category: 'Ideas', level: 'Hard' },
  { a: 'NOSTALGIA', b: 'HOMESICKNESS', category: 'Feelings', level: 'Hard' },
  { a: 'AMBITION', b: 'GREED', category: 'Feelings', level: 'Hard' },
  { a: 'DIET', b: 'FASTING', category: 'Health', level: 'Hard' },
  { a: 'INTROVERT', b: 'SHY PERSON', category: 'People', level: 'Hard' },
];

export type PickedPair = { civilian: string; liar: string; category: string; level: string };

/**
 * Picks a pair for the requested difficulty, skipping words already used in
 * this room (falls back to the full pool once everything has been played).
 * Which word goes to the civilians is randomised, so "word A" is never a tell.
 */
export function pickPair(difficulty: Difficulty, used: Set<string>): PickedPair {
  const pool = WORD_PAIRS.filter((p) => difficulty === 'mixed' || p.level.toLowerCase() === difficulty);
  let fresh = pool.filter((p) => !used.has(p.a) && !used.has(p.b));
  if (fresh.length === 0) fresh = pool;
  const pair = fresh[randomInt(fresh.length)];
  const swap = randomInt(2) === 1;
  return {
    civilian: swap ? pair.b : pair.a,
    liar: swap ? pair.a : pair.b,
    category: pair.category,
    level: pair.level,
  };
}
