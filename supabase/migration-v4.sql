-- outLIAR v4 migration — add selectable word packs to existing rooms.
-- Safe to run more than once.
alter table public.rooms
  add column if not exists word_categories text[] not null default array['everyday']::text[];

alter table public.rooms drop constraint if exists rooms_word_categories_check;
alter table public.rooms add constraint rooms_word_categories_check
  check (
    cardinality(word_categories) > 0
    and word_categories <@ array['everyday','bible_characters','bible_stories','bible_places','bible_objects']::text[]
  );
