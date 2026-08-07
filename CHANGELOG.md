# CHANGELOG

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
