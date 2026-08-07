# CHANGELOG

## v6.1.0 — Fechas de temporada configurables, mesociclos editables y orden de asistencia

- **Ejecuta primero `supabase/add_season_dates.sql`** en el SQL Editor: añade a `teams` las columnas `training_start_date` y `match_start_date` (rellenadas por defecto con 1 de septiembre de 2026). Sin esta query, Planificación no podrá cargar ni guardar las nuevas fechas.
- Planificación → nuevo panel plegable "Fechas de la temporada" con dos campos independientes:
  - **Inicio de entrenamientos**: esa semana pasa a ser la "Semana 1" tanto en Planificación como en Calendario (sustituye a la fecha fija de 1 de septiembre que causaba el desajuste "Sem 3" en sesiones tituladas "Semana 1").
  - **Inicio de partidos**: fecha a partir de la cual se generan automáticamente los partidos de los sábados. Es totalmente independiente de la anterior: cambiarla no afecta a la numeración de semanas.
- Planificación → pestaña Temporada: nuevo panel plegable "Mesociclos" con la lista de mesociclos existentes (se puede pulsar cada uno para editar nombre/objetivos/fechas) y un botón "Nuevo mesociclo" para añadir más de los 3 iniciales. Sigue sin haber una franja fija siempre visible: todo queda dentro de un desplegable, integrado en Planificación.
- Calendario: la numeración de semanas y el rango de martes/miércoles de entrenamiento ahora usan la fecha de inicio de entrenamientos configurada (antes usaban siempre el 1 de septiembre fijo); los partidos automáticos de los sábados usan la fecha de inicio de partidos configurada.
- Inicio (Dashboard): el KPI "Semana actual" usa también la fecha de inicio de entrenamientos configurada, para ser coherente con Planificación y Calendario.
- Asistencia y Convocatorias: se invierte el orden de la tabla para mostrar primero las fechas más próximas y al final las más lejanas; se añade un filtro "Desde" (fecha) para acotar el listado.
- Asistencia: se corrige un fallo por el que la generación automática de partidos de los sábados ignoraba la fecha de inicio de partidos configurada.

## Nota (sin cambio de código) — Restricciones CHECK de 'activities'/'attendance'

- Tras desplegar en Vercel, apareció "new row for relation "activities" violates check constraint "activities_status_check"": las restricciones CHECK reales de `status`/`type` en Supabase eran de un esquema anterior y no coincidían con los valores que usa la app.
- Nuevo `supabase/fix_check_constraints.sql`: sustituye esas restricciones por las correctas (`planned/completed/cancelled/postponed` para `activities.status`, `training/match` para `activities.type`, y el equivalente en `attendance.status`). No borra datos; incluye diagnóstico previo por si algún dato existente no encajase.

## v6.0.3 — Reparación real del esquema de 'activities'

- Diagnóstico confirmado con el error de Supabase "Could not find the 'home_away' column of 'activities' in the schema cache": la tabla `activities` ya existía con un esquema antiguo/incompleto, y `create table if not exists` (fase5_asistencia.sql) no añade columnas a una tabla ya existente.
- Nuevo `supabase/fix_schema_activities.sql`: añade con `ADD COLUMN IF NOT EXISTS` las columnas que puedan faltar (`session_id`, `activity_time`, `opponent`, `home_away`, `status`, `created_at`, `updated_at`), reafirma las políticas de acceso y fuerza el refresco de la caché de esquema. Seguro de ejecutar varias veces, no borra datos.
- El botón "Asistencia" ahora muestra el mensaje de error real de Supabase cuando falla, en vez de un aviso genérico, para poder diagnosticar de un vistazo si algo más está mal.

## v6.0.2 — Corrección de partidos, asistencia y días de sesión

- Los errores de sincronización con Supabase (partidos automáticos, apertura de asistencia) ya no fallan en silencio: ahora se muestran como aviso en pantalla (Calendario/Convocatorias) o como alerta al pulsar el botón, con el mensaje real de la base de datos.
- Botón "Asistencia" de cada sesión: si no puede abrir o crear el registro de actividad, avisa con el motivo en vez de no hacer nada.
- Ver `supabase/fix_dias_sesion.sql`: consulta para revisar y, si procede, mover a martes/miércoles las sesiones que se crearon por error en lunes/jueves.
- Si los partidos automáticos de los sábados o el botón de asistencia seguían sin funcionar antes de esta versión, vuelve a ejecutar `supabase/fase5_asistencia.sql` en el SQL Editor (es seguro re-ejecutarlo, no borra datos) para asegurarte de que la tabla `activities`/`attendance` y sus permisos están bien creados.

## v6.0.1 — Integración de mesociclos y calendario automático

- Los mesociclos dejan de tener un apartado independiente en Planificación: se gestionan (crear/editar) directamente desde el editor de sesión, sin franja propia.
- Dashboard de Inicio actualizado: temporada, semana actual, próxima sesión, próximo partido, ejercicios, jugadores, sesiones creadas, sesiones realizadas y asistencia media.
- Calendario: los martes y miércoles de toda la temporada aparecen automáticamente como entrenamientos (aunque aún no exista la sesión); al pulsarlos se abre directamente la sesión (o su creación, si no existe todavía).
- Calendario: cada fila de semanas muestra su número ("Sem N"), igual que en Planificación.
- Numeración de semanas de Planificación y Calendario basada en el inicio real de temporada (1 de septiembre de 2026), no en la primera sesión creada.
- Limpieza de archivos obsoletos de la v5 sueltos en la raíz del proyecto (no se usaban en el build).
- Versión de la aplicación actualizada a 6.0.1.

## v6.0 — Rediseño UX

- Interfaz general más compacta y profesional.
- Menú lateral reducido y cabecera superior simplificada.
- Inicio con indicadores reales de Supabase.
- Planificación semanal con sesiones A/B en la misma fila.
- Mesociclos integrados en Planificación.
- Sesiones completadas pasan al histórico.
- Calendario simplificado a entrenamientos y partidos.
- Partidos de sábado con gestión de convocatoria.
- Jugadores en formato tabla compacto.
- Asistencia basada en sesiones y partidos existentes.
- Convocatorias con todos los jugadores convocados por defecto.
- Biblioteca más compacta.
- Copia de sesiones, impresión A4 y reorganización de ejercicios.
- Identificación lateral discreta a 9 px: Programación Benjamín C · v6.0 · Desarrollado por José A. Herrera.
