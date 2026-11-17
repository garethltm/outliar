import { randomInt } from 'crypto';
import { WORD_CATEGORIES } from '@/lib/word-categories';
import type { WordCategory } from '@/lib/word-categories';

type Pair = {
  a: string;
  b: string;
  category: string;
  level: 'Easy' | 'Medium' | 'Hard';
  pack?: WordCategory;
};

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

  // ── Bible characters ────────────────────────────────────
  { a: 'DAVID', b: 'SAMSON', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'MOSES', b: 'ELIJAH', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },
  { a: 'PETER', b: 'PAUL', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'ESTHER', b: 'RUTH', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'MARY', b: 'MARTHA', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'ABRAHAM', b: 'ISAAC', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },
  { a: 'JOSEPH', b: 'DANIEL', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },
  { a: 'JOSHUA', b: 'GIDEON', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },
  { a: 'SOLOMON', b: 'SAUL', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },
  { a: 'JONAH', b: 'NOAH', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'PETER', b: 'THOMAS', category: 'Bible Characters', level: 'Easy', pack: 'bible_characters' },
  { a: 'ELIJAH', b: 'ELISHA', category: 'Bible Characters', level: 'Medium', pack: 'bible_characters' },

  // ── Bible stories and events ────────────────────────────
  { a: 'THE FLOOD', b: 'THE EXODUS', category: 'Bible Stories & Events', level: 'Easy', pack: 'bible_stories' },
  { a: 'DAVID AND GOLIATH', b: 'DANIEL IN THE LIONS’ DEN', category: 'Bible Stories & Events', level: 'Easy', pack: 'bible_stories' },
  { a: 'THE GOOD SAMARITAN', b: 'THE PRODIGAL SON', category: 'Bible Stories & Events', level: 'Medium', pack: 'bible_stories' },
  { a: 'THE TOWER OF BABEL', b: 'THE DAY OF PENTECOST', category: 'Bible Stories & Events', level: 'Hard', pack: 'bible_stories' },
  { a: 'THE NATIVITY', b: 'THE RESURRECTION', category: 'Bible Stories & Events', level: 'Easy', pack: 'bible_stories' },
  { a: 'THE LAST SUPPER', b: 'THE WEDDING AT CANA', category: 'Bible Stories & Events', level: 'Medium', pack: 'bible_stories' },
  { a: 'CROSSING THE RED SEA', b: 'CROSSING THE JORDAN', category: 'Bible Stories & Events', level: 'Medium', pack: 'bible_stories' },
  { a: 'FEEDING THE FIVE THOUSAND', b: 'WATER INTO WINE', category: 'Bible Stories & Events', level: 'Medium', pack: 'bible_stories' },
  { a: 'JONAH AND THE GREAT FISH', b: 'NOAH AND THE ARK', category: 'Bible Stories & Events', level: 'Easy', pack: 'bible_stories' },
  { a: 'THE FALL OF JERICHO', b: 'GIDEON’S FLEECE', category: 'Bible Stories & Events', level: 'Hard', pack: 'bible_stories' },
  { a: 'CREATION', b: 'THE FLOOD', category: 'Bible Stories & Events', level: 'Easy', pack: 'bible_stories' },
  { a: 'THE BURNING BUSH', b: 'THE FIERY FURNACE', category: 'Bible Stories & Events', level: 'Medium', pack: 'bible_stories' },

  // ── Bible places ────────────────────────────────────────
  { a: 'BETHLEHEM', b: 'NAZARETH', category: 'Bible Places', level: 'Easy', pack: 'bible_places' },
  { a: 'JERUSALEM', b: 'JERICHO', category: 'Bible Places', level: 'Easy', pack: 'bible_places' },
  { a: 'THE GARDEN OF EDEN', b: 'THE GARDEN OF GETHSEMANE', category: 'Bible Places', level: 'Medium', pack: 'bible_places' },
  { a: 'MOUNT SINAI', b: 'MOUNT CARMEL', category: 'Bible Places', level: 'Medium', pack: 'bible_places' },
  { a: 'THE RED SEA', b: 'THE JORDAN RIVER', category: 'Bible Places', level: 'Easy', pack: 'bible_places' },
  { a: 'BABYLON', b: 'NINEVEH', category: 'Bible Places', level: 'Hard', pack: 'bible_places' },
  { a: 'THE SEA OF GALILEE', b: 'THE DEAD SEA', category: 'Bible Places', level: 'Medium', pack: 'bible_places' },
  { a: 'CAPERNAUM', b: 'BETHANY', category: 'Bible Places', level: 'Hard', pack: 'bible_places' },
  { a: 'EGYPT', b: 'CANAAN', category: 'Bible Places', level: 'Easy', pack: 'bible_places' },
  { a: 'SODOM', b: 'GOMORRAH', category: 'Bible Places', level: 'Medium', pack: 'bible_places' },
  { a: 'THE WILDERNESS', b: 'THE PROMISED LAND', category: 'Bible Places', level: 'Medium', pack: 'bible_places' },
  { a: 'PATMOS', b: 'TARSUS', category: 'Bible Places', level: 'Hard', pack: 'bible_places' },

  // ── Bible objects and symbols ───────────────────────────
  { a: 'NOAH’S ARK', b: 'THE ARK OF THE COVENANT', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
  { a: 'MOSES’ STAFF', b: 'DAVID’S SLING', category: 'Bible Objects & Symbols', level: 'Easy', pack: 'bible_objects' },
  { a: 'THE STONE TABLETS', b: 'A TORAH SCROLL', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
  { a: 'MANNA', b: 'QUAIL', category: 'Bible Objects & Symbols', level: 'Easy', pack: 'bible_objects' },
  { a: 'SAUL’S SPEAR', b: 'GOLIATH’S SWORD', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
  { a: 'JOSEPH’S COAT', b: 'ELIJAH’S MANTLE', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
  { a: 'THE GOLDEN CALF', b: 'THE BRONZE SERPENT', category: 'Bible Objects & Symbols', level: 'Hard', pack: 'bible_objects' },
  { a: 'JERICHO’S TRUMPETS', b: 'A RAM’S HORN', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
  { a: 'THE CROWN OF THORNS', b: 'THE CROSS', category: 'Bible Objects & Symbols', level: 'Easy', pack: 'bible_objects' },
  { a: 'LOAVES OF BREAD', b: 'FISH', category: 'Bible Objects & Symbols', level: 'Easy', pack: 'bible_objects' },
  { a: 'FRANKINCENSE', b: 'MYRRH', category: 'Bible Objects & Symbols', level: 'Hard', pack: 'bible_objects' },
  { a: 'A MUSTARD SEED', b: 'A FIG TREE', category: 'Bible Objects & Symbols', level: 'Medium', pack: 'bible_objects' },
];

export type PickedPair = { civilian: string; liar: string; category: string; level: string };

const EVERYDAY_PACK_BY_CATEGORY: Record<string, WordCategory> = {
  'Food & Drink': 'food_drink',
  Animals: 'nature_animals',
  Nature: 'nature_animals',
  Places: 'places_travel',
  Travel: 'places_travel',
  Transport: 'transport',
  Objects: 'home_objects',
  Home: 'home_objects',
  Sports: 'sports_outdoors',
  Outdoors: 'sports_outdoors',
  People: 'people_work',
  Work: 'people_work',
  Entertainment: 'entertainment_events',
  Events: 'entertainment_events',
  Music: 'entertainment_events',
  Apps: 'technology',
  Tech: 'technology',
  Style: 'style_clothing',
  Clothing: 'style_clothing',
  Ideas: 'ideas_lifestyle',
  Feelings: 'ideas_lifestyle',
  Health: 'ideas_lifestyle',
};

const EVERYDAY_PACKS = new Set<WordCategory>(
  WORD_CATEGORIES.filter((category) => category.group === 'everyday').map((category) => category.id),
);

/**
 * Picks from the selected word packs, skipping words already used in this room
 * (falls back to the selected pool once everything has been played).
 * Which word goes to the civilians is randomised, so "word A" is never a tell.
 */
export function pickPair(categories: WordCategory[], used: Set<string>): PickedPair {
  const selected = new Set(categories);
  const pool = WORD_PAIRS.filter((pair) => {
    const pack = pair.pack ?? EVERYDAY_PACK_BY_CATEGORY[pair.category] ?? 'everyday';
    return selected.has(pack) || (selected.has('everyday') && (pack === 'everyday' || EVERYDAY_PACKS.has(pack)));
  });
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
