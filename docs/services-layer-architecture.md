# Services Layer Architecture

Este documento define la foundation inicial para una capa reusable de services en el SaaS. El objetivo es reducir duplicacion operativa sin mover la arquitectura actual ni cambiar comportamiento productivo.

## Objetivo

La services layer debe concentrar patrones tecnicos compartidos que se repiten en dominios distintos:

- Creacion del cliente Supabase server-side.
- Operaciones comunes de Supabase Storage.
- Patrones de access/ownership.
- Metadata comun para audit/enrollment/payment.
- Helpers pequenos que eviten duplicar queries o filtros.

No reemplaza todavia a los engines existentes ni a los repositories de dominio.

## Estructura actual

La foundation vive en `src/services`:

- `supabase.ts`: wrapper `getServerSupabaseClient()` y tipos base de resultados.
- `storage.ts`: helpers para signed uploads, signed read URLs, delete y public URL.
- `access.ts`: helpers para ownership/access de cursos.
- `enrollments.ts`: helpers compartidos para metadata de enrollments.
- `payments.ts`: helpers compartidos para seleccion y metadata de pagos.
- `index.ts`: exports publicos.

## Reglas de uso

- Usar `src/services` para operaciones tecnicas compartidas, no para UI ni Server Actions.
- Mantener reglas de negocio complejas en `lib/engines/*` o `lib/courses/*` hasta que exista un PR dedicado de migracion.
- No mover repositories existentes en este foundation PR.
- Los helpers deben ser pequenos, testeables y sin side effects ocultos.
- Los helpers de Storage deben recibir mensajes de error del dominio que los llama.
- Los helpers de access no deben asumir rutas ni UI.

## Aplicacion en este PR

Este PR aplica la foundation solo en areas criticas pequenas:

### Media

Archivo: `lib/courses/media.ts`

Cambios:

- Usa `createStorageSignedUpload()` para signed upload URLs.
- Usa `createStorageSignedReadUrl()` para signed read URLs.
- Usa `removeStorageObjects()` para deletes.
- Usa `getPublicStorageUrl()` para public thumbnails.
- Usa `getServerSupabaseClient()` para la validacion puntual de lesson ownership.

Se conservaron:

- Buckets y MIME types centralizados en `src/config`.
- Audit logging existente.
- Validaciones de ownership y lesson.
- Formato de URLs protegidas.

### Enrollments

Archivo: `lib/engines/learning/enrollments.ts`

Cambios:

- Usa `canAdminOrOwnCourse()` para eliminar duplicacion de admin/owner checks.
- Usa `getServerSupabaseClient()` para el upsert de enrollment.
- Usa `enrollmentAuditMetadata()` para metadata consistente.

Se conservaron:

- `getActiveEnrollment()` desde repository existente.
- `listEnrollmentsByProductId()` y `revokeEnrollment()` existentes.
- Audit logging de grant/revoke.
- Validacion posterior del enrollment activo.

### Payments

Archivo: `lib/engines/commerce/service.ts`

Cambios:

- Usa `findPendingPaymentForApproval()` para seleccionar el pago pendiente.
- Usa `paymentApprovalAuditMetadata()` para metadata de approvals.
- Usa helpers de Storage para comprobantes.

Se conservaron:

- Repositories existentes de orders/payments.
- RPC `approve_manual_payment_transaction`.
- Fallback `#` al no poder firmar lectura de comprobante.
- Audit logging de aprobacion.

## Duplicacion detectada

### Supabase clients

Se repetia `createClient()` en services de media, enrollments, payments y manual payments. Este PR introduce `getServerSupabaseClient()` y lo aplica en media/enrollments/payment proof storage.

### Storage logic

Se repetian patrones de:

- `supabase.storage.from(bucket).createSignedUploadUrl(path)`.
- `supabase.storage.from(bucket).createSignedUrl(path, ttl)`.
- `supabase.storage.from(bucket).remove(paths)`.
- `getPublicUrl(path)`.

Ahora viven como helpers reutilizables en `src/services/storage.ts`.

### Access patterns

`checkCourseAccess()` y `canManageCourseEnrollment()` repetian el check admin + query `courses(id, creator_id)`. Ahora ese patron vive en `canAdminOrOwnCourse()`.

### Enrollment operations

La metadata de audit para grants/revokes se repetia con claves similares. Este PR centraliza ese shape en `enrollmentAuditMetadata()`.

### Payment operations

La seleccion de pago pendiente y la metadata de approval vivian inline en el service. Ahora se separan en helpers pequeños.

## Lo que NO hace este PR

- No cambia schema ni migrations.
- No instala librerias.
- No cambia rutas.
- No mueve engines ni repositories existentes.
- No cambia UI.
- No reemplaza todos los `createClient()` del repo.
- No introduce CI/CD.

## Riesgos conocidos

- No se ejecuto validacion local en esta sesion porque el workspace local no esta montado.
- `src/services` queda como capa inicial; todavia convive con `lib/engines/*` y `lib/courses/*`.
- Algunos helpers devuelven errores genericos de dominio enviados por el caller; esto preserva compatibilidad pero aun no estandariza todos los errores.
- Manual payments de cursos todavia tiene queries inline; se dejo fuera para evitar ampliar demasiado el PR.

## Recomendaciones siguientes

1. Migrar manual payments a repositories/helpers compartidos en un PR separado.
2. Crear helpers de query para `profiles`, `courses` y `enrollments` con tipos de fila reutilizables.
3. Unificar manejo de errores de services usando la foundation de `src/errors`.
4. Agregar tests o smoke checks cuando CI este listo.
5. Evaluar si `lib/courses` debe permanecer como dominio separado o integrarse gradualmente a `lib/engines`.
