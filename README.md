# Programación Benjamín C · Versión 6.0.1

Rediseño centrado en uso diario rápido y compacto.

## Cambios en 6.0.1 (sobre 6.0)

- Mesociclos sin apartado independiente: se crean y editan desde el propio editor de sesión, integrados en Planificación.
- Dashboard de Inicio con: temporada, semana actual, próxima sesión, próximo partido, ejercicios, jugadores, sesiones creadas, sesiones realizadas y asistencia media.
- Calendario con entrenamientos automáticos todos los martes y miércoles de la temporada (se puede crear la sesión directamente pulsando el hueco), y numeración de semana ("Sem N") igual que en Planificación.
- Limpieza de archivos sueltos de la v5 que no se usaban en el build.

## Cambios principales (v6.0)

- Barra lateral más estrecha y navegación compacta.
- Cabecera superior reducida y deja de ser fija.
- Inicio convertido en panel útil con datos reales de Supabase.
- Planificación y mesociclos agrupados.
- Vista semanal ascendente con sesiones A/B en una misma fila.
- Botón Completar: mueve automáticamente la sesión al Histórico.
- Calendario sin mesociclos: solo entrenamientos y partidos.
- Partidos automáticos todos los sábados; se pueden marcar como "sin partido".
- Convocatoria directamente desde el partido.
- Jugadores en tabla compacta.
- Asistencia sin "Nueva actividad": deriva de sesiones y partidos existentes.
- Todos los jugadores aparecen presentes/convocados por defecto.
- Convocatorias con Convocado / No convocado / No puede asistir.
- Biblioteca más visual, compacta, con imágenes mayores y duplicado rápido.
- Editor de sesiones compacto; permite intercambiar ejercicios arrastrando entre bloques.
- Vista previa e impresión A4.
- Análisis compacto.

## Antes de publicar

No hace falta ejecutar ninguna query nueva en Supabase para pasar de 6.0 a 6.0.1 (no hay cambios de esquema; los mesociclos siguen usando las mismas tablas de siempre).

Si vienes directamente desde v5.x, ejecuta una vez en Supabase:

`supabase/version6_ux.sql`

Después sube todos los archivos al repositorio de GitHub y haz commit:

`Versión 6.0.1: mesociclos integrados y calendario automático`


## Identidad de la aplicación

En la esquina inferior izquierda del menú se muestra de forma discreta, a 9 px: Programación Benjamín C · v6.0.1 · Desarrollado por José A. Herrera.
