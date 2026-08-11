# CHANGELOG

## v6.3.0 — Datos del partido, convocatoria por WhatsApp y asistencia del día

**Ejecuta `supabase/add_match_venue.sql`** antes de publicar: añade las columnas `venue` y `auto_date` a `activities` (y reasegura `opponent`, `activity_time` y `home_away`). No borra datos.

### Partidos
- La tabla `activities` ya tenía `opponent`, `activity_time` y `home_away` desde la v6.0.3, pero **no existía ninguna pantalla para rellenarlas**: Inicio intentaba mostrar "vs [rival]" y nunca podía, y todos los partidos se guardaban como "en casa". Ahora se editan desde la propia convocatoria, junto con el nuevo campo `venue` (nombre del campo).
- **Los partidos se pueden mover de día**: la fecha es editable desde la convocatoria, así que un partido puede pasar al viernes, al domingo o a entre semana. Nueva columna `auto_date`, que recuerda el sábado que generó cada partido, para que el generador automático **no vuelva a crear un partido en el sábado que has dejado libre**. Antes de este cambio no había ninguna forma de mover un partido.
- Nuevo botón **"Nuevo partido"** en Calendario y Convocatorias para dar de alta amistosos, torneos o partidos entre semana en cualquier fecha. Se crean con `auto_date` nulo, así que no ocupan ningún sábado ni impiden que se genere el partido de liga de esa semana.
- Rival, hora, casa/fuera y campo se muestran en el Calendario (la píldora del partido pasa de "Partido" a "C.D. Ejemplo · 10:30"), en la lista de Convocatorias y en la tarjeta de Inicio.
- Nuevo botón **"Copiar convocatoria"**: genera el texto del partido con la lista de convocados y lo copia al portapapeles para pegarlo en WhatsApp. Solo lista a los convocados, no a quienes se quedan fuera.
- Contador de convocados en vivo dentro del modal (`N convocados` / `N de M asisten` en entrenamientos).
- Al guardar, si algo falla en la base de datos ahora se avisa con el mensaje real en vez de fallar en silencio.

### Asistencia y Convocatorias
- Nueva tarjeta destacada arriba con la actividad de **hoy** y su botón directo de asistencia/convocatoria. Si hoy no hay nada, muestra la **próxima actividad**.
- El filtro "Desde" **arranca en la fecha de hoy**: corrige que, al ordenar de más antigua a más nueva desde la v6.1.0, las actividades pasadas fueran acumulándose al principio de la lista según avanzaba la temporada. Botón "Ver también las pasadas" para el histórico completo.
- La fila de hoy queda resaltada en la lista.

### Calendario
- El día de hoy se marca con recuadro azul y número resaltado en la cuadrícula, y con fondo y etiqueta "Hoy" en la lista de móvil.

## v6.2.0 — Copiar y pegar sesiones + versión móvil

No requiere ninguna query SQL nueva.

### Copiar y pegar
- Antes, "Copiar" creaba la copia encima de la misma fecha, por eso parecía que no se podía pegar. Ahora **"Copiar" deja la sesión en un portapapeles**: aparece una barra amarilla arriba indicando qué hay copiado, y botones **"Pegar aquí"** en todos los huecos libres, tanto en Planificación como en Calendario.
- El portapapeles se comparte entre pantallas: puedes copiar en Planificación y pegar en Calendario (o al revés). Se puede pegar tantas veces como quieras hasta pulsar "Cancelar".
- Botón **"Pegar en fecha…"** en la barra: abre un selector para pegar en cualquier fecha, aunque esa semana todavía no exista en la planificación.
- Nuevo botón **"Copiar semana"** en cada fila: copia las dos sesiones (A y B) de golpe y las pega en otra semana respetando martes/miércoles.
- Al pegar, la sesión se renombra sola según su nueva semana (`Semana N · Sesión A/B`), se copian sus ejercicios, objetivo, notas de porteros y observaciones, y se crea siempre como "pendiente".
- No se puede pegar encima de una sesión que ya existe: ese hueco simplemente no ofrece el botón, y si se fuerza por fecha avisa en vez de duplicar.

### Móvil
- **Calendario en lista vertical**: en el móvil deja de ser una cuadrícula con scroll lateral y pasa a ser una lista de semanas con sus días, entrenamientos y partidos. Solo aparecen los días con algo (entrenamiento, partido o hueco de entrenamiento libre).
- Ninguna pantalla se sale ya de ancho en el móvil (verificado en las 10 secciones).
- Las tablas de **Asistencia/Convocatorias** y **Jugadores** se convierten en tarjetas apiladas, legibles sin scroll horizontal.
- Los **modales** (editor de sesión, asistencia, vista previa, biblioteca) se abren a pantalla completa.
- Botones con área táctil mayor en toda la app; corregido que en las tarjetas de sesión los botones "Completar" y eliminar quedaban cortados fuera de la tarjeta.
- Los campos de formulario usan 16 px en móvil para que iOS no haga zoom automático al escribir.
- El menú lateral se cierra solo al elegir una sección.

### Otros
- El Calendario se abre por defecto en el mes actual (o en el del inicio de entrenamientos si la temporada aún no ha empezado), en vez de siempre en septiembre de 2026.
- Corregido el título del mes, que se veía como "Septiembre De 2026".

## v6.1.1 — Nombre de sesión automático y número correlativo

- El campo "Título" de cada sesión desaparece del editor: ya no se puede escribir a mano, para evitar que quede desincronizado con la semana real (el caso de "Semana 1 · Sesión A" apareciendo en la fila de la Semana 2).
- El nombre de cada sesión se calcula siempre automáticamente a partir de su fecha real y de si es Sesión A o B: `Semana N · Sesión A/B`, donde N es la semana real respecto al inicio de entrenamientos configurado. El primer entrenamiento de la temporada es siempre "Semana 1" (Sesión A o B según caiga en martes o miércoles); el resto sigue la misma numeración de semana que ya se ve en la fila de Planificación y en Calendario.
- Este nombre calculado se usa también en la ficha ampliada, en la vista previa/impresión A4, en el aviso de "Próxima sesión" de Inicio y en el nombre de la actividad que ven Asistencia/Convocatorias — todo coherente entre sí.
- Nuevo contador "Nº sesión" en cada tarjeta de Planificación e Histórico: numeración correlativa (1, 2, 3…) de todas las sesiones de la temporada por orden de fecha, empezando por la primera sesión creada.

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
