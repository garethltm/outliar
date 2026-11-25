alter table public.players
  add column if not exists kingdom_team text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'players_kingdom_team_check'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_kingdom_team_check
      check (kingdom_team is null or kingdom_team in ('A','B','C','D'));
  end if;
end $$;

notify pgrst, 'reload schema';