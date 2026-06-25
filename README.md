# Frandora

**La plataforma SaaS mas completa para negocios de servicios.**

Frandora permite a barberias, spas, salones, clinicas esteticas, estudios de fitness y cualquier negocio de servicios gestionar su operacion completa: agenda, clientes, pagos, inventario, marketing y mas, todo desde un panel premium y con su propia pagina publica de reservas.

---

## URLs del Sistema

| Ambiente | URL |
|---|---|
| Landing publica | `https://frandora.cl` |
| Panel del negocio | `https://app.frandora.cl` |
| Super Admin | `https://admin.frandora.cl` |
| API / webhooks | `https://api.frandora.cl` |
| Reservas del negocio | `https://[slug].frandora.cl` |

Cada modulo publico usa subdominio. Ejemplo: `https://barberia-don-pepe.frandora.cl`.

---

## Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Base de datos:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** Clerk
- **Suscripciones SaaS:** Rebill
- **Pagos en reservas:** Flow.cl
- **Email:** Resend + React Email
- **SMS/WhatsApp:** Twilio
- **Deploy:** Vercel

---

## Inicio Rapido

```bash
git clone https://github.com/msolisingenieria-hub/Frandora-APP.git
cd Frandora-APP
npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run dev
```

La app local queda disponible en `http://localhost:3000`.

---

## Verificacion antes de subir cambios

Antes de hacer push o deploy, debe pasar:

```bash
npm run verify
```

Si el cambio toca UI, responsive, middleware, auth o reservas:

```bash
npm run verify:e2e
```

`npm run build` requiere variables reales de Clerk y base de datos. En Vercel deben existir `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_ROOT_DOMAIN`, ademas de las credenciales de Rebill, Flow.cl, Resend y Twilio que use el entorno.

En produccion, usar siempre subdominios: `frandora.cl`, `app.frandora.cl`, `admin.frandora.cl`, `api.frandora.cl` y `[slug].frandora.cl`. No enlazar publicamente a rutas como `frandora.cl/booking/...` o `frandora.cl/dashboard`; esas rutas son implementacion interna/local.

---

## Documentacion

La documentacion completa del proyecto y las reglas de desarrollo se encuentran en [.claude/CLAUDE.md](.claude/CLAUDE.md).

---

## Planes Disponibles

| Plan | Precio | Ideal para |
|---|---|---|
| Starter | $19/mes | Autonomos, 1 profesional |
| Professional | $49/mes | Equipos pequenos, hasta 3 profesionales |
| Business | $99/mes | Negocios en crecimiento, hasta 10 profesionales |
| Scale | $179/mes | Multi-sucursal, profesionales ilimitados |
| Enterprise | Custom | Cadenas y franquicias |

Todos los planes incluyen 14 dias de prueba gratuita.

---

## Licencia

Copyright (c) 2026 Frandora. Todos los derechos reservados.
