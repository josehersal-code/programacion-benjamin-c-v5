-- FASE 4: PLANTILLA DE JUGADORES
-- Ejecutar una sola vez en Supabase > SQL Editor.

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  number integer,
  name text not null,
  position text,
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players add column if not exists number integer;
alter table public.players add column if not exists position text;
alter table public.players add column if not exists start_date date;
alter table public.players add column if not exists end_date date;
alter table public.players add column if not exists active boolean not null default true;
alter table public.players add column if not exists notes text;
alter table public.players add column if not exists created_at timestamptz not null default now();
alter table public.players add column if not exists updated_at timestamptz not null default now();

update public.players set start_date=current_date where start_date is null;

alter table public.players enable row level security;

drop policy if exists "authenticated players" on public.players;
drop policy if exists "anon players" on public.players;

create policy "anon players"
on public.players
for all
to anon
using (true)
with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.players to anon;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists players_updated_at on public.players;
create trigger players_updated_at
before update on public.players
for each row execute function public.set_updated_at();
