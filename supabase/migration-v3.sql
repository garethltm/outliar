-- outLIAR v3 migration — allow 3-player individual rooms.
-- Safe to run on databases using the earlier outLIAR schema.
alter table public.rooms drop constraint if exists rooms_max_players_check;
alter table public.rooms add constraint rooms_max_players_check
  check (max_players between 3 and 30);
