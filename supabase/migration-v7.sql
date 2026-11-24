-- outLIAR v7 migration — separate Secret Kingdom game mode.
-- Safe to run after migration-v6.sql on existing databases.

alter table public.rooms
  add column if not exists game_mode text not null default 'undercover'
  check (game_mode in ('undercover','kingdom'));

alter table public.assignments
  add column if not exists role text,
  add column if not exists kingdom_team text,
  add column if not exists hint text;

alter table public.players
  add column if not exists kingdom_choice text;

alter table public.players drop constraint if exists players_kingdom_choice_check;
alter table public.players add constraint players_kingdom_choice_check
  check (kingdom_choice is null or kingdom_choice in ('A','B'));

notify pgrst, 'reload schema';
