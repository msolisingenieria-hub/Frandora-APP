# Plan Maestro — Frandora APP
# La Plataforma de Agendamiento más Completa del Mundo

> Archivo de referencia permanente. Actualizar al completar cada fase.
> Repositorio: `Frandora-APP` | Rama principal: `main`
> **Regla absoluta de URLs: SIEMPRE `*.frandora.cl` — nunca paths de frandora.cl**

---

## Estado Actual del Proyecto

| Ítem | Estado |
|------|--------|
| Fases completadas | **0 → 15** (fundación + core + infraestructura + página pública premium + formularios clínicos + membresías y portal del cliente + Super Admin) + **Auditoría de Seguridad completa + Sistema de Temas (28/06/2026)** |
| Fase en curso | **16 — IA y Asistente Conversacional** (+ 16.5 Personalización Total en curso) |
| Deploy | ✅ Vercel (`frandora-system`) |
| Base de datos | ✅ Supabase PostgreSQL — 35+ tablas |
| Auth | ✅ Clerk |
| UI base | ✅ Next.js 14, Tailwind, shadcn/ui |
| Pagos Chile | ✅ Flow.cl (reservas) + Rebill (SaaS) |
| Notificaciones | ✅ Resend (email) + Twilio (SMS) |

---

## Arquitectura de URLs — REGLA ABSOLUTA

| Subdominio | Descripción |
|-----------|-------------|
| `frandora.cl` | Landing page pública de Frandora |
| `app.frandora.cl` | Panel del negocio (dashboard) |
| `admin.frandora.cl` | Super Admin de Frandora |
| `api.frandora.cl` | API pública + webhooks |
| `buscar.frandora.cl` | Marketplace de descubrimiento (Fase 20) |
| `[slug].frandora.cl` | Página pública de reservas del negocio |

---

## Stack Tecnológico

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Next.js 14+ App Router | ✅ |
| Lenguaje | TypeScript strict | ✅ |
| Estilos | Tailwind CSS + shadcn/ui | ✅ |
| Animaciones | Framer Motion | ✅ |
| Base de datos | PostgreSQL via Supabase | ✅ |
| ORM | Prisma | ✅ |
| Cache / Colas | Upstash Redis + QStash | ✅ |
| Auth | Clerk | ✅ |
| Suscripciones SaaS | Rebill (Latam) | ✅ |
| Pagos reservas Chile | Flow.cl | ✅ |
| Pagos internacionales | Stripe (Fase 21) | ⏳ |
| Pagos Latam adicional | MercadoPago (Fase 21) | ⏳ |
| Email transaccional | Resend + React Email | ✅ |
| SMS / WhatsApp | Twilio | ✅ |
| Storage | Cloudflare R2 | ✅ |
| Realtime | Supabase Realtime | ✅ |
| Deploy | Vercel (Edge + Serverless) | ✅ |
| Monitoreo errores | Sentry | ✅ |
| Analytics producto | PostHog | ✅ |
| IA / LLM | Claude Haiku 4.5 (Anthropic) | ⏳ Fase 16 |
| Video llamadas | Daily.co / WebRTC | ⏳ Fase 23 |
| App móvil | React Native + Expo | ⏳ Fase 19 |
| i18n | next-intl | ⏳ Fase 21 |

---

## ROADMAP — 4 PILARES

---

## PILAR 1: CORE — Completar la plataforma base (Fases 11–15)

---

### ✅ FASE 0 — Setup y Fundación
- Next.js 14, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Prisma + Supabase PostgreSQL (35+ tablas, schema completo)
- Clerk auth + middleware multi-tenant `*.frandora.cl`
- Deploy base en Vercel
- Design system: Deep Navy + Sage Teal + Poppins + Inter

### ✅ FASE 1 — Landing Page Premium
- Hero animado con Framer Motion, Gradientes navy → blanco
- Secciones: Features, Industrias, Precios, Testimonios, FAQ, Footer
- Responsive mobile-first (320px → 1280px+)

### ✅ FASE 2 — Auth y Onboarding
- Sign-in / Sign-up con Clerk, Wizard de onboarding 5 pasos
- Dashboard inicial con trial banner, stats, setup checklist
- Sidebar premium colapsable con hamburger mobile

### ✅ FASE 3 — Agenda y Reservas (Core)
- Calendario semanal/mensual (react-big-calendar + DnD)
- Vista columnas por profesional, bloqueos de tiempo
- Flujo de reserva: servicio → profesional → fecha → datos → confirmación
- Slots con validación de solapamiento en transacción serializable

### ✅ FASE 4 — CRM de Clientes
- Lista con búsqueda y paginación, perfil completo
- Historial de citas, notas, alergias, preferencias, tags
- Drawer lateral para crear/editar cliente

### ✅ FASE 5 — Pagos y Facturación
- Rebill: suscripciones de planes Frandora (Starter → Scale)
- Flow.cl: cobros en reservas (depósito / pago completo)
- Webhooks Rebill y Flow.cl
- Dashboard de facturación con selector mensual/anual

### ✅ FASE 6 — POS e Inventario
- Inventario: catálogo, stock real, alertas, ajuste manual
- POS Terminal: carrito, descuento, propina, método de pago
- Venta descuenta inventario automáticamente
- Resumen del día: KPIs + desglose por método de pago

### ✅ FASE 7 — Marketing y Notificaciones Automáticas
- Recordatorios 24h y 2h antes: email + SMS
- Confirmación/cancelación/post-servicio: email + SMS
- Cupones (fijo/%), Gift Cards digitales, Programa de Lealtad
- Reseñas verificadas con respuesta del negocio
- Campañas de marketing: estructura base lista

### ✅ FASE 8 — Agenda Avanzada
- Drag & drop para mover citas
- Bloqueos de tiempo (vacaciones, reuniones)
- Buffer y prepTime por servicio
- Clases grupales con cupo y lista de espera
- Exportar cita a Google Calendar / .ics
- Widget embebible (iframe básico)

### ✅ FASE 9 — Gestión de Staff y Recursos
- Perfil completo: nombre, email, bio, rol, color, comisión
- Horario semanal por profesional, vacaciones con rango de fechas
- Reporte de comisiones del mes
- Invitar por correo, desactivar acceso (soft delete)
- Asignación de servicios por profesional

### ✅ FASE 10 — Reportes y Analytics
- 4 KPIs: citas, ingresos, ticket promedio, tasa de cancelación
- Gráfico de ingresos por día (recharts AreaChart)
- Top servicios y rendimiento del equipo
- Estadísticas de clientes: nuevos, recurrentes, en riesgo
- Mapa de calor horario de demanda
- Selector de período: semana / mes / 3 meses
- Exportación CSV

---

### ✅ FASE 11 — Infraestructura Premium

**Objetivo:** Base técnica que soporta escala mundial. Sin esto, todo lo demás es frágil.

#### 11.1 Cache con Upstash Redis
- [x] Cache de slots disponibles (el cuello de botella más grande)
- [x] Cache de perfil del negocio (página pública)
- [x] Cache de analytics/reportes (10 min TTL — overview, revenue, clients)
- [x] Invalidación automática al crear/editar citas
- [x] Rate limiting en APIs públicas (`@upstash/ratelimit`)

#### 11.2 Storage con Cloudflare R2
- [x] Upload de logos, banners, fotos de servicios (`/api/upload`)
- [x] Cliente R2 con presigned URLs para acceso privado
- [x] CDN automático para assets (sin egress fees)

#### 11.3 Supabase Realtime
- [x] `useRealtimeAppointments` — notificación en vivo al crear/actualizar citas
- [x] `useRealtimeNotifications` — notificaciones en tiempo real por usuario/negocio
- [x] Singleton client browser-only (auth persistSession: false)

#### 11.4 Seguridad — Auditoría y Webhooks
- [x] Audit log: `AuditLog` model en Prisma + helper `lib/audit/log.ts`
- [x] Webhook Flow.cl: idempotencia + rate limiting + siempre HTTP 200
- [x] Rate limiting (`@upstash/ratelimit`): booking (10/min), api (60/min), auth (5/min)
- [ ] CAPTCHA en formulario de reserva pública (hCaptcha) — Fase 12
- [ ] Row Level Security en tablas Supabase — pendiente

#### 11.5 Monitoreo y Observabilidad
- [x] Sentry: error tracking con contexto de negocio (`sentry.server.config.ts`)
- [x] PostHog: analytics de producto + feature flags (`PostHogProvider`)
- [ ] Health check endpoint: `GET /api/health` — pendiente
- [ ] Vercel Analytics: Core Web Vitals — pendiente

---

### ✅ FASE 12 — Página Pública Premium (`[slug].frandora.cl`) *(COMPLETADA)*

**Objetivo:** Tan buena que el cliente prefiera reservar aquí que llamar por teléfono.

#### 12.1 Personalización Visual Completa
- [x] Color primario, secundario y acento configurables
- [x] Tipografía elegible: Poppins, Inter, Playfair Display, Montserrat
- [x] Foto de portada o video de fondo
- [x] Layout configurable: servicios en grid o lista
- [x] CSS Variables por negocio: `--biz-primary`, `--biz-secondary`, `--biz-accent`, `--biz-font`, `--biz-radius`
- [x] API `PATCH /api/customization` + invalidación Redis + ISR

#### 12.2 Contenido Premium
- [x] Hero con foto/video + nombre + rating de estrellas + botón "Reservar"
- [x] Galería de fotos con lightbox y scroll horizontal móvil
- [x] Servicios con descripción, duración, precio (grid/lista)
- [x] Perfiles de profesionales con bio y especialidades
- [x] Reseñas verificadas con promedio y distribución de estrellas
- [x] Mapa con iframe embed o fallback Google Maps
- [x] Horarios de atención por día (badge "Abierto ahora")
- [x] FAQ personalizable con acordeón CSS nativo
- [x] API `/api/gallery` (GET/POST/DELETE/PATCH) y `/api/faq` (GET/PUT)

#### 12.3 Flujo de Reserva
- [x] Drawer slide-up mobile / slide-in desktop con animation `cubic-bezier(0.32,0.72,0,1)`
- [x] Pre-selección de servicio o profesional desde la página pública
- [x] Modo `compact` en BookingPage para drawer (sin header duplicado)
- [x] Barra sticky móvil con CTA "Reservar ahora"
- [x] `PublicPageLayout` orquestador con estado del drawer

#### 12.4 SEO Local Completo
- [x] Schema.org `LocalBusiness` + `Service` + `AggregateRating` + `FAQPage` (JSON-LD)
- [x] `generateMetadata()` con Open Graph + Twitter Card por negocio
- [x] ISR `revalidate = 300` (5 min) en page.tsx
- [x] Sitemap dinámico `app/sitemap.ts` (todos los negocios activos, TTL 1h)

#### 12.5 Widget Embebible Real
- [x] `public/widget.js` — modo popup y modo inline
- [x] Personalizable: color del botón, texto, slug del negocio
- [x] API pública: `window.FrandoraWidget.open()` / `.close()`
- [x] Compatible con cualquier CMS sin dependencias

#### 12.6 Infraestructura
- [x] `types/public-page.ts` — tipos enriquecidos `PublicPageData`
- [x] `lib/services/public-page.service.ts` — `getPublicPageData(slug)` con caché Redis
- [x] `app/booking/[slug]/layout.tsx` — inyección CSS vars + Google Fonts dinámico
- [x] Schema Prisma: 10 nuevos campos en `BusinessCustomization` + `specialties` en `StaffMember`

---

### ✅ FASE 13 — Formularios, SOAP Notes y Fichas *(COMPLETADA)*

**Objetivo:** Esencial para clínicas, tattoo, psicólogos, nutricionistas — mercado premium.

#### 13.1 Builder de Formularios
- [x] Campos: texto, número, fecha, sí/no, selector, escala 1-10, firma, email, teléfono, texto largo
- [x] Flag `isConsent` para formularios de consentimiento informado
- [x] Asignar formulario a servicio específico (`ServiceForm` model)
- [x] Tipos pre-cita, post-cita, intake y consentimiento (`FormType`)
- [x] Reordenamiento de campos con flechas arriba/abajo
- [x] Duplicar y eliminar formularios desde el listado
- [ ] Envío automático por email/WhatsApp 24h antes — pendiente Fase 17 (Workflows)
- [ ] Canvas de firma digital (draw) — pendiente Fase 23 (Módulo Salud)
- [ ] Export respuestas de formularios — pendiente Fase 18 (BI)

#### 13.2 SOAP Notes y Fichas Clínicas
- [x] Template estándar: Subjetivo / Objetivo / Evaluación / Plan
- [x] Autosave con debounce de 2s en fichas existentes
- [x] Plantillas SOAP personalizables (crear, renombrar, marcar predeterminada, eliminar)
- [x] Ficha privada/compartida con toggle, historial por negocio
- [x] `clientId` opcional (ficha sin cliente asignado)
- [ ] Export ficha clínica en PDF — pendiente Fase 18 (BI/Reportes)

#### 13.3 Galería Before/After
- [x] Upload de pares antes/después a Cloudflare R2 via presigned URLs
- [x] Privadas por defecto; share token único de 30 días
- [x] Flag `isPublic` + flag `hasConsent` para galería pública del negocio
- [x] Filtro por pública/privada + paginación
- [x] Toggle público/privado desde la tarjeta sin recargar
- [ ] Watermark automático con logo del negocio — pendiente Fase 13.4
- [ ] Página pública `/share/ba/[token]` para ver resultado — pendiente Fase 23

**Archivos creados (Fase 13):**
- `app/(dashboard)/dashboard/formularios/` + `fichas/` + `galeria-clinica/` (3 páginas + 3 loading)
- `components/dashboard/forms/` — `FormsList`, `FormBuilder`, `FieldEditor`
- `components/dashboard/soap/` — `SoapNotesList`, `SoapNoteEditor`, `SoapTemplateManager`
- `components/dashboard/before-after/` — `BeforeAfterGrid`, `BeforeAfterCard`, `BeforeAfterUploader`, `BeforeAfterShareModal`
- `app/api/soap/` + `app/api/before-after/` (rutas completas con GET/POST/PATCH/DELETE)
- `lib/services/soap.service.ts` + `lib/services/before-after.service.ts`
- `types/soap.ts` + `types/before-after.ts`
- Sidebar actualizado con sección "Clínica"

---

### ✅ FASE 14 — Membresías, Paquetes y Portal del Cliente

**Objetivo:** Ingresos recurrentes para el negocio. El modelo más rentable del sector.

#### 14.1 Membresías (Negocio → Sus Clientes)
- [x] Crear planes de membresía: mensual, trimestral, anual con precio y beneficios
- [x] Beneficios configurables: N sesiones incluidas, % de descuento
- [ ] Cobro recurrente automático via Flow.cl (pendiente Fase 17 — workflows)
- [ ] Tarjeta digital de membresía con QR escaneable (pendiente — requiere react-qr-code)
- [x] Pausa y cancelación desde el panel
- [x] Dashboard de suscriptores: activos, vencidos, MRR del negocio

#### 14.2 Paquetes de Sesiones
- [x] Vender paquetes: "10 cortes por $80.000"
- [x] Seguimiento de sesiones usadas vs disponibles por cliente
- [x] Vencimiento configurable (sin vencimiento, 30/60/90/180 días)
- [ ] Descuento automático al usar sesión en POS (pendiente integración POS)

#### 14.3 Portal del Cliente (Self-service)
- [x] Página pública del cliente: `app.frandora.cl/cliente/[token]`
- [x] Ver y gestionar mis próximas reservas
- [x] Ver mi historial de citas
- [x] Ver mi saldo de puntos de lealtad
- [x] Ver mis membresías activas y paquetes disponibles
- [x] Cancelar citas según la política del negocio (canCancel calculado en backend)
- [ ] Descargar comprobantes de pago (PDF) (pendiente Fase 16)

**Archivos creados:**
- `prisma/schema.prisma` — modelos Membership, ClientMembership, SessionPackage, ClientPackage, ClientPortalToken
- `types/membership.ts`, `types/package.ts`, `types/client-portal.ts`
- `lib/services/membership.service.ts`, `lib/services/package.service.ts`, `lib/services/client-portal.service.ts`
- `app/api/memberships/**`, `app/api/packages/**`, `app/api/portal/**`, `app/api/clients/[id]/portal-token`
- `app/(dashboard)/dashboard/membresias/page.tsx`, `app/(dashboard)/dashboard/paquetes/page.tsx`
- `components/dashboard/memberships/**`, `components/dashboard/packages/**`
- `components/client-portal/**`, `app/cliente/[token]/page.tsx`
- `components/dashboard/Sidebar.tsx` — sección "Fidelización" agregada

---

### ✅ FASE 15 — Super Admin Frandora (`admin.frandora.cl`)

**Objetivo:** Control total de la plataforma. El centro nervioso de Frandora.

#### 15.1 Dashboard Financiero de Frandora ✅
- [x] MRR (Monthly Recurring Revenue) en tiempo real
- [x] ARR anualizado, Churn rate mensual
- [x] Nuevos negocios registrados (día / semana / mes)
- [x] LTV promedio por plan, proyección de ingresos

#### 15.2 Gestión de Negocios ✅
- [x] Listado con búsqueda, filtro por plan y estado
- [x] Impersonar cualquier negocio para soporte (sin revelar contraseña)
- [x] Suspender / reactivar / cambiar plan manualmente
- [x] Historial de pagos y notas internas por negocio

> **Extras implementados:** Login exclusivo admin@frandora.cl con formulario branded, formularios de auth personalizados (sin Clerk UI widget) para sign-in y sign-up, schema BusinessStatus + BusinessNote, audit log completo.

#### 15.3 Feature Flags por Plan/Negocio ✅
- [x] Activar/desactivar features sin redeploy
- [x] Rollout gradual a % de negocios (como LaunchDarkly)
- [x] Override por negocio individual (para betas)

#### 15.4 Comunicaciones Globales ✅
- [x] Broadcast email a todos o segmento de negocios
- [x] Anuncios tipo banner en el dashboard de los negocios
- [x] Changelog de nuevas funcionalidades (visible en el panel)

#### 15.5 Sistema de Soporte Integrado ✅
- [x] Tickets de soporte con estado (nuevo, en revisión, resuelto)
- [x] Historial de conversaciones por negocio
- [x] Base de conocimiento interna

---

### ✅ AUDITORÍA COMPLETA — Fases 0-15 (28/06/2026)

#### Seguridad
- [x] Fix vulnerabilidad crítica en review.service.ts (getAppointmentForReview sin businessId)
- [x] Fix vulnerabilidad crítica en notification.service.ts (loadAppointmentData sin businessId)
- [x] Auditoría de 93 API routes — 91/93 correctamente filtran por businessId

#### Sistema de Temas (base para Fase 16+)
- [x] lib/theme/hexToHsl.ts — conversión hex→HSL
- [x] lib/theme/generateThemeCSS.ts — generador de CSS variables + 5 paletas predefinidas
- [x] components/providers/BusinessThemeInjector.tsx — Server Component
- [x] components/providers/BusinessThemeInjectorClient.tsx — Client Component con preview en vivo
- [x] Extensión BusinessCustomization: themeMode, densityPreset, borderRadiusPreset, dashboardBgType, *ColorHsl
- [x] CSS variables --biz-primary, --biz-accent, --biz-secondary, --density-space-*, --biz-radius en globals.css
- [x] Tokens Tailwind: biz-primary, biz-accent, biz-secondary

#### Tests E2E (Playwright)
- [x] 105/105 tests pasando (full-audit.spec.ts — 107 tests definidos)
- [x] Cobertura: landing, auth, onboarding, dashboard (16 páginas), admin, booking, portal cliente
- [x] Responsive: desktop (1280x800), tablet (768x1024), mobile (375x812)

#### Rediseños UI
- [x] admin/feature-flags: 5.5/10 → 9/10 (grupos por scope, barra de progreso, pill mono)
- [x] admin/comunicaciones: 6/10 → 9/10 (bordes semánticos, KPIs, toast feedback)
- [x] dashboard/servicios: 6.5/10 → 9/10 (drawer, tabs categoría, badge visibilidad)
- [x] dashboard/ajustes/personalizacion: NUEVA página (preview en vivo, 5 paletas, density, radius)

---

## PILAR 2: INTELIGENCIA — IA y Automatización (Fases 16–18)

---

### ⏳ FASE 16.5 — Personalización Total (Dashboard + Página Pública)

**Objetivo:** Cada negocio tiene su identidad visual propia en toda la plataforma.

#### 16.5.1 Dashboard del Negocio
- [x] Sistema de temas con CSS variables dinámicas
- [x] 5 paletas predefinidas + picker personalizado
- [x] Densidad: Compact / Normal / Spacious
- [x] Radio de bordes: Sharp / Rounded / Pill
- [x] Preview en vivo sin reload
- [ ] Modo oscuro por negocio
- [ ] Fondo del panel: sólido / gradiente / imagen URL
- [ ] Animaciones: activar/desactivar reducción de movimiento

#### 16.5.2 Página Pública de Reservas
- [x] Color primario, secundario, acento (Fase 12)
- [x] Tipografía elegible (Fase 12)
- [ ] Temas completos intercambiables (usar sistema de themePresets)
- [ ] Editor visual drag-and-drop de secciones
- [ ] Plantillas de página: Minimalista / Premium / Clínica / Fitness

---

### ⏳ FASE 16 — IA Real y Asistente Conversacional

**Objetivo:** Que Frandora trabaje solo mientras el negocio atiende clientes.

#### 16.1 Asistente WhatsApp con IA (Claude Haiku 4.5)
- [ ] Responde mensajes de clientes automáticamente por WhatsApp
- [ ] Convierte consultas en reservas confirmadas en < 60 segundos
- [ ] Conoce el catálogo de servicios, precios, disponibilidad en tiempo real
- [ ] Agenda, cancela y reprograma citas por conversación natural
- [ ] Tono personalizable por el negocio (formal, casual)
- [ ] Escalada automática al humano si no puede resolver
- [ ] Historial de conversaciones en el panel

#### 16.2 Sugerencias Proactivas IA
- [ ] "18% de no-shows esta semana — ¿activar recordatorio 2h antes?"
- [ ] "3 clientes sin visita en 45+ días — ¿enviar campaña de reactivación?"
- [ ] "Martes 3-6pm es tu hora pico — considera precio dinámico"
- [ ] "Producto X lleva 15 días sin venderse — ¿aplicar descuento?"
- [ ] Detección de anomalías: caída brusca en reservas

#### 16.3 Generación Automática de Contenido
- [ ] Descripción de servicios generada por IA desde nombre + duración
- [ ] Respuestas sugeridas a reseñas negativas
- [ ] Asunto y cuerpo de campañas de email basados en objetivo
- [ ] FAQ del negocio generado desde historial de preguntas frecuentes
- [ ] Sugerencia de paleta de colores por IA basada en el nombre/categoría del negocio
- [ ] Generador de logo con IA para negocios sin branding

---

### ⏳ FASE 17 — Workflows de Automatización Visual

**Objetivo:** El negocio configura sus propias automatizaciones sin código.

#### 17.1 Builder Visual de Flujos
- [ ] Interfaz tipo Zapier/Make: trigger → condición → acción
- [ ] 20+ triggers: nueva reserva, cancelación, X días sin visita, cumpleaños, pago recibido, review recibida, saldo bajo de producto, etc.
- [ ] Trigger: cuando un negocio cambia su tema visual (para AB testing de conversión)
- [ ] 20+ acciones: enviar email, SMS, WhatsApp, crear tarea, aplicar cupón, agregar tag, añadir lista de espera, notificar al staff
- [ ] Condiciones: si es cliente nuevo, si el servicio es X, si el monto > Y

#### 17.2 Templates de Workflows por Industria
- [ ] Barbería: recordatorio de corte mensual, campaña de cumpleaños
- [ ] Spa: secuencia post-servicio con oferta de paquete
- [ ] Fitness: reactivación si no viene en 7 días
- [ ] Clínica: seguimiento post-consulta, recordatorio de control
- [ ] Tattoo: seguimiento de cicatrización, cita de retoque

#### 17.3 Analytics de Workflows
- [ ] Ejecuciones totales, tasa de conversión por workflow
- [ ] Revenue atribuido a cada automatización
- [ ] A/B testing de mensajes (qué versión convierte más)

---

### ⏳ FASE 18 — Analytics Avanzado y BI

**Objetivo:** Que el dueño tome decisiones con datos, no con intuición.

#### 18.1 Métricas Avanzadas
- [ ] LTV (Lifetime Value) real por cliente con proyección a 12 meses
- [ ] Frecuencia de visita promedio por segmento
- [ ] Tasa de retención a 30/60/90/180 días (cohort analysis)
- [ ] Predicción de ingresos del mes siguiente (ML simple)
- [ ] Occupancy rate: % del calendario ocupado vs disponible

#### 18.2 Business Intelligence Visual
- [ ] Mapa geográfico de clientes (dónde viven)
- [ ] Funnel completo: visita página → inicia reserva → completa → paga → regresa
- [ ] Comparativa mes a mes con variación %
- [ ] Segmentación: VIP (top 20% por gasto), regulares, en riesgo, inactivos

#### 18.3 Reportes Automáticos
- [ ] Reporte ejecutivo PDF semanal (enviado al correo del dueño)
- [ ] Reporte de comisiones para cada staff (PDF mensual)
- [ ] Reporte contable: ingresos, gastos, utilidad neta
- [ ] PostHog: grabaciones de sesión en página pública, heatmaps, funnels

---

## PILAR 3: ESCALA — Internacional y Mobile (Fases 19–22)

---

### ⏳ FASE 19 — App Móvil Nativa (iOS + Android)

**Objetivo:** El 70% del tráfico es mobile. Necesitamos estar en el bolsillo.

#### 19.1 App del Negocio (Dueño/Staff)
- [ ] Panel completo optimizado para mobile
- [ ] Agenda del día con swipe entre fechas
- [ ] Crear/editar cita desde el teléfono en < 30 segundos
- [ ] Notificaciones push: nueva reserva, cancelación, pago recibido
- [ ] Check-in de clientes con QR desde el teléfono
- [ ] POS simplificado para cobrar en el momento

#### 19.2 App del Cliente (Consumer)
- [ ] Buscar negocios por categoría, ciudad, disponibilidad
- [ ] Reservar en 3 toques
- [ ] Ver historial de citas y próximas reservas
- [ ] Wallet de Gift Cards y puntos de lealtad
- [ ] Cancelar/reprogramar desde la app
- [ ] Notificaciones push de recordatorios

#### 19.3 Publicación
- [ ] App Store (iOS) y Google Play (Android)
- [ ] CI/CD automático con Expo EAS
- [ ] Push notifications via Expo + APNs + FCM

---

### ⏳ FASE 20 — Marketplace de Descubrimiento (`buscar.frandora.cl`)

**Objetivo:** Que los clientes encuentren negocios en Frandora. El efecto red.

#### 20.1 Búsqueda y Descubrimiento
- [ ] Buscar por: ciudad, categoría, servicio, precio, disponibilidad, rating
- [ ] Mapa interactivo con negocios cercanos (Google Maps)
- [ ] Filtros avanzados: abierto ahora, precio bajo/alto, más reseñas
- [ ] Sugerencias personalizadas basadas en historial

#### 20.2 Sistema de Confianza
- [ ] Badge "Negocio Verificado" (verificación de identidad)
- [ ] Badge "Top Frandora" (basado en rating + volumen)
- [ ] Reseñas a nivel marketplace (cruzadas entre negocios)
- [ ] Tiempo de respuesta promedio del negocio

#### 20.3 Reserva Directa desde el Marketplace
- [ ] Sin salir de Frandora, flujo completo en 3 pasos
- [ ] Comisión 0% (ventaja competitiva vs Fresha/Booksy)
- [ ] Premium placement (plan Scale+)

---

### ⏳ FASE 21 — Internacionalización

**Objetivo:** Chile primero, luego Latam en 6 meses, mundo en 12 meses.

#### 21.1 Multi-moneda
- [ ] CLP, USD, EUR, BRL, MXN, ARS, COP, PEN
- [ ] Conversión automática con tasas de cambio actualizadas
- [ ] Formato de número por locale

#### 21.2 Multi-idioma (i18n con `next-intl`)
- [ ] Español (ES-CL, ES-MX, ES-AR) — primero
- [ ] Inglés (EN-US, EN-GB) — segundo
- [ ] Portugués (PT-BR) — tercero
- [ ] Panel de traducciones para agregar idiomas sin código

#### 21.3 Pasarelas Internacionales
- [ ] Stripe: mercado internacional (Europa, USA, Canadá)
- [ ] MercadoPago: México, Argentina, Brasil, Colombia, Perú
- [ ] Flow.cl: Chile (ya implementado)
- [ ] Khipu: Chile (alternativa para transferencias)

#### 21.4 Cumplimiento Legal Internacional
- [ ] GDPR compliance real (Europa): consentimiento, derecho al olvido, DPA
- [ ] LGPD compliance (Brasil)
- [ ] Banner de cookies configurable por región
- [ ] Exportación de datos personales (GDPR art. 20)

---

### ⏳ FASE 22 — API Pública, Webhooks e Integraciones

**Objetivo:** Frandora como plataforma. Que otros construyan encima.

#### 22.1 API Pública REST
- [ ] Documentación OpenAPI/Swagger completa
- [ ] Autenticación por API key (por negocio)
- [ ] Rate limiting por plan
- [ ] SDK oficial: JavaScript / Python / PHP
- [ ] Playground interactivo en la documentación

#### 22.2 Webhooks Configurables
- [ ] El negocio configura su webhook URL
- [ ] Eventos: nueva reserva, cancelación, pago, cliente nuevo, etc.
- [ ] Reintentos automáticos con exponential backoff
- [ ] Log de entregas con payload y respuesta

#### 22.3 Integraciones Nativas
- [ ] Zapier: 50+ apps sin código
- [ ] Make (Integromat): flujos complejos
- [ ] Google Calendar bidireccional (OAuth)
- [ ] QuickBooks / Xero exportación contable (plan Business+)
- [ ] Meta Pixel (Facebook/Instagram Ads tracking)
- [ ] Google Analytics 4
- [ ] Slack: notificaciones al canal del equipo

#### 22.4 White-label (Enterprise)
- [ ] Dashboard con branding propio del cliente enterprise
- [ ] Dominio completamente propio
- [ ] Emails con dominio propio (no frandora.cl)
- [ ] Precio y planes personalizados

---

## PILAR 4: MÓDULOS VERTICALES (Fases 23–26)

---

### ⏳ FASE 23 — Módulo Salud (Clínicas, Psicólogos, Nutricionistas)

- [ ] Historia clínica completa por paciente
- [ ] Teleconsulta por video integrada (Daily.co WebRTC)
- [ ] Zoom link automático al confirmar cita online
- [ ] Recetas médicas digitales con firma
- [ ] Integración con Fonasa/Isapre (Chile, Fase futura)
- [ ] Recordatorio de controles y vacunas

### ⏳ FASE 24 — Módulo Fitness (Gyms, Yoga, Pilates)
- [ ] Planes de entrenamiento asignados por trainer
- [ ] Seguimiento de progreso: peso, medidas, fotos, métricas
- [ ] Streaming de clases grabadas y en vivo
- [ ] Gamificación: badges, rachas de asistencia, rankings
- [ ] Marketplace de programas (trainers venden sus programas)

### ⏳ FASE 25 — Tienda Online (Productos)
- [ ] Catálogo de productos con pasarela de pago
- [ ] Click & Collect (compra online, recoge en local)
- [ ] Envíos con Chilexpress, Starken, DHL
- [ ] Reviews de productos + fotos de clientes
- [ ] Gestión de devoluciones y cambios

### ⏳ FASE 26 — Módulo HR y Nómina (Chile)
- [ ] Control de asistencia del staff (entrada/salida)
- [ ] Cálculo de liquidaciones (código laboral chileno)
- [ ] Adelantos de sueldo con trazabilidad
- [ ] Gestión de vacaciones y permisos
- [ ] Generación de contratos y finiquitos en PDF

---

## Performance y Calidad (Transversal — todas las fases)

### PWA — Progressive Web App
- [ ] Instalar app desde el navegador (iOS + Android)
- [ ] Notificaciones push via Service Worker
- [ ] Funcionalidad básica offline: ver agenda sin internet
- [ ] Splash screen e ícono con branding Frandora

### Modo Oscuro
- [ ] Toggle dark/light en el dashboard
- [ ] Persistencia por usuario (localStorage + OS preference)
- [ ] Página pública respeta preferencia del sistema

### Performance
- [ ] Lighthouse ≥ 90 en todas las páginas
- [ ] Core Web Vitals en verde
- [ ] ISR (Incremental Static Regeneration) para páginas de negocios
- [ ] Edge Runtime en middleware para latencia mínima global
- [ ] Image optimization con next/image + Cloudflare R2
- [ ] DB Connection pooling via Supabase PgBouncer

### Testing y QA
- [ ] Tests E2E Playwright: flujo completo de reserva (guest + auth)
- [ ] Tests unitarios de servicios críticos (appointment, payment, slots)
- [ ] Beta con 10 negocios reales en Chile antes de cada fase mayor
- [ ] Sentry alertas en tiempo real con contexto de negocio

---

## Lanzamiento y Growth

### Lanzamiento Chile (Fase actual)
- [ ] 10 negocios beta, feedback intensivo
- [ ] Contenido TikTok + Instagram + LinkedIn
- [ ] Alianzas con gremios: barberos, esteticistas, fitness
- [ ] Programa de referidos: descuento por recomendar
- [ ] Product Hunt launch

### Latam (6 meses post-Chile)
- [ ] México, Colombia, Perú, Argentina, Brasil
- [ ] Localización de pagos (MercadoPago)
- [ ] Adaptación legal por país

### Mundial (12 meses post-Chile)
- [ ] Europa (GDPR compliant), USA, Canadá
- [ ] Stripe como pasarela principal
- [ ] Soporte en inglés y portugués

---

## REGISTRO DE SKILLS — Cuándo Usar Cada Uno

> Claude debe consultar esta tabla al iniciar cualquier tarea. Elegir el skill más específico disponible.

### Por Tipo de Tarea

| Tarea | Skill a invocar |
|-------|----------------|
| **DISEÑO PREMIUM — Cualquier página o componente nuevo** | `/ui-ux-pro-max` + `/ui-styling` — OBLIGATORIO |
| Cualquier animación o transición nueva | `/emil-design-eng` — OBLIGATORIO antes de escribir |
| Revisar animaciones existentes | `/review-animations` — genera tabla Before/After |
| Nueva landing section / hero | `/ui-ux-pro-max` + `/design` + `/emil-design-eng` |
| Identidad visual, brand assets | `/brand` + `/design-system` |
| Banners de marketing, OG images | `/banner-design` + `/design` |
| Sistema de tokens de diseño | `/design-system` + `/ui-styling` |
| Diseño de feature compleja | `/brainstorming` → `/multi-agent-brainstorming` |
| Nueva API route o servicio | `/nextjs-best-practices` + `/api-security-best-practices` |
| Componente UI nuevo | `/ui-ux-pro-max` + `/ui-styling` + `/shadcn` |
| Query Prisma / DB schema | `/prisma-expert` + `/supabase-postgres-best-practices` |
| Supabase (RLS, Realtime, Storage) | `/supabase` |
| Performance / optimización | `/performance-engineer` + `/nextjs-best-practices` |
| Seguridad / auditoría | `/security-audit` + `/api-security-best-practices` |
| Tests E2E | `/playwright-skill` |
| Tests unitarios | `/tdd-workflows` |
| Feature de IA / LLM | `/claude-api` + `/llm-app-patterns` |
| WhatsApp bot | `/whatsapp-cloud-api` + `/claude-api` |
| App móvil | `/react-native-skills` + `/expo-deployment` |
| Deploy / Vercel | `/vercel-deployment` + `/deploy-to-vercel` |
| SEO página pública | `/nextjs-seo-indexing` + `/seo-aeo-content-cluster` |
| Analytics / PostHog | `/analytics-product` |
| Multi-tenant patterns | `/saas-multi-tenant` |
| Review de código | `/code-review` (level: high) |
| Simplificar código | `/simplify` |
| TypeScript avanzado | `/typescript-expert` |
| React patterns | `/react-best-practices` |
| PWA | `/progressive-web-app` |
| Documentación API | `/api-documentation-generator` |
| Análisis competitivo | `/competitive-landscape` |
| Estrategia de lanzamiento | `/launch-strategy` + `/growth-engine` |

### Skills Prioritarios para Frandora (Top 29)

```
# ═══════ DISEÑO PREMIUM — Los más importantes ═══════
/ui-ux-pro-max                — Design intelligence: 50+ estilos, 161 paletas, 99 reglas UX
/ui-styling                   — shadcn/ui + Tailwind + canvas visual — componentes premium
/emil-design-eng              — Filosofía de animaciones (Emil Kowalski, creador de Sonner)
/review-animations            — Revisor automático de animaciones: tabla Before/After
/design                       — Logo, CIP, banners, iconos, social photos (Gemini AI)
/design-system                — Tokens de diseño: primitive→semantic→component
/brand                        — Voz de marca, identidad visual, guía de estilo
/banner-design                — Banners para marketing, OG images, redes sociales

# ═══════ INFRAESTRUCTURA ═══════
/nextjs-best-practices        — Next.js App Router, RSC, caching
/supabase                     — RLS, Realtime, Storage, Edge Functions
/supabase-postgres-best-practices — Índices, performance, queries
/prisma-expert                — ORM avanzado, relaciones complejas
/shadcn                       — Componentes premium UI (base)
/tailwind-design-system       — Design tokens consistentes
/api-security-best-practices  — Protección de rutas públicas
/saas-multi-tenant            — Isolación de datos por negocio
/performance-engineer         — Core Web Vitals, caching, CDN
/security-audit               — Auditoría completa de seguridad
/playwright-skill             — Tests E2E del flujo de reserva
/react-native-skills          — App móvil iOS + Android
/claude-api                   — Integración IA con Claude Haiku
/whatsapp-cloud-api           — Bot conversacional WhatsApp
/analytics-product            — PostHog, funnels, cohorts
/nextjs-seo-indexing          — SEO dinámico por negocio
/multi-agent-brainstorming    — Planificación de features complejas
/code-review                  — Revisión antes de cada merge
/vercel-deployment            — Deploy y optimización en Vercel
/launch-strategy              — Go-to-market Chile → mundo
```

### Reglas de Animación — Emil Kowalski Skills

> Aplicar **siempre** al tocar animaciones, transiciones o efectos visuales en Frandora.

| Contexto en Frandora | Regla |
|---------------------|-------|
| Landing page (hero, secciones) | `/emil-design-eng` — puede ser más expresivo, son animaciones de primera vez |
| Dashboard (navegación, tabs) | Sub-300ms, ease-out, sin animación en atajos de teclado |
| Booking flow (pasos 1→4) | Transiciones suaves, sin delay, feedback inmediato al tocar |
| Modales y drawers | `ease-out` + `scale(0.95)` initial, `transform-origin: center` |
| Popovers y dropdowns | `transform-origin` desde el trigger, no desde center |
| Botones y CTAs | `scale(0.97)` en `:active` siempre (feedback táctil obligatorio) |
| Toasts y notificaciones | CSS transitions (no keyframes) para interruptibilidad |
| Cards con hover | Máx `scale(1.02)` + `translateY(-2px)`, solo en `hover: hover` |
| Listas (staff, servicios) | Stagger 30-50ms entre items en la entrada inicial |
| Cualquier animación nueva | Invocar `/review-animations` para audit antes del merge |

**Durations de referencia:**
- Botón press: 100-160ms
- Tooltip, popover pequeño: 125-200ms
- Dropdown: 150-250ms
- Modal, drawer: 200-350ms

**Easing estándar Frandora:**
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

---

## REGISTRO DE AGENTES — Cuándo Usar Cada Uno

> Invocar estos agentes en los contextos indicados. Son más poderosos que los skills.

| Agente / Subagent Type | Cuándo usarlo |
|------------------------|---------------|
| `subagent_type: "code-reviewer"` | Antes de cada merge a main importante |
| `subagent_type: "Plan"` | Al inicio de cada nueva fase para diseñar la arquitectura |
| `subagent_type: "Explore"` | Cuando busco archivos/símbolos en el codebase |
| `subagent_type: "general-purpose"` | Investigación extensa que tomaría 3+ queries |
| Agente en background | Tasks independientes: tests + linting en paralelo |

### Flujo de Agentes por Fase Nueva
1. `Plan` agent → diseña arquitectura de la fase
2. Implementación incremental con Claude Code
3. `Explore` agent → verifica consistencia del codebase
4. `code-reviewer` agent → auditoría antes del merge
5. Deploy + verificación con Vercel MCP

---

## MCPs DISPONIBLES Y SU USO

### Activos (ya configurados)
| MCP | Comando | Uso en Frandora |
|-----|---------|-----------------|
| Supabase | `mcp__claude_ai_Supabase__*` | DB queries, tablas, migrations, SQL directo |
| Vercel | `mcp__claude_ai_Vercel__*` | Deploy, logs de errores, dominios |
| Gmail | `mcp__claude_ai_Gmail__*` | Comunicaciones del proyecto |
| Google Calendar | `mcp__claude_ai_Google_Calendar__*` | Planificación de desarrollo |

### Por Instalar (ver comandos abajo)
| MCP | Para qué | Prioridad |
|-----|----------|-----------|
| GitHub | PRs, issues, CI, code review automático | 🔴 Alta |
| Linear | Gestión de tareas y sprints del proyecto | 🟡 Media |
| PostHog | Analytics en tiempo real, feature flags | 🟡 Media |
| Sentry | Error tracking con contexto | 🟡 Media |
| Cloudflare | R2 storage, Workers, DNS | 🟡 Media |
| Upstash | Redis cache, QStash queues | 🟡 Media |
| Figma | Design → código con fidelidad | 🟢 Cuando tengas diseños |

---

## Comandos para Instalar MCPs (ejecutar en terminal)

```bash
# 1. GitHub MCP (gestión de PRs e issues)
# Primero crear un Personal Access Token en github.com/settings/tokens
# Luego agregar a .claude/settings.json

# 2. Verificar los MCPs disponibles en el proyecto
cat .claude/settings.json

# 3. Para instalar MCP servers vía npm en global:
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-postgres
npm install -g @upstash/mcp-server
```

**Configuración a agregar en `.claude/settings.json`:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "TU_TOKEN_AQUI"
      }
    }
  }
}
```

---

## Reglas Técnicas — ABSOLUTAS

1. **Máximo 400 líneas por archivo** — si crece, dividir en sub-módulos
2. **Mobile-first responsive** — 320px / 768px / 1024px / 1280px
3. **No `any` en TypeScript** — usar `unknown` + type guards
4. **API routes delgadas** — lógica siempre en `lib/services/`
5. **No Stripe** — Flow.cl (Chile) + MercadoPago (Latam) + Stripe (internacional Fase 21)
6. **Nunca commitear `.env` o `.env.local`**
7. **SIEMPRE `*.frandora.cl`** — cada módulo es un subdominio
8. **Validar con Zod** en toda API pública
9. **`getBusinessId(userId)`** en toda API autenticada — nunca `findUnique({ id })` sin filtrar por negocio
10. **`npm run verify`** antes de todo push (lint + typecheck + build)
11. **Sin hardcoded URLs** — siempre usar `lib/urls.ts`
12. **Reservas públicas re-validan en backend** — servicio ∈ negocio, profesional ∈ negocio, slot libre, no en el pasado
13. **`prisma db push`** para schema — nunca `migrate reset` en producción
14. **RLS activo** en todas las tablas Supabase expuestas
15. **Rate limiting** en toda ruta pública (Upstash ratelimit)
16. **Plugin de Vercel OBLIGATORIO SIEMPRE** — `vercel-plugin` debe estar instalado y activo (`npx plugins add vercel/vercel-plugin --target claude-code`). Usar `/vercel-plugin:nextjs` para Next.js, `/vercel-plugin:ai-sdk` para IA, `/vercel-plugin:deploy prod` para desplegar. Nunca deshabilitarlo.

---

## Proveedores Clave

| Servicio | Proveedor | Estado |
|---------|-----------|--------|
| Hosting | Vercel (Edge + Serverless) | ✅ |
| Base de datos | Supabase PostgreSQL | ✅ |
| Auth | Clerk | ✅ |
| Suscripciones SaaS Latam | Rebill | ✅ |
| Pagos reservas Chile | Flow.cl | ✅ |
| Pagos internacionales | Stripe (Fase 21) | ⏳ |
| Pagos Latam adicional | MercadoPago (Fase 21) | ⏳ |
| Email transaccional | Resend | ✅ |
| SMS / WhatsApp | Twilio | ✅ |
| Cache y colas | Upstash Redis + QStash | ✅ |
| Storage CDN | Cloudflare R2 | ✅ |
| Monitoreo errores | Sentry | ✅ |
| Analytics producto | PostHog | ✅ |
| IA / LLM | Claude Haiku 4.5 (Anthropic) | ⏳ Fase 16 |
| App móvil CI/CD | Expo EAS | ⏳ Fase 19 |
| Video llamadas | Daily.co | ⏳ Fase 23 |
| i18n | next-intl | ⏳ Fase 21 |
| Dominio | Cloudflare Domains | ⏳ |

---

*Última actualización: 28/06/2026 — Auditoría completa Fases 0-15 + Sistema de Temas + FASE 16.5 incorporada al roadmap.*
*Skills activos: 20 prioritarios documentados. Agentes: workflow definido por fase. MCPs: 4 activos + 7 por instalar.*
*Plan maestro world-class — 26 fases + 16.5, 4 pilares, registro completo de skills/agentes/MCPs.*
