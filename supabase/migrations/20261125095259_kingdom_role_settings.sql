alter table public.rooms
  add column if not exists kingdom_role_counts jsonb not null
  default '{"assassin":1,"joker":1}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'rooms_kingdom_role_counts_object_check'
      and conrelid = 'public.rooms'::regclass
  ) then
    alter table public.rooms
      add constraint rooms_kingdom_role_counts_object_check
      check (jsonb_typeof(kingdom_role_counts) = 'object');
  end if;
end $$;

alter table public.assignments
  add column if not exists target_team text;

alter table public.assignments
  drop constraint if exists assignments_role_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'assignments_target_team_check'
      and conrelid = 'public.assignments'::regclass
  ) then
    alter table public.assignments
      add constraint assignments_target_team_check
      check (target_team is null or target_team in ('A','B','C','D'));
  end if;
end $$;

notify pgrst, 'reload schema';