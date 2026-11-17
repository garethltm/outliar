-- outLIAR v5 migration — split the Everyday pack into selectable topics.
-- Safe to run on databases using any earlier outLIAR schema.
alter table public.rooms
  add column if not exists word_categories text[] not null default array['everyday']::text[];

alter table public.rooms drop constraint if exists rooms_word_categories_check;
alter table public.rooms alter column word_categories set default
  array['food_drink','nature_animals','places_travel','transport','home_objects','sports_outdoors','people_work','entertainment_events','technology','style_clothing','ideas_lifestyle']::text[];

update public.rooms
set word_categories = array_cat(
  array['food_drink','nature_animals','places_travel','transport','home_objects','sports_outdoors','people_work','entertainment_events','technology','style_clothing','ideas_lifestyle']::text[],
  array_remove(word_categories, 'everyday')
)
where 'everyday' = any(word_categories);

alter table public.rooms add constraint rooms_word_categories_check
  check (
    cardinality(word_categories) > 0
    and word_categories <@ array['everyday','food_drink','nature_animals','places_travel','transport','home_objects','sports_outdoors','people_work','entertainment_events','technology','style_clothing','ideas_lifestyle','bible_characters','bible_stories','bible_places','bible_objects']::text[]
  );

notify pgrst, 'reload schema';
