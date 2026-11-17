-- outLIAR v2 migration — for databases created with the original UNDERCOVER schema.
-- Safe to run more than once. Existing rooms and data are untouched.
alter table public.rooms add column if not exists difficulty text not null default 'mixed'
  check (difficulty in ('mixed','easy','medium','hard'));
alter table public.rooms add column if not exists liars_know boolean not null default true;
alter table public.rooms add column if not exists phase_started_at timestamptz not null default now();

create index if not exists players_room_idx on public.players(room_id);
create index if not exists assignments_room_round_idx on public.assignments(room_id, round);
create index if not exists votes_room_round_idx on public.votes(room_id, round);
create index if not exists rooms_created_idx on public.rooms(created_at);

-- OPTIONAL: tidy up old rooms (everything cascades from rooms).
--   delete from public.rooms where created_at < now() - interval '24 hours';
