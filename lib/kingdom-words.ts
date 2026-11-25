import { randomInt } from "crypto";
import { shuffle } from "@/lib/security";

export type KingdomTopic = {
  title: string;
  hint: string;
  words: readonly string[];
};

type KingdomTopicSet = {
  id: string;
  topics: readonly KingdomTopic[];
};

export type SelectedKingdomTopic = {
  topic: KingdomTopic;
  word: string;
};

const topic = (
  title: string,
  hint: string,
  words: readonly string[],
): KingdomTopic => ({ title, hint, words });

export const KINGDOM_TOPIC_SETS: readonly KingdomTopicSet[] = [
  {
    id: "food",
    topics: [
      topic("Soup", "A savory dish usually served from a bowl.", [
        "Ramen", "Chowder", "Broth", "Bisque", "Minestrone", "Gazpacho",
      ]),
      topic("Drinks", "Something people sip, hot or cold.", [
        "Lemonade", "Tea", "Cocoa", "Smoothie", "Soda", "Juice",
      ]),
      topic("Desserts", "A sweet course often eaten after a meal.", [
        "Tart", "Pudding", "Sorbet", "Brownie", "Custard", "Pavlova",
      ]),
      topic("Snacks", "A small bite people eat between meals.", [
        "Popcorn", "Pretzel", "Crackers", "Trail mix", "Nachos", "Roasted nuts",
      ]),
    ],
  },
  {
    id: "weather",
    topics: [
      topic("Rain", "Water falling from clouds.", [
        "Drizzle", "Downpour", "Shower", "Monsoon", "Raindrop", "Squall",
      ]),
      topic("Snow", "Frozen flakes that fall from clouds.", [
        "Flurry", "Blizzard", "Sleet", "Snowdrift", "Hail", "Avalanche",
      ]),
      topic("Wind", "Moving air that can range from a breeze to a gale.", [
        "Breeze", "Gust", "Gale", "Whirlwind", "Draft", "Cyclone",
      ]),
      topic("Thunderstorms", "Storms with flashes of light and loud rumbles.", [
        "Lightning", "Thunderclap", "Downburst", "Squall line", "Storm cloud", "Rain shaft",
      ]),
    ],
  },
  {
    id: "transport",
    topics: [
      topic("Trains", "Vehicles that travel along metal tracks.", [
        "Locomotive", "Carriage", "Freight train", "Tram", "Subway", "Monorail",
      ]),
      topic("Buses", "Road vehicles that carry groups of passengers.", [
        "Shuttle", "Coach", "Minibus", "Double-decker", "School bus", "Trolleybus",
      ]),
      topic("Boats", "Watercraft that travel on rivers, lakes, or seas.", [
        "Canoe", "Ferry", "Sailboat", "Kayak", "Yacht", "Rowboat",
      ]),
      topic("Aircraft", "Vehicles designed to travel through the air.", [
        "Glider", "Helicopter", "Airliner", "Seaplane", "Hot-air balloon", "Biplane",
      ]),
    ],
  },
  {
    id: "music",
    topics: [
      topic("String Instruments", "Instruments that make sound from vibrating strings.", [
        "Violin", "Harp", "Cello", "Guitar", "Ukulele", "Banjo",
      ]),
      topic("Keyboard Instruments", "Instruments played using rows of keys.", [
        "Piano", "Organ", "Synthesizer", "Harpsichord", "Clavichord", "Keytar",
      ]),
      topic("Percussion Instruments", "Instruments played by striking, shaking, or scraping.", [
        "Drum", "Tambourine", "Xylophone", "Cymbal", "Maraca", "Triangle",
      ]),
      topic("Wind Instruments", "Instruments played by blowing air through them.", [
        "Flute", "Clarinet", "Oboe", "Bassoon", "Recorder", "Harmonica",
      ]),
    ],
  },
  {
    id: "space",
    topics: [
      topic("Planets", "Large bodies that orbit a star.", [
        "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn",
      ]),
      topic("Moons", "Natural companions that orbit planets.", [
        "Luna", "Europa", "Titan", "Phobos", "Enceladus", "Ganymede",
      ]),
      topic("Stars", "Giant glowing spheres of hot gas in space.", [
        "Red giant", "White dwarf", "Pulsar", "Sirius", "Betelgeuse", "Supernova",
      ]),
      topic("Galaxies", "Vast systems containing stars, gas, and dust.", [
        "Spiral", "Andromeda", "Sombrero", "Whirlpool", "Elliptical", "Milky Way",
      ]),
    ],
  },
  {
    id: "garden",
    topics: [
      topic("Flowers", "Plants grown for their colorful blooms.", [
        "Tulip", "Daisy", "Orchid", "Sunflower", "Jasmine", "Peony",
      ]),
      topic("Herbs", "Aromatic leaves used in cooking or remedies.", [
        "Basil", "Mint", "Rosemary", "Thyme", "Dill", "Parsley",
      ]),
      topic("Vegetables", "Edible plants often used in savory meals.", [
        "Carrot", "Eggplant", "Broccoli", "Turnip", "Zucchini", "Cauliflower",
      ]),
      topic("Fruits", "Edible produce that usually grows from flowers.", [
        "Peach", "Papaya", "Pear", "Guava", "Plum", "Pomegranate",
      ]),
    ],
  },
  {
    id: "animals",
    topics: [
      topic("Cats", "Small feline companions with whiskers and retractable claws.", [
        "Tabby", "Calico", "Siamese", "Maine Coon", "Persian", "Sphynx",
      ]),
      topic("Dogs", "Domesticated canines known for loyalty and keen senses.", [
        "Beagle", "Poodle", "Terrier", "Greyhound", "Collie", "Shiba",
      ]),
      topic("Birds", "Feathered animals with beaks and wings.", [
        "Robin", "Parrot", "Sparrow", "Heron", "Kingfisher", "Owl",
      ]),
      topic("Reptiles", "Scaly cold-blooded animals that breathe air.", [
        "Gecko", "Iguana", "Crocodile", "Chameleon", "Tortoise", "Skink",
      ]),
    ],
  },
  {
    id: "sports",
    topics: [
      topic("Racket Sports", "Sports played by hitting a ball or shuttle with a racket.", [
        "Tennis", "Badminton", "Squash", "Pickleball", "Racquetball", "Paddle tennis",
      ]),
      topic("Water Sports", "Sports played on or in the water.", [
        "Surfing", "Rowing", "Water polo", "Sailing", "Diving", "Canoeing",
      ]),
      topic("Winter Sports", "Sports commonly played on snow or ice.", [
        "Skiing", "Curling", "Luge", "Snowboarding", "Figure skating", "Biathlon",
      ]),
      topic("Field Sports", "Team sports played on a marked outdoor field.", [
        "Football", "Rugby", "Lacrosse", "Field hockey", "Baseball", "Cricket",
      ]),
    ],
  },
  {
    id: "home",
    topics: [
      topic("Kitchen Tools", "Handy items used to prepare or serve food.", [
        "Whisk", "Ladle", "Grater", "Tongs", "Peeler", "Rolling pin",
      ]),
      topic("Furniture", "Large movable items used to furnish a room.", [
        "Sofa", "Bookshelf", "Ottoman", "Desk", "Wardrobe", "Stool",
      ]),
      topic("Appliances", "Powered machines used for everyday household tasks.", [
        "Toaster", "Vacuum", "Blender", "Dishwasher", "Kettle", "Iron",
      ]),
      topic("Lighting", "Objects that provide or shape light indoors.", [
        "Chandelier", "Lantern", "Sconce", "Desk lamp", "Candle", "Pendant light",
      ]),
    ],
  },
  {
    id: "landscapes",
    topics: [
      topic("Beaches", "Sandy or pebbly shores beside a large body of water.", [
        "Seashell", "Tide pool", "Dune", "Shoreline", "Driftwood", "Boardwalk",
      ]),
      topic("Mountains", "High landforms with steep slopes and peaks.", [
        "Summit", "Ridgeline", "Glacier", "Pass", "Cliff", "Alpine meadow",
      ]),
      topic("Forests", "Large areas dominated by trees and other plants.", [
        "Canopy", "Grove", "Undergrowth", "Woodland", "Clearing", "Glen",
      ]),
      topic("Deserts", "Dry landscapes with very little rainfall.", [
        "Oasis", "Dune", "Cactus", "Wadi", "Salt flat", "Mirage",
      ]),
    ],
  },
  {
    id: "art",
    topics: [
      topic("Painting", "Art made by applying color to a surface.", [
        "Watercolor", "Portrait", "Mural", "Canvas", "Landscape", "Fresco",
      ]),
      topic("Sculpture", "Three-dimensional artwork shaped from materials.", [
        "Bust", "Statue", "Relief", "Clay", "Marble", "Installation",
      ]),
      topic("Photography", "Images captured using a camera.", [
        "Portrait", "Snapshot", "Exposure", "Lens", "Darkroom", "Panorama",
      ]),
      topic("Pottery", "Objects formed from clay and hardened by heat.", [
        "Vase", "Kiln", "Glaze", "Wheel", "Teapot", "Earthenware",
      ]),
    ],
  },
  {
    id: "cooking",
    topics: [
      topic("Baking", "Cooking food with dry heat inside an oven.", [
        "Loaf", "Muffin", "Pastry", "Biscuit", "Sourdough", "Casserole",
      ]),
      topic("Grilling", "Cooking food over direct heat on a grate.", [
        "Barbecue", "Skewer", "Charcoal", "Kebab", "Sear", "Smoker",
      ]),
      topic("Frying", "Cooking food in hot oil or fat.", [
        "Fritter", "Tempura", "Sauté", "Stir-fry", "Doughnut", "Schnitzel",
      ]),
      topic("Steaming", "Cooking food using hot water vapor.", [
        "Dumpling", "Bamboo basket", "Bao", "Pudding", "Steam oven", "Dim sum",
      ]),
    ],
  },
  {
    id: "clothing",
    topics: [
      topic("Shoes", "Items worn on the feet for protection or style.", [
        "Sneaker", "Boot", "Sandal", "Loafer", "Clog", "Moccasin",
      ]),
      topic("Hats", "Headwear worn for warmth, shade, or style.", [
        "Beret", "Beanie", "Fedora", "Sunhat", "Turban", "Helmet",
      ]),
      topic("Coats", "Outer garments worn over other clothes.", [
        "Parka", "Trench coat", "Peacoat", "Raincoat", "Puffer", "Anorak",
      ]),
      topic("Bags", "Portable containers used to carry belongings.", [
        "Backpack", "Tote", "Satchel", "Duffel", "Clutch", "Messenger bag",
      ]),
    ],
  },
  {
    id: "school",
    topics: [
      topic("Mathematics", "The study of numbers, shapes, and patterns.", [
        "Algebra", "Geometry", "Fraction", "Equation", "Graph", "Theorem",
      ]),
      topic("Biology", "The study of living things and how they work.", [
        "Cell", "Ecosystem", "Molecule", "Habitat", "Evolution", "Organism",
      ]),
      topic("History", "The study of people and events from the past.", [
        "Artifact", "Dynasty", "Treaty", "Timeline", "Revolution", "Archive",
      ]),
      topic("Languages", "Systems people use to communicate with words and signs.", [
        "Grammar", "Dialect", "Alphabet", "Translation", "Accent", "Vocabulary",
      ]),
    ],
  },
  {
    id: "folklore",
    topics: [
      topic("Dragons", "Legendary scaled creatures often said to breathe fire.", [
        "Wyvern", "Drake", "Hoard", "Scale", "Cavern", "Fire breath",
      ]),
      topic("Giants", "Legendary beings described as much larger than people.", [
        "Colossus", "Ogre", "Mountain giant", "Footstep", "Beanstalk", "Stone giant",
      ]),
      topic("Fairies", "Small magical beings from traditional folktales.", [
        "Pixie", "Sprite", "Wand", "Glimmer", "Enchanted ring", "Wing",
      ]),
      topic("Merfolk", "Mythical people said to live beneath the sea.", [
        "Mermaid", "Merman", "Trident", "Coral palace", "Sea song", "Pearl",
      ]),
    ],
  },
  {
    id: "water",
    topics: [
      topic("Rivers", "Natural flowing waterways that move across land.", [
        "Tributary", "Delta", "Estuary", "Rapids", "Bend", "Riverbank",
      ]),
      topic("Lakes", "Inland bodies of water surrounded by land.", [
        "Shore", "Lagoon", "Crater lake", "Inlet", "Reed bed", "Freshwater",
      ]),
      topic("Oceans", "Vast saltwater bodies covering much of the planet.", [
        "Tide", "Current", "Atoll", "Trench", "Kelp forest", "Open sea",
      ]),
      topic("Waterfalls", "Places where water drops over a steep edge.", [
        "Cascade", "Plunge pool", "Mist", "Cataract", "Ravine", "Torrent",
      ]),
    ],
  },
  {
    id: "games",
    topics: [
      topic("Board Games", "Games played on a marked board, often with pieces.", [
        "Dice", "Token", "Turn", "Game piece", "Board", "Score track",
      ]),
      topic("Card Games", "Games played with a deck of cards.", [
        "Shuffle", "Trump", "Hand", "Joker", "Deal", "Discard pile",
      ]),
      topic("Puzzles", "Challenges solved by fitting, arranging, or reasoning.", [
        "Jigsaw", "Riddle", "Maze", "Crossword", "Sudoku", "Pattern",
      ]),
      topic("Outdoor Games", "Games played outside, often with open space.", [
        "Hide-and-seek", "Tag", "Hopscotch", "Relay", "Marbles", "Scavenger hunt",
      ]),
    ],
  },
] as const;

export function pickKingdomTopics(
  kingdomCount: number,
  usedTopics: ReadonlySet<string>,
  usedWords: ReadonlySet<string>,
): SelectedKingdomTopic[] {
  const unusedSets = KINGDOM_TOPIC_SETS.map((set) => ({
    set,
    topics: set.topics.filter((entry) => !usedTopics.has(entry.title)),
  })).filter((candidate) => candidate.topics.length >= kingdomCount);
  const availableSets = unusedSets.length
    ? unusedSets
    : KINGDOM_TOPIC_SETS.map((set) => ({ set, topics: set.topics }));
  const chosenSet = availableSets[randomInt(availableSets.length)];
  const chosenTopics = shuffle([...chosenSet.topics]).slice(0, kingdomCount);

  if (chosenTopics.length !== kingdomCount)
    throw new Error("Not enough Kingdom topics are available.");

  const reservedWords = new Set(usedWords);
  return chosenTopics.map((entry) => {
    const availableWords = entry.words.filter(
      (word) => !reservedWords.has(word.toUpperCase()),
    );
    const wordPool = availableWords.length ? availableWords : entry.words;
    const word = wordPool[randomInt(wordPool.length)].toUpperCase();
    reservedWords.add(word);
    return { topic: entry, word };
  });
}
