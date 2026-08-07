-- NUEVO: fechas de temporada configurables desde Planificación
--
-- Añade a "teams" las dos fechas que ahora se pueden editar desde la app:
--   - training_start_date: inicio de entrenamientos → esa semana es la "Semana 1"
--     de Planificación y Calendario.
--   - match_start_date: inicio de partidos → a partir de esa fecha se generan
--     automáticamente los partidos de los sábados. NO afecta a la numeración
--     de semanas (son dos fechas totalmente independientes).
--
-- Seguro de ejecutar varias veces: no borra ni modifica datos existentes,
-- solo añade las columnas si no existen y rellena el equipo actual con el
-- valor por defecto que ya usaba la app (1 de septiembre de 2026) si están vacías.

alter table public.teams add column if not exists training_start_date date;
alter table public.teams add column if not exists match_start_date date;

update public.teams
set training_start_date = coalesce(training_start_date, '2026-09-01'),
    match_start_date = coalesce(match_start_date, '2026-09-01');

notify pgrst, 'reload schema';

-- Comprobación final
select id, training_start_date, match_start_date from public.teams;
