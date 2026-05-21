# Build and Validation Workflow

Este documento define la foundation de validacion para mantener el SaaS deployable mientras el producto sigue creciendo con Next.js, Supabase, Server Actions, Storage y pagos manuales.

## Objetivo

Toda rama que vaya a `develop` o `main` debe poder demostrar tres cosas:

1. TypeScript compila sin errores.
2. ESLint corre con reglas de Next.js y sin warnings nuevos.
3. `next build` completa con la configuracion esperada de entorno.

## Scripts oficiales

Los scripts oficiales viven en `package.json`:

```bash
npm run typecheck
npm run lint
npm run build
npm run validate
npm run validate:quick
```

Uso recomendado:

- `npm run validate:quick`: antes de subir commits pequenos. Ejecuta typecheck y lint.
- `npm run validate`: antes de pedir review o merge. Ejecuta typecheck, lint y build.
- `npm run build`: obligatorio cuando hay cambios en App Router, env, config, Server Components, route handlers o Next config.

## Configuracion actual

- `typecheck`: usa `tsc --noEmit`.
- `lint`: usa `eslint . --max-warnings=0`.
- `build`: usa `next build`.
- ESLint usa flat config en `eslint.config.mjs` para compatibilidad con ESLint 9 y Next.js 15.
- La configuracion extiende `next/core-web-vitals` y `next/typescript`.

## Checklist recomendado para PRs

Antes de abrir o pedir merge:

- [ ] El PR apunta a `develop`, excepto hotfixes aprobados a `main`.
- [ ] El alcance es pequeno y reversible.
- [ ] No instala librerias nuevas salvo justificacion explicita.
- [ ] No mezcla migration, UI y refactor amplio en el mismo PR.
- [ ] `npm run validate:quick` fue ejecutado localmente o se explica por que no.
- [ ] `npm run validate` fue ejecutado antes de merge o hay plan claro para correrlo.
- [ ] Si toca Supabase, RLS o Storage, el PR explica impacto de seguridad.
- [ ] Si toca env vars, actualiza documentacion y separa public/private.
- [ ] Si toca migrations, incluye pasos de prueba y rollback manual.

## Validaciones minimas antes de merge

Para PRs de documentacion pura:

- Revisar diff manualmente.
- No requiere build si no cambia codigo ni config.

Para PRs de TypeScript, Server Actions, Route Handlers o UI:

```bash
npm run validate
```

Para PRs con migrations:

```bash
npm run validate:quick
```

Ademas, aplicar la migration en un entorno no productivo y probar el flujo afectado.

Para PRs con cambios de env/config:

```bash
npm run validate
```

Ademas, verificar local/preview/production con variables reales o equivalentes seguras.

## Reglas para migrations

- Una migration por PR o por feature coherente.
- No editar migrations ya aplicadas; crear una nueva.
- Usar timestamp monotono: `YYYYMMDDHHMMSS_descripcion.sql`.
- Toda tabla expuesta debe tener RLS evaluado antes de merge.
- Declarar grants de forma explicita cuando la tabla sea consultada por la app.
- Evitar policies ambiguas: incluir actor, ownership o access validation clara.
- Preferir constraints defensivos para status, tipos y metadata JSON.
- Documentar rollback manual cuando el cambio toque datos criticos.
- No depender de cambios manuales en Supabase Dashboard sin documentarlos.

## Reglas para cambios de env

- Toda nueva env debe documentarse en `/docs/env-and-config-architecture.md` o en el PR si ese documento aun no aplica al branch base.
- Variables publicas deben usar `NEXT_PUBLIC_` solo si el valor puede vivir en el browser.
- Secrets, service role keys, provider tokens y webhooks deben ser server-only.
- No commitear `.env.local` ni valores reales.
- Si una env es requerida para build, el PR debe indicarlo claramente.
- Si una env es opcional, definir comportamiento seguro cuando falta.
- Cambios de env deben probarse al menos en local o preview antes de production.

## Problemas detectados en este hardening

- El script `lint` usaba `next lint`; para el stack actual con ESLint 9 es mas estable usar `eslint .` con flat config.
- Existia configuracion ESLint legacy `.eslintrc.json`; se reemplazo por `eslint.config.mjs` como fuente unica.
- No habia script agregado que ejecutara typecheck, lint y build en orden.
- No hay workflow de CI activo en el repo, por lo que GitHub no reporta checks automaticos en PRs.
- `next build` puede requerir env vars de Supabase/config segun las rutas importadas durante build.
- Las migrations no tienen validacion automatica todavia; requieren revision manual y prueba en entorno no productivo.

## Estructura futura para CI/CD

No se implementa CI completo en este PR. La estructura recomendada para un PR futuro es:

```yaml
name: validate

on:
  pull_request:
    branches: [develop, main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup-node
      - npm ci
      - npm run validate
```

Evolucion recomendada:

1. PR 1: workflow basico `npm ci` + `npm run validate`.
2. PR 2: cache de npm y separacion de jobs `typecheck`, `lint`, `build`.
3. PR 3: job opcional de migration lint/review manual para PRs que toquen `supabase/migrations`.
4. PR 4: required checks en GitHub branch protection para `develop` y `main`.
5. PR 5: deploy previews y smoke checks cuando el entorno Vercel/Supabase Preview este listo.

## Politica de excepciones

Si no se puede correr una validacion, el PR debe decirlo explicitamente e incluir:

- Que comando no se pudo correr.
- Por que fallo o por que no estaba disponible.
- Que riesgo queda abierto.
- Quien debe correrlo antes de merge.
