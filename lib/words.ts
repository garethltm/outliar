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

  // ── Myths and folklore ─────────────────────────────────
  { a: 'ZEUS', b: 'POSEIDON', category: 'Myths & Folklore', level: 'Easy', pack: 'mythology_folklore' },
  { a: 'ATHENA', b: 'ARTEMIS', category: 'Myths & Folklore', level: 'Medium', pack: 'mythology_folklore' },
  { a: 'THOR', b: 'ODIN', category: 'Myths & Folklore', level: 'Easy', pack: 'mythology_folklore' },
  { a: 'MEDUSA', b: 'A SIREN', category: 'Myths & Folklore', level: 'Medium', pack: 'mythology_folklore' },
  { a: 'CYCLOPS', b: 'MINOTAUR', category: 'Myths & Folklore', level: 'Easy', pack: 'mythology_folklore' },
  { a: 'PHOENIX', b: 'GRIFFIN', category: 'Myths & Folklore', level: 'Easy', pack: 'mythology_folklore' },
  { a: 'PEGASUS', b: 'UNICORN', category: 'Myths & Folklore', level: 'Easy', pack: 'mythology_folklore' },
  { a: 'KRAKEN', b: 'LEVIATHAN', category: 'Myths & Folklore', level: 'Hard', pack: 'mythology_folklore' },
  { a: 'ACHILLES', b: 'ODYSSEUS', category: 'Myths & Folklore', level: 'Medium', pack: 'mythology_folklore' },
  { a: 'HADES', b: 'ANUBIS', category: 'Myths & Folklore', level: 'Hard', pack: 'mythology_folklore' },
  { a: 'SPHINX', b: 'CHIMERA', category: 'Myths & Folklore', level: 'Hard', pack: 'mythology_folklore' },
  { a: 'TRIDENT', b: 'THUNDERBOLT', category: 'Myths & Folklore', level: 'Medium', pack: 'mythology_folklore' },

  // ── Space and sci-fi ───────────────────────────────────
  { a: 'ASTEROID', b: 'COMET', category: 'Space & Sci-Fi', level: 'Easy', pack: 'space_sci_fi' },
  { a: 'METEOR', b: 'METEORITE', category: 'Space & Sci-Fi', level: 'Hard', pack: 'space_sci_fi' },
  { a: 'MARS', b: 'VENUS', category: 'Space & Sci-Fi', level: 'Easy', pack: 'space_sci_fi' },
  { a: 'SATURN', b: 'JUPITER', category: 'Space & Sci-Fi', level: 'Easy', pack: 'space_sci_fi' },
  { a: 'NEBULA', b: 'GALAXY', category: 'Space & Sci-Fi', level: 'Medium', pack: 'space_sci_fi' },
  { a: 'BLACK HOLE', b: 'WORMHOLE', category: 'Space & Sci-Fi', level: 'Medium', pack: 'space_sci_fi' },
  { a: 'ASTRONAUT', b: 'COSMONAUT', category: 'Space & Sci-Fi', level: 'Hard', pack: 'space_sci_fi' },
  { a: 'SPACE STATION', b: 'MOON BASE', category: 'Space & Sci-Fi', level: 'Medium', pack: 'space_sci_fi' },
  { a: 'LUNAR ROVER', b: 'SPACE PROBE', category: 'Space & Sci-Fi', level: 'Medium', pack: 'space_sci_fi' },
  { a: 'ROCKET', b: 'SPACE SHUTTLE', category: 'Space & Sci-Fi', level: 'Easy', pack: 'space_sci_fi' },
  { a: 'ALIEN', b: 'ASTRONAUT', category: 'Space & Sci-Fi', level: 'Easy', pack: 'space_sci_fi' },
  { a: 'SOLAR ECLIPSE', b: 'AURORA', category: 'Space & Sci-Fi', level: 'Hard', pack: 'space_sci_fi' },

  // ── Fantasy and magic ──────────────────────────────────
  { a: 'WIZARD', b: 'SORCERER', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'WITCH', b: 'ENCHANTRESS', category: 'Fantasy & Magic', level: 'Medium', pack: 'fantasy_magic' },
  { a: 'SPELL', b: 'INCANTATION', category: 'Fantasy & Magic', level: 'Medium', pack: 'fantasy_magic' },
  { a: 'POTION', b: 'ELIXIR', category: 'Fantasy & Magic', level: 'Medium', pack: 'fantasy_magic' },
  { a: 'MAGIC WAND', b: 'CRYSTAL BALL', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'ELF', b: 'DWARF', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'FAIRY', b: 'SPRITE', category: 'Fantasy & Magic', level: 'Medium', pack: 'fantasy_magic' },
  { a: 'ENCHANTED FOREST', b: 'FAIRY GARDEN', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'TROLL', b: 'OGRE', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'MAGIC CARPET', b: 'FLYING BROOM', category: 'Fantasy & Magic', level: 'Easy', pack: 'fantasy_magic' },
  { a: 'JINN', b: 'GENIE', category: 'Fantasy & Magic', level: 'Hard', pack: 'fantasy_magic' },
  { a: 'DRAGON RIDER', b: 'PEGASUS RIDER', category: 'Fantasy & Magic', level: 'Medium', pack: 'fantasy_magic' },

  // ── Spooky and mysterious ──────────────────────────────
  { a: 'GHOST', b: 'POLTERGEIST', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'VAMPIRE', b: 'WEREWOLF', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'MUMMY', b: 'ZOMBIE', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'HAUNTED HOUSE', b: 'ABANDONED MANSION', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'GHOST HUNTER', b: 'PARANORMAL INVESTIGATOR', category: 'Spooky & Mysterious', level: 'Medium', pack: 'spooky_mystery' },
  { a: 'SKELETON', b: 'GRIM REAPER', category: 'Spooky & Mysterious', level: 'Medium', pack: 'spooky_mystery' },
  { a: 'CREEPY DOLL', b: 'HAUNTED MIRROR', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'SECRET PASSAGE', b: 'HIDDEN ROOM', category: 'Spooky & Mysterious', level: 'Medium', pack: 'spooky_mystery' },
  { a: 'DETECTIVE', b: 'PRIVATE INVESTIGATOR', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'CLUE', b: 'ALIBI', category: 'Spooky & Mysterious', level: 'Medium', pack: 'spooky_mystery' },
  { a: 'FOG', b: 'MIST', category: 'Spooky & Mysterious', level: 'Easy', pack: 'spooky_mystery' },
  { a: 'LOCKED ROOM', b: 'MISSING KEY', category: 'Spooky & Mysterious', level: 'Medium', pack: 'spooky_mystery' },

  // ── Superpowers and time travel ─────────────────────────
  { a: 'INVISIBILITY', b: 'SHAPE-SHIFTING', category: 'Superpowers & Time Travel', level: 'Easy', pack: 'superpowers_time' },
  { a: 'TELEPORTATION', b: 'TIME TRAVEL', category: 'Superpowers & Time Travel', level: 'Easy', pack: 'superpowers_time' },
  { a: 'SUPER STRENGTH', b: 'SUPER SPEED', category: 'Superpowers & Time Travel', level: 'Easy', pack: 'superpowers_time' },
  { a: 'MIND READING', b: 'LIE DETECTION', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'FLIGHT', b: 'LEVITATION', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'TIME FREEZE', b: 'TIME LOOP', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'CLONING', b: 'SIZE CHANGING', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'HEALING', b: 'INVULNERABILITY', category: 'Superpowers & Time Travel', level: 'Hard', pack: 'superpowers_time' },
  { a: 'X-RAY VISION', b: 'NIGHT VISION', category: 'Superpowers & Time Travel', level: 'Easy', pack: 'superpowers_time' },
  { a: 'TELEKINESIS', b: 'FORCE FIELD', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'LASER EYES', b: 'SONIC SCREAM', category: 'Superpowers & Time Travel', level: 'Medium', pack: 'superpowers_time' },
  { a: 'UNDERWATER BREATHING', b: 'SUPER JUMP', category: 'Superpowers & Time Travel', level: 'Easy', pack: 'superpowers_time' },

  // ── Internet culture ───────────────────────────────────
  { a: 'GROUP CHAT', b: 'DIRECT MESSAGE', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'EMOJI', b: 'STICKER', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'STREAMER', b: 'VLOGGER', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'VIRAL VIDEO', b: 'TRENDING SOUND', category: 'Internet Culture', level: 'Medium', pack: 'internet_culture' },
  { a: 'MEME', b: 'REACTION GIF', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'FILTER', b: 'AVATAR', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'DOOMSCROLLING', b: 'RABBIT HOLE', category: 'Internet Culture', level: 'Medium', pack: 'internet_culture' },
  { a: 'NOTIFICATION', b: 'READ RECEIPT', category: 'Internet Culture', level: 'Medium', pack: 'internet_culture' },
  { a: 'HASHTAG', b: 'TRENDING TOPIC', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'MUTE', b: 'UNFOLLOW', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'VOICE NOTE', b: 'VIDEO CALL', category: 'Internet Culture', level: 'Easy', pack: 'internet_culture' },
  { a: 'INBOX ZERO', b: 'UNREAD BADGE', category: 'Internet Culture', level: 'Medium', pack: 'internet_culture' },

  // ── Strange snacks ──────────────────────────────────────
  { a: 'DURIAN', b: 'JACKFRUIT', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'NATTO', b: 'KIMCHI', category: 'Strange Snacks', level: 'Hard', pack: 'strange_snacks' },
  { a: 'CHILI CHOCOLATE', b: 'WASABI PEAS', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'SWEET PICKLES', b: 'PICKLED ONIONS', category: 'Strange Snacks', level: 'Easy', pack: 'strange_snacks' },
  { a: 'BUBBLE TEA', b: 'CHEESE TEA', category: 'Strange Snacks', level: 'Easy', pack: 'strange_snacks' },
  { a: 'SEAWEED CHIPS', b: 'DRIED FISH', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'SALTED LICORICE', b: 'SOUR CANDY', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'PICKLE PIZZA', b: 'PINEAPPLE PIZZA', category: 'Strange Snacks', level: 'Easy', pack: 'strange_snacks' },
  { a: 'SOURDOUGH', b: 'KOMBUCHA', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'COTTON CANDY GRAPES', b: 'DRAGON FRUIT', category: 'Strange Snacks', level: 'Medium', pack: 'strange_snacks' },
  { a: 'BLACK GARLIC', b: 'FERMENTED TOFU', category: 'Strange Snacks', level: 'Hard', pack: 'strange_snacks' },
  { a: 'FRIED ICE CREAM', b: 'BAKED ALASKA', category: 'Strange Snacks', level: 'Hard', pack: 'strange_snacks' },

  // ── History and inventions ─────────────────────────────
  { a: 'PRINTING PRESS', b: 'TYPEWRITER', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'TELEGRAPH', b: 'TELEPHONE', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'COMPASS', b: 'ASTROLABE', category: 'History & Inventions', level: 'Medium', pack: 'history_inventions' },
  { a: 'STEAM ENGINE', b: 'LOCOMOTIVE', category: 'History & Inventions', level: 'Medium', pack: 'history_inventions' },
  { a: 'SUNDIAL', b: 'HOURGLASS', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'CASTLE', b: 'FORTRESS', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'KNIGHT', b: 'SAMURAI', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'SCROLL', b: 'PAPYRUS', category: 'History & Inventions', level: 'Medium', pack: 'history_inventions' },
  { a: 'PIRATE', b: 'VIKING', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'CANDLE', b: 'LANTERN', category: 'History & Inventions', level: 'Easy', pack: 'history_inventions' },
  { a: 'SILK ROAD', b: 'SPICE ROUTE', category: 'History & Inventions', level: 'Medium', pack: 'history_inventions' },
  { a: 'STONEHENGE', b: 'COLOSSEUM', category: 'History & Inventions', level: 'Hard', pack: 'history_inventions' },

  // ── Malaysia ────────────────────────────────────────────
  { a: 'NASI LEMAK', b: 'NASI DAGANG', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'ROTI CANAI', b: 'ROTI TELUR', category: 'Malaysia', level: 'Easy', pack: 'malaysia' },
  { a: 'CHAR KWAY TEOW', b: 'PENANG LAKSA', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'SATE', b: 'SATE CELUP', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'RENDANG', b: 'LEMANG', category: 'Malaysia', level: 'Easy', pack: 'malaysia' },
  { a: 'TEH TARIK', b: 'WHITE COFFEE', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'PETRONAS TWIN TOWER', b: 'MENARA KL', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'GEORGE TOWN', b: 'JOHOR BAHRU', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'LANGKAWI', b: 'REDANG', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
  { a: 'MALAYSIAN RINGGIT', b: 'SINGAPORE DOLLAR', category: 'Malaysia', level: 'Easy', pack: 'malaysia' },
  { a: 'PROTON', b: 'PERODUA', category: 'Malaysia', level: 'Easy', pack: 'malaysia' },
  { a: 'HARI RAYA', b: 'DEEPAVALI', category: 'Malaysia', level: 'Medium', pack: 'malaysia' },
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
