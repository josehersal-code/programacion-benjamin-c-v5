-- FASE 5: ASISTENCIA A ENTRENAMIENTOS Y CONVOCATORIAS
-- Ejecutar una sola vez en Supabase > SQL Editor.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  activity_date date not null,
  activity_time time,
  type text not null check (type in ('training','match')),
  title text not null,
  opponent text,
  home_away text check (home_away in ('home','away') or home_away is null),
  status text not null default 'planned'
    check (status in ('planned','completed','cancelled','postponed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text not null check (
    status in ('present','absent','called_up','not_called_up','unavailable')
  ),
  created_at timestamptz not null default now(),
  unique(activity_id,player_id)
);

alter table public.activities enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "authenticated activities" on public.activities;
drop policy if exists "authenticated attendance" on public.attendance;
drop policy if exists "anon activities" on public.activities;
drop policy if exists "anon attendance" on public.attendance;

create policy "anon activities"
on public.activities
for all
to anon
using (true)
with check (true);

create policy "anon attendance"
on public.attendance
for all
to anon
using (true)
with check (true);

grant select,insert,update,delete on public.activities,public.attendance to anon;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists activities_updated_at on public.activities;
create trigger activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();
