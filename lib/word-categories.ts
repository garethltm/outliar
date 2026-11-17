export const WORD_CATEGORIES = [
  { id: 'everyday', label: 'Everyday' },
  { id: 'bible_characters', label: 'Bible characters' },
  { id: 'bible_stories', label: 'Bible stories & events' },
  { id: 'bible_places', label: 'Bible places' },
  { id: 'bible_objects', label: 'Bible objects & symbols' },
] as const;

export type WordCategory = (typeof WORD_CATEGORIES)[number]['id'];

export const DEFAULT_WORD_CATEGORIES: WordCategory[] = ['everyday'];

export function isWordCategory(value: unknown): value is WordCategory {
  return WORD_CATEGORIES.some((category) => category.id === value);
}

export function wordCategoryLabel(id: string): string {
  return WORD_CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
