# Engineering Workflow

Este documento define el flujo base para trabajar el producto como un SaaS en produccion. La meta es proteger `main`, ordenar cambios incrementales y preparar hardening sin modificar comportamiento productivo de forma accidental.

## Arquitectura actual

- Framework: Next.js App Router con React 19 y TypeScript.
- UI: Tailwind CSS, componentes propios y `lucide-react` para iconografia.
- Backend app: Server Components, Server Actions y Route Handlers bajo `app/`.
- Datos: Supabase Auth, Postgres, RLS y Supabase Storage.
- Cliente Supabase: `lib/supabase/client.ts`, `lib/supabase/server.ts` y `lib/supabase/middleware.ts`.
- Env actual: `lib/supabase/env-client.ts` y `lib/supabase/env-server.ts` validan las variables publicas de Supabase.
- Dominio principal: `lib/engines/*` contiene auth, catalog, commerce, learning y branding.
- Cursos recientes: `lib/courses/*` concentra admin de cursos, ownership, media, repositorio y actions.
- Base de datos: `supabase/migrations/*` contiene migrations incrementales con RLS, vistas y storage policies.
- Rutas principales: `/admin/cursos`, `/learn/[courseId]`, `/cursos`, `/cursos/[slug]`, `/admin/pagos`.

## Convencion de branches

- `main`: produccion. Solo recibe merges aprobados desde PRs estables.
- `develop`: integracion. Base recomendada para features que aun no deben tocar produccion.
- `feature/<scope>`: cambios funcionales o documentacion incremental.
- `fix/<scope>`: bugfixes no urgentes contra `develop` o contra `main` si son hotfix.
- `hotfix/<scope>`: correcciones urgentes desde `main`, con PR a `main` y back-merge posterior a `develop`.
- `release/<version>`: estabilizacion de un paquete de cambios antes de produccion.
- `chore/<scope>`: mantenimiento sin cambio funcional.

Usar nombres en kebab-case, cortos y descriptivos: `feature/course-media-system`, `fix/enrollment-rls`, `chore/update-engineering-docs`.

## Flujo Git recomendado

1. Actualizar `develop` desde `main` cuando se inicia una fase nueva.
2. Crear una rama `feature/*` desde `develop`.
3. Hacer commits pequenos, revisables y con un solo objetivo.
4. Abrir PR de `feature/*` hacia `develop`.
5. Validar lint, typecheck, build y revision de seguridad cuando aplique.
6. Mergear a `develop` solo despues de revision.
7. Crear `release/*` desde `develop` para estabilizacion.
8. Abrir PR de `release/*` hacia `main`.
9. Despues del merge a `main`, taggear release y sincronizar `develop`.

No usar merges automaticos para cambios de producto. Auto-merge solo puede habilitarse en PRs de mantenimiento trivial y con checks obligatorios activos.

## Naming conventions

- Rutas App Router: usar nombres publicos legibles y parametros claros: `/learn/[courseId]`, `/cursos/[slug]`.
- Server Actions: sufijo `Action`, verbo imperativo y scope explicito: `createLessonResourceAction`, `revokeEnrollmentAction`.
- Services/helpers: verbo de dominio: `checkCourseAccess`, `enrollUserToCourse`, `deleteMedia`.
- Repositories: funciones orientadas a persistencia: `getCourseContent`, `updateLessonDetails`.
- Types: entidades en PascalCase: `CourseContent`, `LessonResource`, `CoursePlayerExperience`.
- DB columns: snake_case, explicitas y compatibles con Supabase/Postgres.
- Buckets: kebab-case y por dominio: `course-thumbnails`, `lesson-resources`, `lesson-media`.
- Env vars: upper snake case. Solo exponer con `NEXT_PUBLIC_` lo estrictamente publico.

## Reglas para migrations

- Una migration por PR o por feature coherente.
- Nombre con timestamp monotono y descripcion: `YYYYMMDDHHMMSS_feature_name.sql`.
- Toda tabla expuesta debe evaluar RLS antes de llegar a produccion.
- Preferir `add column if not exists`, `create policy` con `drop policy if exists` cuando se necesite idempotencia controlada.
- No modificar migrations ya aplicadas; crear una migration nueva.
- Las vistas publicas deben usar `security_invoker = true` salvo excepcion justificada.
- Agregar constraints defensivos para status, tipos y tamanos.
- Revisar grants para `anon`, `authenticated` y service roles cuando aplique.
- Incluir rollback manual documentado en el PR si el cambio toca datos criticos.
- No mezclar cambios de schema con refactors UI grandes en el mismo PR.

## Reglas para storage buckets

- Crear buckets desde migrations, no manualmente desde dashboard salvo emergencia documentada.
- Definir `public`, `file_size_limit` y `allowed_mime_types` explicitamente.
- Separar buckets por nivel de exposicion y dominio funcional.
- Los objetos privados deben leerse via signed URLs o endpoint con validacion de acceso.
- La estructura recomendada de path es `userId/courseId/scope/fileId.ext`.
- Toda policy de Storage debe validar owner/admin/enrollment segun el caso.
- Nunca guardar secretos en paths ni metadata publica.
- Delete/replace debe borrar storage y limpiar referencia en DB en una accion transaccional o compensada.

## Convencion de env vars

- Centralizar lectura de env en `lib/config/*` como siguiente paso de hardening.
- Mantener `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` como publicas.
- Toda variable server-only debe evitar el prefijo `NEXT_PUBLIC_`.
- Validar env al inicio mediante Zod o validadores existentes, sin agregar librerias nuevas.
- Documentar cada variable en `.env.example` con nombre, obligatoria/opcional y entorno.
- No commitear `.env.local` ni valores reales.
- Separar valores por entorno: local, preview, production.

## Estructura recomendada para server actions

- Colocar actions cerca del dominio: `lib/<domain>/actions.ts` o `lib/engines/<engine>/actions.ts`.
- Mantener `"use server"` solo en archivos de actions.
- Cada action debe seguir el orden: auth, parse/validate, ownership/access check, service/repository call, revalidate/redirect.
- Evitar SQL directo en actions; usar repository/service layer.
- Evitar mezclar side effects no relacionados en una action.
- Retornar tipos pequenos y estables para componentes cliente.
- Usar `revalidatePath` con rutas especificas afectadas.
- Normalizar errores para UI sin filtrar detalles internos innecesarios.

## Estrategia de PRs

- PRs pequenos y separados por riesgo: schema, services, UI, cleanup.
- Cada PR debe declarar: objetivo, archivos tocados, impacto en DB, impacto en auth/RLS, pruebas sugeridas y rollback.
- No mezclar hardening estructural con features comerciales.
- PRs con migrations deben incluir revision explicita de RLS y grants.
- PRs de UI deben indicar rutas verificadas y estados cubiertos.
- PRs de seguridad deben tener checklist de ownership/access.
- Mantener `main` deployable en todo momento.

## Estrategia de releases

- Agrupar features aprobadas en `develop`.
- Crear `release/<version>` desde `develop`.
- Ejecutar typecheck, lint, build y pruebas manuales de flujos criticos.
- Congelar scope durante release; solo fixes bloqueantes entran al release branch.
- Abrir PR de release hacia `main`.
- Crear tag semantico despues del merge: `vMAJOR.MINOR.PATCH`.
- Registrar notas: features, migrations, riesgos, pasos post-deploy y rollback.
- Sincronizar `develop` desde `main` despues de publicar.

## Buenas practicas para trabajar con Codex + Claude

- Usar Codex para cambios acotados, lectura de repo, PRs mecanicos, migrations pequenas y verificaciones reproducibles.
- Usar Claude para revisiones de arquitectura, threat modeling, copy largo o segunda opinion en decisiones ambiguas.
- Dar a cada agente una rama o scope separado para evitar conflictos.
- No pedir a dos agentes editar los mismos archivos al mismo tiempo.
- Exigir resumen final con archivos tocados, riesgos y pruebas ejecutadas.
- Para cambios con DB/RLS, pedir siempre revision cruzada antes de merge.
- Nunca permitir merges automaticos sin que una persona revise el PR.
- Mantener prompts con restricciones explicitas: no instalar librerias, no tocar produccion, no refactors amplios.

## Analisis tecnico para SaaS core hardening

### Centralizar configuracion

Estado actual: la configuracion de Supabase ya existe en `lib/supabase/env-client.ts` y `lib/supabase/env-server.ts`, y `next.config.ts` tambien lee `NEXT_PUBLIC_SUPABASE_URL` para imagenes remotas. Recomendacion: crear `lib/config/env.ts` y `lib/config/runtime.ts` para unificar variables, defaults seguros y helpers de entorno sin cambiar comportamiento.

### Env validation

Estado actual: se validan las variables publicas requeridas de Supabase, pero la validacion esta limitada al modulo Supabase. Recomendacion: ampliar validacion tipada para server/client, documentar `.env.example`, y fallar temprano en build/runtime con mensajes claros.

### Reusable services layer

Estado actual: existe una capa por dominio en `lib/engines/*`, pero `lib/courses/*` convive como dominio paralelo. Recomendacion: definir una convencion estable: `actions -> service -> repository -> supabase`, y migrar gradualmente duplicaciones solo cuando haya cambios funcionales cercanos.

### Error handling

Estado actual: varias actions y route handlers lanzan `Error` con mensajes de dominio; algunos endpoints devuelven JSON con status generico. Recomendacion: introducir helpers pequenos como `AppError`, `toActionError` y `toRouteError` sin agregar dependencias, manteniendo mensajes seguros para UI.

### Audit logging

Estado actual: cambios sensibles como enrollments, pagos manuales, media delete y ownership no tienen una bitacora central. Recomendacion: crear migration `audit_events` en PR separado, con RLS restrictivo, helper `recordAuditEvent()` y eventos para enroll/revoke/payment review/media delete.

### Architecture cleanup

Estado actual: App Router y engines ya dan una buena base, pero hay senales de crecimiento rapido: rutas duplicadas historicas, cursos en `lib/courses` fuera de `lib/engines`, y acciones con validacion local repetida. Recomendacion: limpieza gradual por PRs: primero docs/config/errors, despues services, despues rutas legacy si se confirma que no se usan.

## Riesgos detectados

- `develop` puede quedarse atrasada si los PRs siguen mergeando directo a `main`.
- `.env.local` aparece en el arbol remoto; debe revisarse si contiene valores reales y removerse con rotacion si aplica.
- Cambios recientes de media/storage dependen fuertemente de RLS y signed URLs; requieren pruebas manuales con owner, alumno inscrito y alumno sin acceso.
- Hay rutas historicas en espanol e ingles (`/aprender`, `/learn`, `/admin/cursos/id`, `/admin/cursos/[id]`) que pueden confundir mantenimiento.
- La capa de cursos crecio fuera de `lib/engines`, lo que puede duplicar convenciones de services/repositories.
- Falta audit logging para operaciones sensibles de acceso, pagos y media.

## Recomendaciones siguientes

1. PR 1: centralizar env/config sin cambiar valores ni comportamiento.
2. PR 2: agregar helpers de error handling para actions y route handlers.
3. PR 3: agregar `audit_events` y registrar eventos sensibles basicos.
4. PR 4: revisar y documentar rutas legacy antes de cualquier cleanup.
5. PR 5: alinear `lib/courses` con la convencion de engines o formalizarlo como dominio estable.
6. PR 6: agregar checklist de RLS/storage en plantilla de PR cuando se cree `.github/pull_request_template.md`.
