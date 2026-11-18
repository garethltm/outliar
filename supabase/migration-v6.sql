-- outLIAR v6 migration — add the wildcard word packs.
-- Safe to run after migration-v5.sql on existing outLIAR databases.
alter table public.rooms drop constraint if exists rooms_word_categories_check;

alter table public.rooms add constraint rooms_word_categories_check
  check (
    cardinality(word_categories) > 0
    and word_categories <@ array[
      'everyday','food_drink','nature_animals','places_travel','transport',
      'home_objects','sports_outdoors','people_work','entertainment_events',
      'technology','style_clothing','ideas_lifestyle','bible_characters',
      'bible_stories','bible_places','bible_objects','mythology_folklore',
      'space_sci_fi','fantasy_magic','spooky_mystery','superpowers_time',
      'internet_culture','strange_snacks','history_inventions'
    ]::text[]
  );

notify pgrst, 'reload schema';
