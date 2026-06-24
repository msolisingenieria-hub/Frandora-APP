# Plan de Desarrollo — Frandora APP

> Archivo de referencia permanente. Actualizar al completar cada fase.
> Repositorio: `Frandora-APP` | Rama principal: `main`

---

## Estado Actual del Proyecto

| Ítem | Estado |
|------|--------|
| Fase actual | **Fase 2 completada** — Iniciando Fase 3 |
| Deploy en Vercel | `frandora-system` (conectar env vars) |
| Base de datos | Supabase PostgreSQL — 26 tablas activas |
| Auth | Clerk — configurado |
| UI base | Next.js 14, Tailwind, shadcn/ui, Lucide icons |

---

## Stack Tecnológico

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Next.js 14+ (App Router) | ✅ Instalado |
| Lenguaje | TypeScript strict | ✅ Configurado |
| Estilos | Tailwind CSS + shadcn/ui | ✅ Configurado |
| Animaciones | Framer Motion | ✅ Instalado |
| Base de datos | PostgreSQL via Supabase | ✅ Conectado |
| ORM | Prisma (26 tablas) | ✅ Schema publicado |
| Cache | Upstash Redis | ⏳ Pendiente config |
| Auth | Clerk | ✅ Configurado |
| Suscripciones | Rebill (Latam SaaS) | ⏳ Fase 5 |
| Pagos reservas | Flow.cl (Chile) | ⏳ Fase 5 |
| Email | Resend + React Email | ⏳ Fase 7 |
| SMS/WhatsApp | Twilio | ⏳ Fase 7 |
| Storage | Cloudflare R2 | ⏳ Fase 4 |
| Deploy | Vercel | ⏳ Conectando |
| Monitoreo | Sentry + PostHog | ⏳ Fase 10 |

---

## Variables de Entorno Necesarias en Vercel

```env
# Base de datos (Supabase pooler — NO cambiar a dirección directa)
DATABASE_URL=postgresql://postgres.lnybarrqefqywjfcuzmc:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.lnybarrqefqywjfcuzmc:PASSWORD@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# App URLs (producción)
NEXT_PUBLIC_APP_URL=https://app.frandora.cl
NEXT_PUBLIC_ROOT_DOMAIN=frandora.cl

# Fases futuras:
# REBILL_API_KEY=
# FLOW_API_KEY=
# RESEND_API_KEY=
# TWILIO_ACCOUNT_SID=
```

---

## Arquitectura de URLs

| Subdominio | Qué es |
|-----------|--------|
| `frandora.cl` | Landing page pública |
| `app.frandora.cl` | Dashboard del negocio |
| `admin.frandora.cl` | Super admin Frandora |
| `[slug].frandora.cl` | Página pública de reservas |

Middleware en `middleware.ts` enruta por host. En desarrollo local y Codespaces usa rutas normales.

---

## Fases de Desarrollo

### ✅ FASE 0 — Setup y Fundación
- Next.js 14, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Prisma + Supabase PostgreSQL (26 tablas)
- Clerk auth configurado
- Middleware multi-tenant por subdominio
- Deploy base en Vercel
- Identidad de marca: colores, tipografía, design system

### ✅ FASE 1 — Landing Page Premium
- Hero animado con Framer Motion
- Secciones: Features, Industrias, Precios, Testimonios, FAQ, Footer
- Botones Navy como primario, Sage Teal como acento
- Responsive mobile-first
- Gradientes navy → blanco en toda la infraestructura

### ✅ FASE 2 — Auth y Onboarding
- Sign-in / Sign-up con Clerk
- Wizard de onboarding 5 pasos:
  1. Tipo de negocio (17 categorías)
  2. Datos del negocio
  3. Servicios iniciales
  4. Horario de atención
  5. Selección de plan
- API `/api/onboarding/complete` con Zod validation
- Dashboard inicial con trial banner, stats, setup checklist
- Sidebar premium: gradiente, Lucide icons, secciones agrupadas
- Logo SVG cursiva F + swoosh teal + punto teal

---

### ⏳ FASE 3 — Agenda y Reservas (PRÓXIMA)

**Objetivo:** Sistema completo de agendamiento — panel del negocio + página pública de reservas.

#### Panel del negocio (`/dashboard/agenda`)
- [ ] Calendario semanal/mensual (FullCalendar o react-big-calendar)
- [ ] Vista de columnas por profesional
- [ ] Crear cita manual desde dashboard
- [ ] Editar / cancelar / reprogramar cita
- [ ] Bloqueos de tiempo (vacaciones, descansos)
- [ ] Estado de cita: SCHEDULED / CONFIRMED / IN_PROGRESS / COMPLETED / CANCELLED / NO_SHOW

#### Página pública de reservas (`/[slug]`)
- [ ] Diseño premium personalizable
- [ ] Selección de servicio
- [ ] Selección de profesional (o "cualquiera disponible")
- [ ] Calendario interactivo con slots disponibles
- [ ] Formulario del cliente (nombre, email, teléfono)
- [ ] Confirmación con código de reserva
- [ ] Email de confirmación (Resend)

#### API necesaria
- `GET /api/business/[slug]` — datos del negocio
- `GET /api/slots?businessId&staffId&date` — disponibilidad
- `POST /api/appointments` — crear cita
- `PATCH /api/appointments/[id]` — actualizar cita
- `DELETE /api/appointments/[id]` — cancelar cita

---

### ⏳ FASE 4 — CRM de Clientes

- [ ] Lista de clientes del negocio
- [ ] Perfil completo: nombre, foto, historial, notas, preferencias
- [ ] Historial de citas y pagos
- [ ] Tags y segmentación
- [ ] Fotos antes/después
- [ ] Importar CSV

---

### ⏳ FASE 5 — Pagos y Facturación

- [ ] **Rebill** — suscripciones de planes Frandora (Starter/Professional/Business/Scale)
- [ ] **Flow.cl** — cobro en reservas (depósito o pago completo)
- [ ] Webhook Rebill para actualizar estado de suscripción
- [ ] Webhook Flow.cl para confirmar pagos
- [ ] Facturas digitales PDF
- [ ] Gift cards básicas

---

### ⏳ FASE 6 — POS e Inventario

- [ ] Punto de venta (cobro rápido de servicios)
- [ ] Catálogo de productos
- [ ] Control de stock
- [ ] Cierre de caja diario

---

### ⏳ FASE 7 — Marketing y Notificaciones

- [ ] Recordatorios automáticos (24h, 1h antes)
- [ ] Email marketing con Resend
- [ ] SMS con Twilio
- [ ] WhatsApp Business
- [ ] Campañas de cumpleaños
- [ ] Reseñas automáticas post-servicio
- [ ] Programa de lealtad (puntos)
- [ ] Cupones y descuentos

---

### ⏳ FASE 8 — Reportes y Analytics

- [ ] Dashboard ejecutivo (día/semana/mes)
- [ ] Ingresos por servicio y profesional
- [ ] Tasa de ocupación del calendario
- [ ] Exportación PDF/Excel
- [ ] Integración PostHog

---

### ⏳ FASE 9 — Super Admin

- [ ] Panel `admin.frandora.cl`
- [ ] Gestión de todos los negocios
- [ ] MRR / ARR / churn metrics
- [ ] Gestión de planes globales
- [ ] Logs de actividad

---

### ⏳ FASE 10 — Pulido y Lanzamiento

- [ ] Tests E2E con Playwright
- [ ] Lighthouse ≥ 90 en todas las páginas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Beta con negocios reales
- [ ] Launch público en frandora.cl

---

## Planes de Frandora

| Plan | Precio mes | Staff | Ubicaciones |
|------|-----------|-------|-------------|
| Starter | $19 USD | 1 | 1 |
| Professional | $49 USD | 3 | 1 |
| Business | $99 USD | 10 | 3 |
| Scale | $179 USD | ∞ | ∞ |
| Enterprise | Custom | ∞ | ∞ |

Descuento 20% pago anual. Trial gratuito 14 días sin tarjeta.

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPER_ADMIN | Todo Frandora |
| BUSINESS_OWNER | Todo su negocio |
| MANAGER | Agenda, clientes, reportes (sin facturación) |
| STAFF | Solo su agenda y clientes asignados |
| RECEPTIONIST | Crear/editar reservas y clientes |
| CLIENT | Página pública de reservas |

---

## Reglas Técnicas Críticas

1. **Máximo 400 líneas por archivo** — sin excepciones
2. **Mobile-first responsive** — 320px / 768px / 1024px
3. **No `any` en TypeScript** — usar `unknown` + type guards
4. **API routes delgadas** — lógica en `lib/services/`
5. **No Stripe** — Flow.cl para cobros, Rebill para suscripciones SaaS
6. **Nunca commitear `.env` o `.env.local`**

---

## Identidad de Marca

| Color | Hex | Uso |
|-------|-----|-----|
| Deep Navy | `#0D1B2A` | Fondo, sidebar, botones primarios |
| Sage Teal | `#6FA89E` | Acento, links, swoosh del logo |
| Mist | `#CFE3DF` | Fondos suaves, hover |
| Light Gray | `#F2F4F6` | Backgrounds claros |

- **Tipografía:** Poppins (títulos) + Inter (cuerpo)
- **Tagline:** SCHEDULE SMART. GROW MORE.
- **Logo:** F cursiva blanca + swoosh teal + punto teal + estrella 4 puntas

---

*Última actualización: Fase 2 completada — preparando Fase 3 (Agenda)*
