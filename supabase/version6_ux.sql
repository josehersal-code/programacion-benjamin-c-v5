-- VERSION 6.0 · REDISEÑO UX
-- Añade únicamente el estado de las sesiones. El resto reutiliza las tablas actuales.

alter table public.sessions
add column if not exists status text not null default 'planned';

update public.sessions set status='planned' where status is null;

-- Valores admitidos a nivel de aplicación: planned / completed.
-- Mantenemos activities y attendance como en la v5.6.
