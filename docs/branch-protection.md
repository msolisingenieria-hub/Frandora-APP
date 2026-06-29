# Protección de rama `main` — configuración requerida

Configurar en GitHub → **Settings → Branches → Branch protection rules** para `main`.

## Reglas obligatorias

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale approvals on new commits
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Checks requeridos (de `ci.yml`):
    - `Lint + Typecheck`
    - `Build`
    - `E2E (Playwright)`
  - **NO** marcar como requerido `Dependency audit (advisory)` (es asesor, ver abajo).
- [x] **Require conversation resolution before merging**
- [x] **Do not allow bypassing the above settings** (aplica también a admins)

## Secrets de GitHub Actions requeridos

Para que los jobs `Build` y `E2E` pasen, agregar en **Settings → Secrets and variables → Actions**:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_ROOT_DOMAIN
CRON_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SENTRY_AUTH_TOKEN   # opcional; sin él, Sentry no sube sourcemaps
```

> Usar credenciales de un proyecto de **staging/preview**, no las de producción, para el CI.

## Auditoría de dependencias (asesor, no bloqueante)

El job `Dependency audit (advisory)` corre `npm audit --audit-level=high` con
`continue-on-error: true`. Hoy existen vulnerabilidades `high` en
`@react-email` / `prismjs` y un transitivo de Next cuyo arreglo requiere subir
versiones **mayores** (prohibido por CLAUDE.md sin un plan). Se reporta en cada
PR sin bloquear; resolver en una actualización mayor planificada.

## CodeQL

`codeql.yml` corre en cada PR/push a `main` y semanalmente. Sus hallazgos
aparecen en **Security → Code scanning alerts**. Se puede marcar el check
`Analyze (javascript-typescript)` como requerido una vez se estabilicen los
hallazgos iniciales.
