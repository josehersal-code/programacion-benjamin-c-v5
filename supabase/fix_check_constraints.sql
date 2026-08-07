-- FIX: las restricciones CHECK reales de 'activities' (y 'attendance') no coinciden
-- con los valores que usa la app.
--
-- Error visto: new row for relation "activities" violates check constraint
-- "activities_status_check"
--
-- Mismo patrón que con la columna 'home_away': la tabla ya existía con restricciones
-- de una versión anterior del esquema. Este script las sustituye por las que espera
-- la app actual. No borra ni modifica ninguna fila existente.

-- 1) Diagnóstico (opcional): restricciones CHECK que tienen ahora mismo estas tablas
select conrelid::regclass as tabla, conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid in ('public.activities'::regclass, 'public.attendance'::regclass)
  and contype = 'c';

-- 2) Diagnóstico (opcional): valores que hay guardados ahora mismo (por si alguno
--    no encajara luego con la restricción nueva)
select 'activities.status' as columna, status as valor, count(*) from public.activities group by status
union all
select 'activities.type', type, count(*) from public.activities group by type
union all
select 'attendance.status', status, count(*) from public.attendance group by status;

-- 3) Sustituye la restricción de 'activities.status' por la que espera la app
alter table public.activities drop constraint if exists activities_status_check;
alter table public.activities
  add constraint activities_status_check
  check (status in ('planned','completed','cancelled','postponed'));

-- 4) Sustituye la restricción de 'activities.type'
alter table public.activities drop constraint if exists activities_type_check;
alter table public.activities
  add constraint activities_type_check
  check (type in ('training','match'));

-- 5) Sustituye la restricción de 'attendance.status' (por si tiene el mismo problema)
alter table public.attendance drop constraint if exists attendance_status_check;
alter table public.attendance
  add constraint attendance_status_check
  check (status in ('present','absent','called_up','not_called_up','unavailable'));

-- 6) Refresca la caché de esquema
notify pgrst, 'reload schema';

-- 7) Comprobación final: deberías ver las 3 restricciones con los valores de arriba
select conrelid::regclass as tabla, conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where conrelid in ('public.activities'::regclass, 'public.attendance'::regclass)
  and contype = 'c';
