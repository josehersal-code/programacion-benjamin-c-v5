-- FASE 1: columna opcional para favoritos.
-- Ejecutar una sola vez en Supabase > SQL Editor.
alter table public.exercises
add column if not exists favorite boolean not null default false;
