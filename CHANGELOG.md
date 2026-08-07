# CHANGELOG

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
