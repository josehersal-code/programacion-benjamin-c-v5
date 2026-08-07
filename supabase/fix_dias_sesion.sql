-- FIX: mover a martes/miércoles las sesiones creadas por error en lunes/jueves
-- Ejecuta primero el SELECT para revisar qué filas se van a mover.
-- Si la lista tiene sentido, ejecuta después los dos UPDATE.
-- Es seguro repetir esto: si ya no queda ninguna sesión en lunes/jueves, no hace nada.

-- 1) Vista previa (no modifica nada)
select id, session_date, kind, title,
       case extract(dow from session_date)
         when 1 then 'lunes'
         when 4 then 'jueves'
       end as dia_actual
from public.sessions
where (kind = 'A' and extract(dow from session_date) = 1)  -- Sesión A en lunes -> debe ir a martes
   or (kind = 'B' and extract(dow from session_date) = 4)  -- Sesión B en jueves -> debe ir a miércoles
order by session_date;

-- 2) Mover Sesión A de lunes a martes (+1 día)
update public.sessions
set session_date = session_date + 1
where kind = 'A' and extract(dow from session_date) = 1;

-- 3) Mover Sesión B de jueves a miércoles (-1 día)
update public.sessions
set session_date = session_date - 1
where kind = 'B' and extract(dow from session_date) = 4;

-- 4) Comprobación final: no debería devolver ninguna fila
select id, session_date, kind
from public.sessions
where (kind = 'A' and extract(dow from session_date) <> 2)
   or (kind = 'B' and extract(dow from session_date) <> 3);
