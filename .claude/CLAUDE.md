# Frandora — Reglas del Proyecto para Claude

## Descripción General

**Frandora** es una plataforma SaaS premium de agendamiento y gestión para negocios de servicios (barberías, spas, salones, clínicas estéticas, fitness, etc.). Es multi-tenant: cada negocio tiene su panel privado y su página pública de reservas.

- **Repositorio:** `Frandora-APP`
- **URL pública de reservas:** `https://[slug].frandora.cl` — Ej: `https://barberia-don-pepe.frandora.cl`
- **Panel del negocio:** `https://app.frandora.cl/dashboard`
- **Super Admin:** `https://admin.frandora.cl`
- **Landing pública:** `https://frandora.cl`

---

## Identidad de Marca (Brand Identity)

### Tagline oficial
**"SCHEDULE SMART. GROW MORE."**

### Paleta de colores exacta

| Nombre | Hex | HSL | Uso |
|---|---|---|---|
| Deep Navy | `#0D1B2A` | hsl(211, 53%, 11%) | Fondo oscuro, sidebar, headers |
| Sage Teal | `#6FA89E` | hsl(170, 25%, 55%) | Color primario, CTAs, links |
| Mist | `#CFE3DF` | hsl(169, 26%, 85%) | Fondo secundario, hover states |
| Light Gray | `#F2F4F6` | hsl(210, 19%, 96%) | Fondo claro, inputs |
| White | `#FFFFFF` | hsl(0, 0%, 100%) | Texto sobre oscuro, fondos |

**Regla de uso de colores:** Deep Navy es el color principal e interactivo de toda la app (botones primarios, headers, sidebar, CTAs). Sage Teal como color de acento (íconos activos, checkmarks, detalles decorativos, highlights). El fondo predominante en toda la infraestructura es un gradiente elegante Navy → Blanco. Mist para fondos suaves y hover states. Nunca mezclar colores fuera de esta paleta.

### Tipografía

| Fuente | Uso | Pesos |
|---|---|---|
| **Poppins** | Títulos, headings, CTA | 300, 400, 500, 600, 700 |
| **Inter** | Cuerpo, labels, inputs | 300, 400, 500, 600 |

En Tailwind: `font-sans` = Poppins (titulares) / `font-body` = Inter (cuerpo)

### Valores de marca
ORDER · FLOW · INTELLIGENCE · TRUST · EXCLUSIVITY

### Esencia de marca
"Frandora is a premium scheduling and reservations platform built for businesses that value time, structure, and exceptional experiences. We bring order to complexity through intelligent automation, seamless connections and an elevated user experience."

### Variantes del logo
1. Horizontal: isotipo F + wordmark "Frandora" + tagline
2. Vertical: isotipo F sobre wordmark
3. Isotipo/Monograma: solo la F estilizada
4. App icon: F en fondo oscuro con bordes redondeados
5. Social avatar: F en círculo

### Clases de utilidad CSS disponibles
- `.gradient-text` — texto con gradiente Sage Teal → Deep Navy
- `.gradient-text-light` — texto con gradiente para fondos oscuros
- `.bg-hero` — fondo hero premium oscuro
- `.bg-brand-subtle` — fondo suave Light Gray → Mist
- `.glass` — glass morphism claro
- `.glass-navy` — glass morphism sobre fondo oscuro
- `.card-premium` — card con hover animado
- `.card-dark` — card para fondos oscuros
- `.btn-brand` — botón primario Sage Teal
- `.btn-brand-outline` — botón outline
- `.text-brand-caps` — texto uppercase con tracking de marca

---

## Regla de Responsive — OBLIGATORIA

**Todas las páginas y componentes deben verse perfectos en mobile (≥320px), tablet (≥768px) y desktop (≥1024px).** Esta regla aplica a absolutamente todo: landing page, dashboard, panel de reservas públicas, formularios, tablas, calendarios.

### Breakpoints Tailwind usados en este proyecto
| Prefijo | Ancho | Dispositivo |
|---|---|---|
| (base) | 0px+ | Mobile — diseñar aquí primero |
| `sm:` | 640px+ | Mobile grande |
| `md:` | 768px+ | Tablet |
| `lg:` | 1024px+ | Desktop |
| `xl:` | 1280px+ | Desktop grande |

### Reglas de diseño responsive
- **Mobile-first**: escribir estilos base para mobile, luego agregar breakpoints para pantallas más grandes
- Tablas → usar scroll horizontal en mobile (`overflow-x-auto`)
- Calendarios → colapsar a vista diaria en mobile
- Formularios → columna única en mobile, grilla en tablet+
- Navegación → hamburger menu en mobile, navbar en desktop
- Grillas → 1 columna mobile, 2 tablet, 3+ desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Tipografía → reducir tamaños en mobile (`text-3xl md:text-5xl lg:text-7xl`)
- Padding/margin → más pequeños en mobile (`px-4 md:px-8 lg:px-16`)
- Modales → `w-full h-full` en mobile, `max-w-lg` en desktop

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Base de datos | PostgreSQL via Supabase |
| ORM | Prisma |
| Cache/Colas | Upstash Redis |
| Auth | Clerk |
| Suscripciones Frandora | Rebill (SaaS/subscriptions para Latam) |
| Pagos en reservas | Flow.cl (pasarela chilena) |
| Email | Resend + React Email |
| SMS/WhatsApp | Twilio |
| Storage | Cloudflare R2 / Supabase Storage |
| Realtime | Supabase Realtime / Pusher |
| Deploy | Vercel |
| Monitoreo | Sentry + PostHog |

---

## Lenguaje — REGLA OBLIGATORIA

**Todo texto visible al usuario debe estar en español chileno simple, directo y sin tecnicismos.**

Esta regla aplica a: botones, labels, mensajes de error, placeholders, títulos, descripciones, tooltips, emails, SMS, y cualquier texto que el usuario final o el dueño del negocio pueda leer.

### Vocabulario prohibido (usar la alternativa en su lugar)
| ❌ No usar | ✅ Usar en cambio |
|---|---|
| Dashboard | Panel / Mi negocio |
| Widget | Botón de reserva |
| Webhook | Conexión automática |
| Deploy / deployment | Publicar / subir |
| Feature | Función / opción |
| Toggle | Activar / desactivar |
| Input / field | Casilla / campo |
| Modal | Ventana emergente |
| Backend / frontend | — (no mencionar) |
| API / endpoint | — (no mencionar) |
| Token | Código de acceso |
| Cache | — (no mencionar) |
| Slug | Dirección web / URL |
| Plan (de software) | Plan / suscripción |
| Staff | Equipo / profesionales |
| Check-in | Marcar llegada |
| Checkout | Cobrar / pagar |
| Buffer | Tiempo entre citas |
| Template | Plantilla |
| Analytics | Estadísticas / reportes |
| KPI | Indicador / resultado |

### Tono de escritura
- Hablar de tú (no de usted, no de vos)
- Frases cortas y directas
- Ejemplos concretos cuando ayuden ("Ej: 30 minutos")
- Nunca explicar cómo funciona la tecnología — solo qué hace por el usuario

---

## Reglas de Código — OBLIGATORIAS

### 1. Límite de 400 líneas por archivo
**Ningún archivo de código puede superar 400 líneas.** Si un módulo crece más, se divide en sub-módulos. Esta regla es absoluta y no tiene excepciones.

Estrategia de división:
- Un componente grande → extraer sub-componentes en su propia carpeta
- Un archivo de utilidades largo → dividir por responsabilidad (`utils/dates.ts`, `utils/currency.ts`)
- Una API route larga → extraer lógica a servicios (`services/appointment.service.ts`)
- Un schema Prisma largo → usar `prisma/schemas/` con `prisma-merge` o archivo único bien organizado

### 2. Separación de responsabilidades
```
app/           ← Solo routing, layouts y pages (thin layer)
components/    ← UI puro, sin lógica de negocio
lib/           ← Lógica de negocio, helpers, servicios
hooks/         ← Custom hooks de React
types/         ← Tipos TypeScript globales
```

### 3. Componentes
- Un componente = un archivo
- Máximo 1 componente por archivo (puede tener sub-componentes pequeños internos si < 50 líneas)
- Nombres en PascalCase para componentes, camelCase para funciones/hooks

### 4. API Routes
- Cada route handler es delgado: recibe la request, llama un servicio, retorna la respuesta
- La lógica va en `lib/services/[feature].service.ts`
- Siempre validar con Zod antes de procesar

### 5. TypeScript
- `strict: true` siempre
- No usar `any` — usar `unknown` y hacer type guards
- Tipos compartidos en `types/` o co-ubicados con su módulo

### 6. Nombrado de archivos
- Páginas y layouts: kebab-case (`booking-confirmation.tsx`)
- Componentes: PascalCase (`BookingCalendar.tsx`)
- Servicios/utils: kebab-case (`appointment.service.ts`)
- Hooks: camelCase con prefijo `use` (`useAppointments.ts`)

---

## Reglas de Deploy, Push y Vercel — OBLIGATORIAS

### Plugin de Vercel — OBLIGATORIO SIEMPRE
El plugin `vercel-plugin` (instalado con `npx plugins add vercel/vercel-plugin --target claude-code`) es **obligatorio** y debe estar instalado y activo en todo momento. Usar sus comandos para el trabajo de Next.js, AI SDK y despliegues:
- `/vercel-plugin:nextjs` — guía y best practices de Next.js (usar antes de tocar App Router, RSC, rendering, caching).
- `/vercel-plugin:ai-sdk` — patrones del Vercel AI SDK (usar para toda feature de IA / Fase 16).
- `/vercel-plugin:deploy prod` — despliegue a producción.
Si el plugin no está cargado, instalarlo y reiniciar antes de continuar. No deshabilitarlo.

### Verificacion antes de push
Antes de hacer push o abrir PR debe pasar:

```bash
npm run verify
```

Si el cambio toca UI publica, landing, reservas, auth, middleware o responsive, tambien debe pasar:

```bash
npm run verify:e2e
```

`npm run build` requiere variables reales de Clerk y base de datos. Si falla por variables faltantes, no se debe subir el cambio hasta configurar esas variables localmente o confirmar que Vercel las tiene.

### Variables obligatorias en Vercel
Vercel debe tener, como minimo:

```env
NEXT_PUBLIC_APP_URL=https://app.frandora.cl
NEXT_PUBLIC_API_URL=https://api.frandora.cl
NEXT_PUBLIC_ROOT_DOMAIN=frandora.cl
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
REBILL_API_KEY=
REBILL_ORGANIZATION_ID=
REBILL_WEBHOOK_SECRET=
FLOW_API_KEY=
FLOW_SECRET_KEY=
FLOW_API_URL=https://sandbox.flow.cl/api
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### URLs de produccion
En produccion, los modulos se exponen por subdominio:

- `frandora.cl` - landing publica.
- `app.frandora.cl` - panel, auth y onboarding.
- `admin.frandora.cl` - super admin.
- `api.frandora.cl` - API y webhooks.
- `[slug].frandora.cl` - pagina publica del negocio.

No crear enlaces publicos a `frandora.cl/booking/...`, `frandora.cl/dashboard`, `frandora.cl/sign-in` o `frandora.cl/sign-up`. Esos paths solo son implementacion interna de Next o desarrollo local. Usar siempre `lib/urls.ts` para generar URLs.

### Seguridad multi-tenant
- Toda API autenticada debe obtener `businessId` con `getBusinessId(userId)`.
- No usar `findUnique({ id })` para modificar citas, pagos, clientes, equipo, servicios, productos, cupones o gift cards sin filtrar por `businessId`.
- Las reservas publicas deben revalidar en backend que servicio/profesional pertenecen al negocio, que el profesional ofrece el servicio, que el horario no esta tomado y que no esta en el pasado.

### Dependencias y pagos
- No introducir Stripe.
- Suscripciones SaaS: Rebill.
- Pagos de reservas: Flow.cl.
- No correr `npm audit fix --force` sin revisar, porque puede subir versiones mayores de Next/React o librerias criticas.

---

## Estructura de Directorios

```
/workspaces/Frandora-APP/
├── .claude/                    ← Configuración Claude (MCP, skills, agentes)
│   ├── CLAUDE.md               ← Este archivo
│   ├── skills/                 ← Skills personalizados
│   ├── agents/                 ← Agentes personalizados
│   └── mcp/                    ← Configuración MCP servers
├── app/
│   ├── (public)/               ← Landing page frandora.cl
│   ├── (auth)/                 ← Login, registro, recovery
│   ├── (dashboard)/            ← Panel del negocio
│   ├── (admin)/                ← Super admin Frandora
│   └── api/                    ← API routes
├── components/
│   ├── ui/                     ← shadcn/ui base
│   ├── landing/                ← Componentes landing page
│   ├── dashboard/              ← Componentes del panel
│   └── booking/                ← Flujo de reserva público
├── lib/
│   ├── db/                     ← Prisma client singleton
│   ├── auth/                   ← Clerk helpers
│   ├── rebill/                 ← Rebill helpers + webhooks
│   ├── flow/                   ← Flow.cl helpers + pagos de reservas
│   ├── email/                  ← Resend + templates
│   ├── sms/                    ← Twilio helpers
│   └── services/               ← Lógica de negocio
├── hooks/                      ← Custom React hooks
├── types/                      ← TypeScript types globales
├── prisma/
│   └── schema.prisma           ← Schema de base de datos
└── public/                     ← Assets estáticos
```

---

## Arquitectura de URLs — Todo es Subdominio

**Regla universal:** Cada página, módulo o app del sistema es un subdominio de `frandora.cl`. No se usan paths para separar módulos principales.

```
https://[modulo].frandora.cl
```

| Subdominio | Descripción |
|---|---|
| `frandora.cl` | Landing page pública de Frandora |
| `app.frandora.cl` | Panel del negocio (dashboard) |
| `admin.frandora.cl` | Super Admin de Frandora |
| `api.frandora.cl` | API pública / webhooks |
| `[slug].frandora.cl` | Página pública de reservas del negocio |

Ejemplos de páginas de reservas:
- `https://barberia-don-pepe.frandora.cl`
- `https://spa-serenidad.frandora.cl`
- `https://studio-yoga-paz.frandora.cl`

El `slug` es generado automáticamente desde el nombre del negocio (slugify) y puede ser personalizado por el propietario. Se configura como **wildcard subdomain** (`*.frandora.cl`) en Vercel con middleware de Next.js que enruta según el host.

Los negocios en plan **Business+** pueden usar dominio propio vía CNAME:
- `https://reservas.minegocio.cl` → apunta a `sunegocio.frandora.cl`

---

## Roles del Sistema

| Rol | Acceso |
|---|---|
| `SUPER_ADMIN` | Todo el sistema Frandora |
| `BUSINESS_OWNER` | Todo su negocio |
| `MANAGER` | Agenda, clientes, reportes (sin facturación) |
| `STAFF` | Solo su agenda y clientes asignados |
| `RECEPTIONIST` | Crear/editar reservas y clientes |
| `CLIENT` | Página pública de reservas |

---

## Planes de Frandora

| Plan | Precio | Staff | Ubicaciones |
|---|---|---|---|
| Starter | $19/mes | 1 | 1 |
| Professional | $49/mes | 3 | 1 |
| Business | $99/mes | 10 | 3 |
| Scale | $179/mes | ∞ | ∞ |
| Enterprise | Custom | ∞ | ∞ |

Descuento 20% en pago anual. Prueba gratuita 14 días.

---

## Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=
DIRECT_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Rebill (suscripciones de Frandora — SaaS Latam)
REBILL_API_KEY=
REBILL_ORGANIZATION_ID=
REBILL_WEBHOOK_SECRET=

# Flow.cl (cobros en reservas — pasarela chilena)
FLOW_API_KEY=
FLOW_SECRET_KEY=
FLOW_API_URL=https://sandbox.flow.cl/api

# Resend (email)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@frandora.cl

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WHATSAPP_NUMBER=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Storage
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=

# App
NEXT_PUBLIC_APP_URL=https://app.frandora.cl
NEXT_PUBLIC_API_URL=https://api.frandora.cl
NEXT_PUBLIC_ROOT_DOMAIN=frandora.cl
```

---

## Convenciones de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
refactor: refactoring sin cambio de comportamiento
style: cambios de estilo/formato
docs: documentación
test: tests
chore: tareas de mantenimiento
```

---

## Fases de Desarrollo

0. Setup y fundación
1. Landing page premium
2. Auth y onboarding
3. Agenda y reservas (core)
4. CRM de clientes
5. Pagos y facturación
6. POS e inventario
7. Marketing y notificaciones
8. Reportes y analytics
9. Super admin
10. Pulido y lanzamiento

**Fase actual:** Fase 9 completada — iniciando Fase 10 (Reportes y Analytics)
