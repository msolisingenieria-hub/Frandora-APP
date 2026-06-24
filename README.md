# Frandora

**La plataforma SaaS más completa para negocios de servicios.**

Frandora permite a barberías, spas, salones, clínicas estéticas, estudios de fitness y cualquier negocio de servicios gestionar su operación completa: agendamiento, clientes, pagos, inventario, marketing y más — todo desde un panel premium y con su propia página pública de reservas.

---

## URLs del Sistema

| Ambiente | URL |
|---|---|
| Landing pública | `https://frandora.cl` |
| Panel del negocio | `https://app.frandora.cl` |
| Super Admin | `https://admin.frandora.cl` |
| API / Webhooks | `https://api.frandora.cl` |
| Reservas del negocio | `https://[slug].frandora.cl` |

Cada módulo es un subdominio. Ejemplo de página de reservas: `https://barberia-don-pepe.frandora.cl`

---

## Stack

- **Framework:** Next.js 14+ (App Router) + TypeScript
- **Base de datos:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** Clerk
- **Pagos:** Stripe
- **Email:** Resend + React Email
- **SMS/WhatsApp:** Twilio
- **Deploy:** Vercel

---

## Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/msolisingenieria-hub/Frandora-APP.git
cd Frandora-APP

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Generar cliente Prisma y migrar DB
npx prisma generate
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

---

## Documentación

La documentación completa del proyecto y las reglas de desarrollo se encuentran en [.claude/CLAUDE.md](.claude/CLAUDE.md).

---

## Planes Disponibles

| Plan | Precio | Ideal para |
|---|---|---|
| Starter | $19/mes | Autónomos, 1 profesional |
| Professional | $49/mes | Pequeños equipos, hasta 3 staff |
| Business | $99/mes | Negocios en crecimiento, hasta 10 staff |
| Scale | $179/mes | Multi-sucursal, staff ilimitado |
| Enterprise | Custom | Cadenas y franquicias |

Todos los planes incluyen 14 días de prueba gratuita.

---

## Licencia

Copyright © 2025 Frandora. Todos los derechos reservados.
