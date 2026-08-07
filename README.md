# Programación Benjamín C · Versión 6.0.3

Rediseño centrado en uso diario rápido y compacto.

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

En la esquina inferior izquierda del menú se muestra de forma discreta, a 9 px: Programación Benjamín C · v6.0.3 · Desarrollado por José A. Herrera.
