-- outLIAR — fresh install. Run this entire script in the Supabase SQL Editor.
-- Already ran the original (UNDERCOVER) schema? Run migration-v2.sql instead.
create extension if not exists pgcrypto;

create table if not exists public.rooms (
 id uuid primary key default gen_random_uuid(), code text unique not null,
 mode text not null check (mode in ('individual','teams')),
 max_players int not null default 16 check (max_players between 3 and 30),
 imposter_count int not null default 1 check (imposter_count between 1 and 3),
 difficulty text not null default 'mixed' check (difficulty in ('mixed','easy','medium','hard')),
 word_categories text[] not null default array['everyday']::text[]
   check (cardinality(word_categories) > 0 and word_categories <@ array['everyday','bible_characters','bible_stories','bible_places','bible_objects']::text[]),
 liars_know boolean not null default true,
 status text not null default 'lobby' check (status in ('lobby','clues','voting','revealed')),
 round int not null default 0, word_a text, word_b text, host_token_hash text not null,
 phase_started_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create table if not exists public.players (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id) on delete cascade,
 name text not null, team text check (team in ('A','B')), token_hash text not null,
 joined_at timestamptz not null default now(), unique(room_id,token_hash)
);
create table if not exists public.assignments (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id) on delete cascade,
 player_id uuid not null references public.players(id) on delete cascade, round int not null,
 word text not null, is_imposter boolean not null, unique(room_id,player_id,round)
);
create table if not exists public.votes (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id) on delete cascade,
 round int not null, voter_id uuid not null references public.players(id) on delete cascade,
 target_id uuid not null references public.players(id) on delete cascade,
 created_at timestamptz not null default now(), unique(room_id,round,voter_id), check(voter_id <> target_id)
);
create table if not exists public.round_results (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.rooms(id) on delete cascade,
 round int not null, result jsonb not null, unique(room_id,round)
);

-- Indexes: the app polls these tables every ~2 seconds per player.
create index if not exists players_room_idx on public.players(room_id);
create index if not exists assignments_room_round_idx on public.assignments(room_id, round);
create index if not exists votes_room_round_idx on public.votes(room_id, round);
create index if not exists rooms_created_idx on public.rooms(created_at);

-- All access goes through Next.js route handlers using the service role key.
-- Keep RLS enabled and do not create public policies for these tables.
alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.assignments enable row level security;
alter table public.votes enable row level security;
alter table public.round_results enable row level security;
revoke all on public.rooms,public.players,public.assignments,public.votes,public.round_results from anon, authenticated;

-- OPTIONAL: tidy up old rooms (everything cascades from rooms). Run manually, or schedule
-- it with Supabase's pg_cron / Database → Cron:
--   delete from public.rooms where created_at < now() - interval '24 hours';
