# Programación Benjamín C · Versión 6.3.0

Rediseño centrado en uso diario rápido y compacto.

## Antes de publicar la 6.3.0

**Ejecuta `supabase/add_match_venue.sql`** en el SQL Editor de Supabase (seguro, no borra datos): añade a la tabla `activities` las columnas `venue` (campo donde se juega) y `auto_date` (el sábado que generó cada partido, para poder moverlos de día sin duplicados). Sin esta query, al guardar una convocatoria te avisará de que faltan columnas.

## Cambios en 6.3.0 (sobre 6.2.0)

### Datos del partido y convocatoria por WhatsApp

Al abrir la **convocatoria** de un partido ahora puedes rellenar **fecha, rival, hora, si se juega en casa o fuera, y el nombre del campo**. Esos datos aparecen luego en el Calendario, en la lista de Convocatorias y en la pantalla de Inicio.

### Mover un partido de día y añadir partidos sueltos

Si un partido se juega el domingo en vez del sábado, o se adelanta al viernes, **cambia la fecha en su convocatoria y guarda**. El partido se mueve y el sábado que deja libre **no se vuelve a rellenar solo**: la app recuerda de qué sábado venía.

Con el botón **"Nuevo partido"** (en Calendario y en Convocatorias) puedes crear un partido en cualquier día — un amistoso, un torneo, un partido entre semana. Estos son independientes: no ocupan ni sustituyen al partido de liga que la app genera ese sábado.

El botón **"Copiar convocatoria"** genera el mensaje ya montado y lo copia al portapapeles para pegarlo en el grupo de WhatsApp:

```
⚽ CONVOCATORIA · BENJAMÍN C
Sábado, 19 de septiembre
vs C.D. Ejemplo (fuera)
Hora: 10:30
Campo: Municipal Norte

Convocados (11):
1 · Álvaro Ruiz
4 · Marcos Díaz
...
```

El mensaje lista **solo a los convocados**, a propósito: es un grupo de familias de niños y no parece buena idea publicar quién se ha quedado fuera.

El modal muestra además un **contador de convocados** en vivo, útil para no pasarte de los que caben en un fútbol 7.

### Asistencia más rápida

- Arriba del todo hay una tarjeta **"Hoy"** con la sesión o el partido del día y su botón directo. Si hoy no hay nada, muestra la **próxima actividad**.
- El filtro **"Desde" arranca en la fecha de hoy**, así las actividades pasadas ya no encabezan la lista según avanza la temporada. Con "Ver también las pasadas" recuperas el histórico completo.

### Calendario

- El **día de hoy** se marca con un recuadro azul y el número resaltado (y con la etiqueta "Hoy" en la vista de móvil).
- Los partidos muestran el rival y la hora en lugar de un genérico "Partido".

## Cambios en 6.2.0 (sobre 6.1.1)

**No hace falta ejecutar ninguna query SQL nueva.**

### Copiar y pegar sesiones

1. Pulsa **"Copiar"** en cualquier sesión. Aparece una barra arriba con lo que has copiado.
2. Pulsa **"Pegar aquí"** en el hueco donde la quieras: aparecen en los huecos libres de Planificación y también en el Calendario.
3. Puedes pegar varias veces seguidas. Cuando termines, pulsa **"Cancelar"** en la barra.

También puedes usar **"Pegar en fecha…"** para pegar en cualquier fecha (útil si esa semana todavía no tiene ninguna sesión), y **"Copiar semana"** para llevarte las dos sesiones de una semana (A y B) a otra semana de golpe.

Al pegar, la sesión se renombra sola según su nueva semana y se copian sus ejercicios, objetivo y notas. Nunca se pega encima de una sesión que ya existe.

### Uso desde el móvil

- El Calendario se ve como una lista de semanas y días, sin desplazamiento lateral.
- Las tablas de Asistencia, Convocatorias y Jugadores se ven como tarjetas apiladas.
- Los modales (editor de sesión, asistencia, biblioteca) se abren a pantalla completa.
- Botones más grandes y campos que no provocan zoom automático en iPhone.

## Cambios en 6.1.1 (sobre 6.1.0)

- El "Título" de cada sesión ya no es un campo editable: el nombre se calcula solo (`Semana N · Sesión A/B`) a partir de la fecha real y de si es A o B, para que nunca quede desincronizado con la semana que le corresponde.
- Cada sesión muestra ahora un número correlativo "Nº sesión" (1, 2, 3…) por orden de fecha, empezando en la primera sesión de la temporada.
- No requiere ninguna query SQL nueva sobre la 6.1.0.

## Antes de publicar la 6.1.0

**Ejecuta primero `supabase/add_season_dates.sql`** en el SQL Editor de Supabase (seguro, no borra datos): añade a la tabla `teams` las columnas `training_start_date` y `match_start_date` que usan las nuevas fechas de temporada. Sin esta query, el panel "Fechas de la temporada" de Planificación no podrá guardar ni cargar nada.

## Cambios en 6.1.0 (sobre 6.0.3)

- Planificación tiene un nuevo panel plegable **"Fechas de la temporada"** con dos fechas independientes:
  - *Inicio de entrenamientos*: define qué semana es la "Semana 1" en Planificación y Calendario.
  - *Inicio de partidos*: define desde cuándo se generan automáticamente los partidos de los sábados. No afecta a la numeración de semanas.
- Planificación → pestaña Temporada tiene un nuevo panel plegable **"Mesociclos"** para editar los mesociclos existentes (nombre, objetivos, fechas) y añadir nuevos más allá de los 3 iniciales, sin crear una franja fija siempre visible.
- Calendario e Inicio (Dashboard) usan ahora la fecha de inicio de entrenamientos configurada para calcular la semana actual, en vez del 1 de septiembre fijo.
- Asistencia y Convocatorias muestran primero las fechas más próximas (antes aparecían las más lejanas primero) y tienen un filtro "Desde" por fecha.

## Despliegue alternativo en Vercel (además de Netlify)

Se ha añadido `vercel.json` para poder alojar la app en [Vercel](https://vercel.com) (plan Hobby, gratuito) mientras Netlify esté bloqueado por límite de créditos, o de forma permanente si se prefiere.

Pasos:

1. Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. "Add New..." → "Project" → selecciona el repositorio de este proyecto.
3. Vercel detecta automáticamente que es un proyecto Vite (build command `npm run build`, output `dist`); no hace falta tocar nada, `vercel.json` ya lo deja configurado.
4. En "Environment Variables" añade las mismas que tienes en Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_TEAM_ID`
5. "Deploy". Cada push a GitHub desplegará automáticamente, igual que con Netlify.

Puedes tener Netlify y Vercel conectados al mismo repositorio a la vez sin conflicto (cada uno tiene su propia URL); cuando decidas cuál usar de forma definitiva, puedes desconectar el otro.

## Cambios en 6.0.3 (sobre 6.0.2)

- Diagnóstico confirmado: la tabla `activities` en tu Supabase real tenía un esquema antiguo/incompleto (le faltaba, entre otras, la columna `home_away`) porque `create table if not exists` no añade columnas a una tabla que ya existe.
- **Ejecuta `supabase/fix_schema_activities.sql`** en el SQL Editor: añade las columnas que falten sin tocar tus datos, y es seguro repetirlo.
- El botón "Asistencia" ahora muestra el error real de Supabase si algo falla, en vez de un mensaje genérico.

## Cambios en 6.0.2 (sobre 6.0.1)

- Los fallos al hablar con Supabase (partidos automáticos, abrir asistencia) ahora se muestran en pantalla o como alerta, en vez de no hacer nada.
- Script `supabase/fix_dias_sesion.sql` para revisar y mover a martes/miércoles las sesiones que quedaron creadas en lunes/jueves por error.
- Si los partidos de los sábados no aparecen en el Calendario, o el botón "Asistencia" de una sesión no abre nada: vuelve a ejecutar `supabase/fase5_asistencia.sql` (es seguro repetirlo) para asegurar que la tabla `activities`/`attendance` y sus permisos existen correctamente, y revisa el aviso en rojo que ahora aparece en Calendario/Convocatorias si algo sigue fallando.

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

No hace falta ejecutar ninguna query nueva de esquema para pasar de 6.0.1 a 6.0.2. Sí conviene:

1. Volver a ejecutar `supabase/fase5_asistencia.sql` (seguro, no borra datos) si los partidos o la asistencia no funcionaban.
2. Revisar y, si aplica, ejecutar `supabase/fix_dias_sesion.sql` para corregir sesiones en lunes/jueves.

Después sube todos los archivos al repositorio de GitHub y haz commit:

`Versión 6.0.2: errores visibles + fix de días de sesión`


## Identidad de la aplicación

En la esquina inferior izquierda del menú se muestra de forma discreta, a 9 px: Programación Benjamín C · v6.3.0 · Desarrollado por José A. Herrera.
