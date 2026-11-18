export const WORD_CATEGORIES = [
  { id: 'food_drink', label: 'Food & drink', group: 'everyday' },
  { id: 'nature_animals', label: 'Animals & nature', group: 'everyday' },
  { id: 'places_travel', label: 'Places & travel', group: 'everyday' },
  { id: 'transport', label: 'Transport', group: 'everyday' },
  { id: 'home_objects', label: 'Home & objects', group: 'everyday' },
  { id: 'sports_outdoors', label: 'Sports & outdoors', group: 'everyday' },
  { id: 'people_work', label: 'People & work', group: 'everyday' },
  { id: 'entertainment_events', label: 'Entertainment & events', group: 'everyday' },
  { id: 'technology', label: 'Technology & apps', group: 'everyday' },
  { id: 'style_clothing', label: 'Style & clothing', group: 'everyday' },
  { id: 'ideas_lifestyle', label: 'Ideas & lifestyle', group: 'everyday' },
  { id: 'bible_characters', label: 'Characters', group: 'bible' },
  { id: 'bible_stories', label: 'Stories & events', group: 'bible' },
  { id: 'bible_places', label: 'Places', group: 'bible' },
  { id: 'bible_objects', label: 'Objects & symbols', group: 'bible' },
  { id: 'mythology_folklore', label: 'Myths & folklore', group: 'wildcard' },
  { id: 'space_sci_fi', label: 'Space & sci-fi', group: 'wildcard' },
  { id: 'fantasy_magic', label: 'Fantasy & magic', group: 'wildcard' },
  { id: 'spooky_mystery', label: 'Spooky & mysterious', group: 'wildcard' },
  { id: 'superpowers_time', label: 'Superpowers & time travel', group: 'wildcard' },
  { id: 'internet_culture', label: 'Internet culture', group: 'wildcard' },
  { id: 'strange_snacks', label: 'Strange snacks', group: 'wildcard' },
  { id: 'history_inventions', label: 'History & inventions', group: 'wildcard' },
  { id: 'malaysia', label: 'Malaysia', group: 'wildcard' },
] as const;

export type WordCategory = (typeof WORD_CATEGORIES)[number]['id'] | 'everyday';

export const DEFAULT_WORD_CATEGORIES: WordCategory[] = WORD_CATEGORIES
  .filter((category) => category.group === 'everyday')
  .map((category) => category.id);

export function isWordCategory(value: unknown): value is WordCategory {
  return value === 'everyday' || WORD_CATEGORIES.some((category) => category.id === value);
}

export function wordCategoryLabel(id: string): string {
  if (id === 'everyday') return 'All everyday topics';
  return WORD_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
