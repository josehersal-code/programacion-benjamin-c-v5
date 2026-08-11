-- NUEVO (v6.3.0): datos del partido editables y partidos que se pueden mover de día
--
-- La tabla 'activities' ya tenía 'opponent' (rival), 'activity_time' (hora) y
-- 'home_away' (casa/fuera) desde fix_schema_activities.sql, pero no había
-- ninguna pantalla para rellenarlas. En la v6.3.0 se editan desde la
-- convocatoria, y se añaden dos columnas nuevas:
--
--   venue      → nombre del campo o instalación donde se juega.
--   auto_date  → el sábado que generó ese partido automáticamente.
--                Sirve para que, si mueves el partido al viernes o al domingo,
--                la app NO vuelva a crear un partido en el sábado que dejaste
--                libre. Los partidos que añadas a mano (amistosos, torneos)
--                tienen auto_date nulo y no afectan a la generación automática.
--
-- Seguro de ejecutar varias veces: no borra ni modifica ningún dato existente.

alter table public.activities add column if not exists venue text;
alter table public.activities add column if not exists auto_date date;

-- Por si alguna de las otras columnas faltara todavía en tu base de datos
alter table public.activities add column if not exists opponent text;
alter table public.activities add column if not exists activity_time time;
alter table public.activities add column if not exists home_away text;

-- Todos los partidos que existen ahora mismo los generó la app en su sábado
-- (hasta esta versión no había forma de crear uno a mano), así que fijamos
-- su auto_date a la fecha que tienen. Solo afecta a los que aún no lo tengan.
update public.activities
set auto_date = activity_date
where type = 'match' and auto_date is null;

-- Refresca la caché de esquema para que la app vea las columnas al momento
notify pgrst, 'reload schema';

-- Comprobación: deberías ver las cinco columnas
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'activities'
  and column_name in ('opponent','activity_time','home_away','venue','auto_date')
order by column_name;
