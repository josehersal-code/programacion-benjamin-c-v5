-- FIX: repara el esquema real de 'activities' (y 'attendance') en tu proyecto.
--
-- Causa del error "Could not find the 'home_away' column of 'activities' in the
-- schema cache": la tabla 'activities' ya existía en tu Supabase con un esquema
-- más antiguo/incompleto. `create table if not exists` (usado en fase5_asistencia.sql)
-- NO añade columnas a una tabla que ya existe, así que columnas nuevas como
-- 'home_away' o 'session_id' nunca llegaron a crearse.
--
-- Este script SÍ añade las columnas que falten, con ADD COLUMN IF NOT EXISTS:
-- es seguro de ejecutar cualquier número de veces y no borra ni modifica
-- ninguna fila existente.

-- 1) Diagnóstico (opcional): columnas que tiene 'activities' ahora mismo
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'activities'
order by ordinal_position;

-- 2) Añade las columnas que puedan faltar en 'activities'
alter table public.activities add column if not exists session_id uuid references public.sessions(id) on delete set null;
alter table public.activities add column if not exists activity_time time;
alter table public.activities add column if not exists opponent text;
alter table public.activities add column if not exists home_away text;
alter table public.activities add column if not exists status text default 'planned';
alter table public.activities add column if not exists created_at timestamptz default now();
alter table public.activities add column if not exists updated_at timestamptz default now();

-- 3) Añade las columnas que puedan faltar en 'attendance'
alter table public.attendance add column if not exists created_at timestamptz default now();

-- 4) Reafirma los permisos de acceso sin login (por si la política no se llegó a crear)
alter table public.activities enable row level security;
alter table public.attendance enable row level security;

drop policy if exists "anon activities" on public.activities;
create policy "anon activities" on public.activities for all to anon using (true) with check (true);

drop policy if exists "anon attendance" on public.attendance;
create policy "anon attendance" on public.attendance for all to anon using (true) with check (true);

grant select, insert, update, delete on public.activities, public.attendance to anon;

-- 5) Fuerza a Supabase a refrescar la caché de esquema (si no, puede tardar ~1 min sola)
notify pgrst, 'reload schema';

-- 6) Comprobación final: deberías ver todas las columnas de arriba, incluida 'home_away'
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'activities'
order by ordinal_position;
