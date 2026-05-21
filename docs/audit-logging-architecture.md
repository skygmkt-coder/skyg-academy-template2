# Audit Logging Architecture

Este documento define la base reusable de audit logging para operaciones sensibles del SaaS. El objetivo es registrar cambios importantes sin convertir la auditoria en un punto unico de falla para produccion.

## Filosofia

- Los eventos de auditoria se escriben despues de que la operacion principal termina correctamente.
- El logging es fail-open por defecto: si la tabla, RLS o red fallan, el flujo de negocio no debe romperse.
- Cada evento debe tener un actor claro cuando venga de una accion autenticada.
- La metadata debe explicar el contexto operativo sin guardar secretos ni payloads completos.
- Los eventos son apend-only desde la app. No se actualizan ni se borran desde flujos normales.

## Estructura

La foundation vive en `src/audit`:

- `types.ts`: tipos de eventos, targets, metadata y resultado.
- `record.ts`: helper `recordAuditEvent()`.
- `index.ts`: exports publicos.

La tabla vive en `public.audit_events` y se crea desde la migration:

- `supabase/migrations/202605200001_audit_events.sql`

## Tabla audit_events

Campos principales:

- `id`: UUID del evento.
- `event_type`: nombre tipado del evento.
- `actor_user_id`: usuario autenticado que ejecuto la accion.
- `target_type`: tipo de recurso afectado.
- `target_id`: identificador del recurso afectado.
- `course_id`: curso/producto asociado cuando aplica.
- `metadata`: JSONB flexible con contexto no sensible.
- `created_at`: timestamp del evento.

## RLS

La tabla tiene RLS habilitado.

Reglas iniciales:

- `anon` no tiene permisos.
- `authenticated` puede insertar eventos solo si `actor_user_id = auth.uid()`.
- Solo admins pueden leer eventos.

Esto evita que un usuario cree eventos fingiendo ser otro actor y mantiene la bitacora fuera de lectura publica.

## Eventos iniciales

Eventos tipados actuales:

- `media.upload.signed`: se genero una URL firmada para upload de media de curso.
- `media.delete`: se elimino media desde storage.
- `enrollment.grant`: se otorgo acceso a un curso/producto.
- `enrollment.revoke`: se revoco acceso.
- `payment.approve`: se aprobo un pago manual legacy.
- `course_payment_proof.approve`: se aprobo un comprobante manual de curso.

## Uso

Ejemplo minimo:

```ts
await recordAuditEvent({
  eventType: "enrollment.grant",
  actorUserId: auth.user.id,
  targetType: "enrollment",
  targetId: enrollment.id,
  courseId,
  metadata: {
    targetUserId,
    paymentProvider: "manual"
  }
});
```

## Metadata

La metadata acepta strings, numeros, booleanos, null, arrays y objetos JSON. Usarla para contexto operacional pequeno:

- IDs relacionados.
- Metodo de pago.
- Bucket/path de storage.
- Status previo o razon de grant.
- Content type y size de uploads.

No guardar:

- Tokens de signed URLs.
- Cookies o headers.
- Secrets de providers.
- CLABE completa si no es estrictamente necesaria.
- Payloads completos de formularios.
- Datos personales extensos si basta con IDs.

## Reglas para integracion

- Registrar eventos solo despues de validar permisos y completar la operacion principal.
- No agregar audit logging dentro de componentes React.
- Preferir services/actions server-side con usuario autenticado.
- No usar `failClosed: true` salvo en flujos donde auditoria sea requisito legal o explicitamente bloqueante.
- Si una funcion no tiene actor, pasar el actor desde la Server Action o no registrar el evento.
- Mantener eventos nuevos en `AuditEventType` y `AuditTargetType` antes de usarlos.

## Alcance de este PR

Este PR aplica audit logging solo en:

- Media uploads/deletes de cursos.
- Grants/revokes de enrollments de cursos.
- Grants/revokes de enrollments legacy de productos.
- Approvals de pagos manuales legacy.
- Approvals de comprobantes manuales de cursos.

No agrega UI de auditoria, analytics, dashboards, exports ni alertas.

## Riesgos conocidos

- Si la migration no esta aplicada, los eventos fallan abierto y se emite warning en logs.
- La lectura queda limitada a admins; owners de curso no tienen panel de auditoria todavia.
- Los eventos de signed upload indican que se creo la URL firmada, no garantizan que el archivo haya sido subido al bucket.
- Algunas rutas legacy de productos y rutas nuevas de cursos coexisten; por eso hay eventos para ambos flujos.

## Siguientes pasos recomendados

1. Agregar una vista admin interna para consultar eventos por curso, usuario y tipo.
2. Migrar eventos criticos adicionales: payment reject, proof submit, payment settings update y course settings update.
3. Agregar correlation/request id cuando exista una capa comun de request context.
4. Revisar retencion de eventos y estrategia de export para soporte/admin.
