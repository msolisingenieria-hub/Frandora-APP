# Plan de Desarrollo — Frandora APP

> Archivo de referencia permanente. Actualizar al completar cada fase.
> Repositorio: `Frandora-APP` | Rama principal: `main`
> **URL base: `*.frandora.cl` — SIEMPRE subdominio. Nunca paths de frandora.cl.**

---

## Estado Actual del Proyecto

| Ítem | Estado |
|------|--------|
| Fase actual | **Fase 7 completada** — Iniciando Fase 8 |
| Deploy en Vercel | ✅ Activo (`frandora-system`) |
| Base de datos | ✅ Supabase PostgreSQL — 26+ tablas activas |
| Auth | ✅ Clerk configurado |
| UI base | ✅ Next.js 14, Tailwind, shadcn/ui, Lucide icons |

---

## Arquitectura de URLs — REGLA ABSOLUTA

| Subdominio | Qué es |
|-----------|--------|
| `frandora.cl` | Landing page pública de Frandora |
| `app.frandora.cl` | Panel del negocio (dashboard) |
| `admin.frandora.cl` | Super Admin de Frandora |
| `api.frandora.cl` | API pública / webhooks |
| `[slug].frandora.cl` | Página pública de reservas del negocio |
| `[slug].frandora.cl` (dominio propio) | CNAME → plan Business+ |

Ejemplos: `barberia-don-pepe.frandora.cl`, `spa-serenidad.frandora.cl`, `studio-yoga-paz.frandora.cl`

---

## Stack Tecnológico

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Next.js 14+ (App Router) | ✅ |
| Lenguaje | TypeScript strict | ✅ |
| Estilos | Tailwind CSS + shadcn/ui | ✅ |
| Animaciones | Framer Motion | ✅ |
| Base de datos | PostgreSQL via Supabase | ✅ |
| ORM | Prisma | ✅ |
| Cache | Upstash Redis | ⏳ |
| Auth | Clerk | ✅ |
| Suscripciones SaaS | Rebill (Latam) | ✅ Fase 5 |
| Pagos reservas | Flow.cl (Chile) | ✅ Fase 5 |
| Email | Resend + React Email | ✅ Fase 7 |
| SMS/WhatsApp | Twilio | ✅ Fase 7 |
| Storage | Cloudflare R2 | ⏳ Fase 4+ |
| Realtime | Supabase Realtime | ⏳ Fase 7 |
| Deploy | Vercel | ✅ |
| Monitoreo | Sentry + PostHog | ⏳ Fase 10 |

---

## Fases de Desarrollo

### ✅ FASE 0 — Setup y Fundación
- Next.js 14, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Prisma + Supabase PostgreSQL (26 tablas)
- Clerk auth configurado
- Middleware multi-tenant por subdominio `*.frandora.cl`
- Deploy base en Vercel
- Design system: Deep Navy + Sage Teal + Poppins + Inter

### ✅ FASE 1 — Landing Page Premium
- Hero animado con Framer Motion
- Secciones: Features, Industrias, Precios, Testimonios, FAQ, Footer
- Responsive mobile-first
- Gradientes navy → blanco

### ✅ FASE 2 — Auth y Onboarding
- Sign-in / Sign-up con Clerk
- Wizard de onboarding 5 pasos
- Dashboard inicial con trial banner, stats, setup checklist
- Sidebar premium con gradiente y secciones

### ✅ FASE 3 — Agenda y Reservas (Core)
- Calendario semanal/mensual (react-big-calendar)
- Crear/editar/cancelar citas desde dashboard
- Página pública de reservas en `[slug].frandora.cl`
- Flujo de reserva: servicio → profesional → fecha/hora → datos → confirmación
- Slots de disponibilidad con bloqueo de solapamiento

### ✅ FASE 4 — CRM de Clientes
- Lista de clientes con búsqueda y paginación
- Perfil: historial de citas, notas, alergias, preferencias
- Drawer lateral: ver / editar / crear cliente
- Historial de atenciones

### ✅ FASE 5 — Pagos y Facturación
- Rebill — suscripciones de planes Frandora (Starter → Scale)
- Flow.cl — cobros en reservas (depósito / pago completo)
- Webhooks Rebill y Flow.cl
- Dashboard de facturación con selector de plan mensual/anual

### ✅ FASE 6 — POS e Inventario
- Inventario: catálogo, stock real, alertas stock bajo, ajuste manual
- POS Terminal: grilla de productos, carrito, descuento, propina, método de pago
- Venta → descuenta inventario automáticamente
- Resumen del día: KPIs + desglose por método de pago

---

### ✅ FASE 7 — Marketing y Notificaciones Automáticas

**Objetivo:** Que el negocio nunca pierda un cliente por olvido. Comunicación automática en todos los canales.

#### 7.1 Recordatorios automáticos de citas
- [x] 24 horas antes: email + SMS
- [x] 2 horas antes: SMS
- [x] Confirmación inmediata al reservar: email + SMS
- [ ] Recordatorio de reprogramación al cancelar *(próxima iteración)*
- [ ] Reducción de no-shows (meta: -40%) *(se mide en producción)*

#### 7.2 Emails automáticos (Resend + React Email)
- [x] Bienvenida al nuevo cliente del negocio
- [x] Confirmación de reserva (con detalle completo)
- [x] Cancelación con opción de reprogramar
- [x] Post-servicio: gracias + solicitud de reseña
- [ ] Cumpleaños con cupón de regalo *(Fase 7 próxima iteración)*
- [ ] Reactivación *(Fase 7 próxima iteración)*
- [ ] Factura / comprobante de pago *(Fase 12)*
- [ ] Plan próximo a vencer *(Fase 14)*

#### 7.3 SMS (Twilio)
- [x] Confirmación de reserva
- [x] Recordatorio 24h y 2h antes
- [x] Cancelación
- [x] Mensaje de bienvenida
- [ ] Campañas masivas segmentadas *(Fase 7.5 pendiente)*

#### 7.4 WhatsApp Business (Twilio)
- [x] Estructura cliente preparada (sendWhatsApp en lib/sms/client.ts)
- [ ] Notificaciones activas *(requiere cuenta WhatsApp Business aprobada)*
- [ ] Bot de respuesta automática *(Fase 16 — IA)*
- [ ] Campañas masivas WhatsApp *(Fase 7.5 pendiente)*

#### 7.5 Campañas de Marketing
- [x] Página `/dashboard/marketing` — vista de avisos activos y campañas
- [ ] Builder visual de campañas *(requiere plan Profesional+)*
- [ ] Segmentación de clientes *(Fase 10)*
- [ ] Métricas de apertura/clics *(requiere integración Resend webhooks)*

#### 7.6 Programa de Lealtad — ⏳ Próxima iteración
- [ ] Configurar puntos por reserva/compra/referido
- [ ] Canjear puntos como descuento

#### 7.7 Cupones y Descuentos — ⏳ Próxima iteración
- [ ] Crear cupones por monto fijo o porcentaje
- [ ] Validar al reservar y en POS

#### 7.8 Gift Cards Digitales — ⏳ Próxima iteración
- [ ] Generar gift card con código único
- [ ] Venta desde `[slug].frandora.cl`

#### 7.9 Reseñas y Reputación — ⏳ Próxima iteración
- [ ] Formulario de reseña (1-5 estrellas + comentario)
- [ ] Publicar en página pública del negocio

---

#### Lo que se construyó en esta fase (archivos creados)
| Archivo | Qué hace |
|---------|----------|
| `lib/email/client.ts` | Wrapper Resend — init diferido, no falla sin API key |
| `lib/email/templates.ts` | 5 plantillas HTML en español chileno con branding Frandora |
| `lib/sms/client.ts` | Wrapper Twilio — SMS + WhatsApp, no falla sin credenciales |
| `lib/sms/templates.ts` | 4 mensajes SMS cortos en español chileno |
| `lib/services/notification.service.ts` | Orquestador central — email+SMS para todos los eventos |
| `app/api/notifications/reminders/route.ts` | Endpoint cron (cada 30 min) — protegido por CRON_SECRET |
| `app/api/notifications/send/route.ts` | Envío manual desde el panel |
| `app/api/appointments/public/route.ts` | Dispara confirmación al crear reserva pública |
| `app/(dashboard)/dashboard/marketing/page.tsx` | Página "Marketing y avisos" en el panel |
| `vercel.json` | Cron Vercel cada 30 minutos apuntando al endpoint |

---

### ⏳ FASE 8 — Gestión Avanzada de Agenda

**Objetivo:** Agenda 100% profesional, al nivel de cualquier software enterprise.

#### 8.1 Funcionalidades avanzadas del calendario
- [ ] Drag & drop para mover citas
- [ ] Vista columnas por profesional (recursos)
- [ ] Citas recurrentes (semanal, mensual)
- [ ] Lista de espera (Waitlist automático)
- [ ] Bloqueos de tiempo (vacaciones, descansos, reuniones)
- [ ] Reserva de múltiples servicios en una misma cita
- [ ] Citas grupales / clases con capacidad máxima
- [ ] Buffer entre citas configurable por servicio
- [ ] Tiempo de preparación previo (limpieza de sala, etc.)
- [ ] Color por servicio / profesional / estado
- [ ] Notas internas visibles solo al staff

#### 8.2 Gestión de clases y sesiones grupales
- [ ] Crear clases con cupo máximo
- [ ] Inscripción online desde página pública
- [ ] Lista de espera automática (si el cupo está lleno)
- [ ] Cobro online al inscribirse
- [ ] Check-in de asistentes (marcar presentes)
- [ ] Cancelar clase → notificar inscritos automáticamente
- [ ] Paquetes de N sesiones (ej: 10 clases de yoga)

#### 8.3 Sincronización con calendarios externos
- [ ] Google Calendar: bidireccional (importar y exportar citas)
- [ ] Apple Calendar / Outlook: exportar ics
- [ ] El cliente puede agregar su cita a Google Calendar desde el email
- [ ] Detectar conflictos con eventos del calendario personal del staff

#### 8.4 Agenda desde múltiples canales
- [ ] Reserva desde `[slug].frandora.cl` (página pública)
- [ ] Widget de reserva embebible (iframe) para el sitio web propio del negocio
- [ ] Botón "Reservar" en Instagram (perfil)
- [ ] Botón "Reservar" en Facebook (página)
- [ ] Botón "Reservar" en Google Business Profile
- [ ] Reserva por WhatsApp (bot conversacional)
- [ ] Link de reserva personalizable (`reserva.frandora.cl/[slug]`)

---

### ⏳ FASE 9 — Gestión de Staff y Recursos

**Objetivo:** Control profesional de cada integrante del equipo.

#### 9.1 Perfil de profesionales
- [ ] Foto, bio, especialidades, años de experiencia
- [ ] Portfolio de trabajos (antes/después)
- [ ] Calificación promedio de reseñas
- [ ] Servicios que ofrece (asignar por profesional)
- [ ] Visibilidad en página pública (on/off)
- [ ] Múltiples roles por persona (staff + recepcionista)

#### 9.2 Horarios y disponibilidad
- [ ] Horario base semanal (por día y hora)
- [ ] Excepciones: días libre individuales, feriados
- [ ] Vacaciones con rango de fechas
- [ ] Turnos rotativos
- [ ] Disponibilidad por ubicación (si tiene múltiples sedes)

#### 9.3 Comisiones y rendimiento
- [ ] Configurar comisión por porcentaje o monto fijo por servicio
- [ ] Comisión sobre ventas de productos en POS
- [ ] Reporte de comisiones por período
- [ ] Ranking de staff por ingresos generados
- [ ] Metas mensuales con seguimiento visual
- [ ] Exportar liquidación de comisiones (PDF/Excel)

#### 9.4 Control de acceso por rol
- [ ] BUSINESS_OWNER: todo el sistema
- [ ] MANAGER: agenda + clientes + reportes (sin facturación)
- [ ] STAFF: solo su agenda y clientes asignados
- [ ] RECEPTIONIST: crear/editar citas y clientes
- [ ] Invitar staff por email desde el panel
- [ ] Revocar acceso con un click

---

### ⏳ FASE 10 — Reportes y Analytics

**Objetivo:** Datos para decisiones. Cada número tiene contexto.

#### 10.1 Dashboard ejecutivo
- [ ] Ingresos del día / semana / mes con comparativa vs período anterior
- [ ] Ticket promedio
- [ ] Nuevos clientes vs recurrentes
- [ ] Tasa de ocupación del calendario (%)
- [ ] Tasa de cancelación y no-show
- [ ] Top servicios más vendidos
- [ ] Top profesionales por ingreso
- [ ] Horas pico de demanda (mapa de calor)
- [ ] Proyección del mes basada en tendencia

#### 10.2 Reportes financieros
- [ ] Ingresos por servicio, profesional, período, método de pago
- [ ] Gastos registrables (proveedor, categoría, fecha)
- [ ] Rentabilidad neta (ingresos - gastos - comisiones)
- [ ] Cierre de caja diario con detalle por método
- [ ] Comparativa mes a mes
- [ ] Exportar a Excel / PDF / CSV

#### 10.3 Reportes de clientes
- [ ] Clientes nuevos por período
- [ ] LTV (valor de vida del cliente)
- [ ] Frecuencia de visita promedio
- [ ] Clientes en riesgo de abandono (sin visita en X días)
- [ ] Segmentos por gasto total
- [ ] Mapa de clientes por zona geográfica (Google Maps)

#### 10.4 Reportes de inventario
- [ ] Productos más vendidos
- [ ] Rotación de stock
- [ ] Valor total del inventario en tiempo real
- [ ] Historial de movimientos por producto
- [ ] Alerta de productos vencidos (si aplica)

#### 10.5 Reportes de marketing
- [ ] Tasas de apertura y clics de campañas de email
- [ ] Cupones más utilizados y su impacto en ingresos
- [ ] Reseñas: promedio, evolución, NPS
- [ ] Tasa de conversión de la página pública (visitas → reservas)
- [ ] Canales de origen de nuevas reservas

#### 10.6 Integración PostHog
- [ ] Funnel de conversión en página pública
- [ ] Grabaciones de sesión del flujo de reserva
- [ ] Feature flags para rollout gradual
- [ ] Análisis de cohorts de clientes

---

### ⏳ FASE 11 — Formularios, Consentimientos y Fichas Clínicas

**Objetivo:** Módulo esencial para clínicas estéticas, tattoo, salud y bienestar.

#### 11.1 Builder de formularios
- [ ] Drag & drop para crear formularios personalizados
- [ ] Tipos de campo: texto, número, fecha, sí/no, selector, escala, firma
- [ ] Formularios de intake (pre-cita): datos del cliente, antecedentes médicos
- [ ] Consentimientos informados con firma digital
- [ ] Asignar formulario a servicio específico
- [ ] Envío automático por email/WhatsApp antes de la cita

#### 11.2 SOAP Notes (clínicas y bienestar)
- [ ] Template estándar: Subjetivo / Objetivo / Evaluación / Plan
- [ ] Templates personalizables por tipo de servicio
- [ ] Adjuntar fotos a la nota
- [ ] Historial de notas por cliente (privadas, solo staff)
- [ ] Exportar ficha clínica en PDF

#### 11.3 Galería de resultados
- [ ] Fotos antes/después por cita (privadas por defecto)
- [ ] Compartir con cliente por link seguro
- [ ] Galería pública en página del profesional (si el cliente consiente)

---

### ⏳ FASE 12 — Membresías y Paquetes

**Objetivo:** Ingresos recurrentes para el negocio más allá de las reservas.

#### 12.1 Membresías del negocio a sus clientes
- [ ] Crear planes: mensual, trimestral, anual
- [ ] Incluir: N sesiones, descuento sobre tarifa, acceso a servicios exclusivos
- [ ] Cobro recurrente automático (Flow.cl / Rebill)
- [ ] Pausa y cancelación desde el panel
- [ ] Notificación de renovación automática
- [ ] Tarjeta digital de membresía

#### 12.2 Paquetes de sesiones
- [ ] Comprar 10 clases y usar durante 3 meses
- [ ] Seguimiento de sesiones usadas vs disponibles
- [ ] Transferir sesiones a otro cliente (con permiso)
- [ ] Paquete compartido (pareja / familia)
- [ ] Vencimiento automático si no se usan

#### 12.3 Suscripciones y cobros recurrentes del negocio
- [ ] El negocio puede crear sus propios planes de membresía
- [ ] Dashboard de suscriptores activos
- [ ] Gestión de pagos fallidos (reintentos automáticos)

---

### ⏳ FASE 13 — Página Pública Premium (`[slug].frandora.cl`)

**Objetivo:** La página pública debe ser tan buena que el cliente quiera quedarse.

#### 13.1 Personalización visual por negocio
- [ ] Color primario, secundario y acento configurables
- [ ] Tipografía elegible (Poppins, Inter, Playfair, etc.)
- [ ] Foto de portada o video de fondo (16:9)
- [ ] Logo propio
- [ ] Bio del negocio (texto + emojis)
- [ ] Links a redes sociales (Instagram, TikTok, Facebook, YouTube)
- [ ] Layout editable: servicios verticales u horizontales, galería, etc.

#### 13.2 Contenido de la página
- [ ] Hero con foto + nombre + botón "Reservar ahora"
- [ ] Galería de fotos del local (carrusel)
- [ ] Lista de servicios con foto, descripción, duración y precio
- [ ] Perfiles de profesionales con foto y especialidades
- [ ] Reseñas verificadas con promedio de estrellas
- [ ] Ubicación con Google Maps integrado
- [ ] Horarios de atención
- [ ] FAQ personalizable del negocio

#### 13.3 Flujo de reserva en página pública
- [ ] Selección de servicio → selección de profesional (o "cualquiera disponible") → fecha y hora → datos del cliente → pago (si aplica) → confirmación
- [ ] Reservar como invitado o registrarse
- [ ] Confirmación por email + WhatsApp + SMS
- [ ] Botón "Agregar a Google Calendar / Apple Calendar"
- [ ] Política de cancelación visible antes de confirmar
- [ ] Código de reserva único

#### 13.4 Widget embebible
- [ ] Botón/widget de reserva para el sitio web propio del negocio
- [ ] Personalizable (color, texto, tamaño)
- [ ] Código `<script>` de una línea para copiar y pegar
- [ ] Modo popup o inline

#### 13.5 Dominio propio (plan Business+)
- [ ] El negocio puede usar `reservas.miempresa.cl`
- [ ] Instrucciones claras de configuración CNAME
- [ ] SSL automático via Vercel

---

### ⏳ FASE 14 — Super Admin Frandora (`admin.frandora.cl`)

**Objetivo:** Control total de la plataforma desde un solo lugar.

#### 14.1 Dashboard de negocio de Frandora
- [ ] MRR (Monthly Recurring Revenue) en tiempo real
- [ ] ARR anualizado
- [ ] Churn rate mensual
- [ ] Nuevos negocios registrados (día / semana / mes)
- [ ] Negocios activos vs en trial vs cancelados
- [ ] LTV promedio por plan
- [ ] Proyección de ingresos próximo mes

#### 14.2 Gestión de negocios
- [ ] Listado de todos los negocios (búsqueda, filtro por plan, estado)
- [ ] Ver panel completo de cualquier negocio (impersonar)
- [ ] Suspender / reactivar negocio
- [ ] Cambiar plan manualmente
- [ ] Historial de pagos por negocio
- [ ] Notas internas de soporte

#### 14.3 Gestión de planes y precios
- [ ] Crear / editar / archivar planes globales
- [ ] Cambiar precios sin afectar suscriptores actuales
- [ ] Cupones de descuento globales para captación
- [ ] Periodos de prueba configurables
- [ ] Descuentos especiales para planes anuales

#### 14.4 Comunicaciones globales
- [ ] Broadcast email a todos los negocios (o segmento)
- [ ] Anuncios en el dashboard de todos los negocios
- [ ] Notificaciones de mantenimiento programado
- [ ] Changelog de nuevas funcionalidades

#### 14.5 Configuración técnica
- [ ] Gestión de proveedores (Rebill, Flow.cl, Twilio, Resend)
- [ ] Logs de webhooks y errores
- [ ] Monitor de health del sistema
- [ ] Feature flags por plan o por negocio
- [ ] Gestión de integraciones y API keys

#### 14.6 Soporte
- [ ] Sistema de tickets de soporte
- [ ] Historial de conversaciones por negocio
- [ ] Base de conocimiento interna
- [ ] Tiempo de respuesta promedio

---

### ⏳ FASE 15 — Configuración del Negocio (Settings)

**Objetivo:** El negocio configura Frandora exactamente como necesita su industria.

#### 15.1 Datos del negocio
- [ ] Nombre, logo, banner, descripción
- [ ] Categoría de negocio (barbería, spa, clínica, fitness, etc.)
- [ ] Dirección, teléfono, email, sitio web
- [ ] Múltiples ubicaciones (plan Business+)
- [ ] Zona horaria y moneda
- [ ] Redes sociales

#### 15.2 Política de reservas
- [ ] Tiempo mínimo de anticipación para reservar (ej: 2 horas antes)
- [ ] Máximo de días hacia adelante para reservar (ej: 60 días)
- [ ] Política de cancelación (ej: cancelar hasta 24h antes sin costo)
- [ ] Cargo por cancelación tardía (% del servicio)
- [ ] Cargo por no-show (% del servicio)
- [ ] Requiere confirmación manual de la cita (no automática)
- [ ] Acepta reservas fuera de horario (lista de espera)

#### 15.3 Métodos de pago aceptados
- [ ] Efectivo / Tarjeta / Transferencia / QR / Online
- [ ] Configurar si se cobra al reservar (depósito o total) o al finalizar
- [ ] Moneda del negocio
- [ ] Configurar Flow.cl (API key propia o compartida con Frandora)

#### 15.4 Notificaciones del negocio
- [ ] Activar/desactivar cada tipo de notificación por canal
- [ ] Personalizar textos de emails y SMS (templates editables)
- [ ] Horario de silencio para no enviar SMS de madrugada
- [ ] Firma personalizada en emails

#### 15.5 Integraciones externas
- [ ] Google Calendar sync
- [ ] Google Analytics (insertar ID)
- [ ] Meta Pixel (insertar ID)
- [ ] Webhook personalizado (para integraciones propias)
- [ ] Zapier / Make (plan Scale+)
- [ ] QuickBooks / Xero exportación (plan Business+)

---

### ⏳ FASE 16 — IA y Automatización Avanzada

**Objetivo:** Que Frandora trabaje solo mientras el negocio atiende clientes.

#### 16.1 Asistente IA del negocio
- [ ] Responde mensajes de clientes automáticamente (WhatsApp / email)
- [ ] Convierte consultas en reservas confirmadas en < 60 segundos
- [ ] Conoce el catálogo de servicios, precios y disponibilidad en tiempo real
- [ ] Responde preguntas frecuentes del negocio (horarios, ubicación, precios)
- [ ] Agenda/cancela/reprograma citas por conversación natural
- [ ] Tono personalizable (formal, casual, etc.)
- [ ] Historial de conversaciones en el panel

#### 16.2 Automatizaciones configurables (Workflows)
- [ ] Builder visual de flujos: trigger → condición → acción
- [ ] Triggers: nueva reserva, cancelación, X días sin visita, cumpleaños, pago recibido
- [ ] Acciones: enviar email, enviar SMS, crear tarea, añadir tag, enviar cupón
- [ ] Templates de workflows preconfigurados por industria
- [ ] Workflows activos/inactivos con estadísticas

#### 16.3 Sugerencias IA para el negocio
- [ ] "3 clientes sin cita en 30+ días — enviar campaña de reactivación"
- [ ] "Tu tasa de no-show esta semana es 18% — activa recordatorio 2h antes"
- [ ] "El martes 3-6pm es tu hora pico — considera precio dinámico"
- [ ] "Producto X lleva 15 días sin venderse — considera un descuento"

---

### ⏳ FASE 17 — Pulido, Performance y Lanzamiento

#### 17.1 Performance
- [ ] Lighthouse ≥ 90 en todas las páginas (Performance, Accessibility, SEO)
- [ ] Core Web Vitals en verde
- [ ] Lazy loading de imágenes
- [ ] CDN para assets (Cloudflare R2)
- [ ] Edge caching en Vercel

#### 17.2 Modo oscuro
- [ ] Toggle dark/light en el dashboard
- [ ] Persistencia por usuario (localStorage + preferencia del sistema)
- [ ] Página pública respeta preferencia del sistema

#### 17.3 PWA (Progressive Web App)
- [ ] Instalar app desde el navegador (iPhone + Android)
- [ ] Notificaciones push
- [ ] Funcionalidad básica offline (ver agenda sin internet)
- [ ] Splash screen y ícono de app con branding Frandora

#### 17.4 App móvil nativa (futuro)
- [ ] React Native con Expo
- [ ] Mismas funcionalidades que el dashboard web
- [ ] Publicar en App Store + Google Play
- [ ] Notificaciones push nativas

#### 17.5 Legal y cumplimiento
- [ ] Términos y Condiciones para negocios
- [ ] Términos para clientes finales (en página pública)
- [ ] Política de Privacidad (GDPR/LGPD compatible)
- [ ] Política de Cookies con banner
- [ ] Política de Reembolsos
- [ ] Acuerdo de Procesador de Datos (DPA)
- [ ] Derecho al olvido (eliminar cuenta + datos)
- [ ] Exportación de datos personales (GDPR art. 20)

#### 17.6 SEO para páginas públicas
- [ ] Meta tags dinámicos por negocio (slug.frandora.cl)
- [ ] Open Graph y Twitter Cards con foto del negocio
- [ ] Schema.org `LocalBusiness` + `Service` + `Review`
- [ ] Sitemap dinámico de todos los negocios públicos
- [ ] Google Business Profile: botón "Reservar" directo
- [ ] Slug personalizable por el propietario (SEO-friendly)

#### 17.7 Testing y QA
- [ ] Tests E2E con Playwright (flujo completo de reserva)
- [ ] Tests unitarios de servicios críticos
- [ ] Beta con 10 negocios reales en Chile
- [ ] Monitoreo de errores con Sentry
- [ ] Analytics de comportamiento con PostHog

#### 17.8 Launch público
- [ ] Anuncio en redes sociales de Frandora
- [ ] Plan de contenido: TikTok, Instagram, LinkedIn
- [ ] Alianzas con gremios (barberos, esteticistas, etc.)
- [ ] Programa de referidos para negocios (descuento por recomendar)
- [ ] Product Hunt launch

---

## Industrias Objetivo (Personalización por tipo de negocio)

| Industria | Personalización específica |
|-----------|---------------------------|
| Barberías | Vista de sillas, tiempo de corte, combo de servicios |
| Salones de belleza | Galería de trabajos, extensiones, tinte |
| Spas / Masajes | Salas de tratamiento, terapeutas, paquetes relajación |
| Clínicas estéticas | SOAP notes, consentimientos, fotos antes/después |
| Centros de fitness | Clases grupales, cupos, entrenadores, paquetes |
| Yoga / Pilates | Series de sesiones, niveles, instructor favorito |
| Tattoo / Piercing | Formulario de diseño, galería portfolio, depósito obligatorio |
| Veterinarias | Ficha de mascota, historial médico, recordatorio vacunas |
| Clínicas dentales / médicas | Historia clínica, recetas, código médico |
| Fotógrafos / Videógrafos | Moodboard, entrega digital, sesiones |
| Coaches / Consultores | Sesiones virtuales, Zoom link automático, notas de sesión |
| Peluquerías caninas | Ficha de mascota, fotos antes/después |
| Nutricionistas / Psicólogos | Formularios clínicos, notas de sesión, video llamada |

---

## Planes de Frandora

| Característica | Starter | Professional | Business | Scale | Enterprise |
|---|---|---|---|---|---|
| **Precio mensual** | $19 USD | $49 USD | $99 USD | $179 USD | Custom |
| **Precio anual (20% off)** | $15/m | $39/m | $79/m | $143/m | Custom |
| Staff incluidos | 1 | 3 | 10 | ∞ | ∞ |
| Ubicaciones | 1 | 1 | 3 | ∞ | ∞ |
| Reservas/mes | 200 | 1.000 | ∞ | ∞ | ∞ |
| Recordatorios auto | Email | Email+SMS | Email+SMS+WA | Email+SMS+WA | Email+SMS+WA |
| Campañas marketing | ✗ | Email | Email+SMS | Email+SMS+WA | Custom |
| POS | ✓ | ✓ | ✓ | ✓ | ✓ |
| Inventario | ✗ | ✓ | ✓ | ✓ | ✓ |
| Gift cards | ✗ | ✓ | ✓ | ✓ | ✓ |
| Membresías | ✗ | ✗ | ✓ | ✓ | ✓ |
| Programa de lealtad | ✗ | ✗ | ✓ | ✓ | ✓ |
| Formularios/consentimientos | ✗ | ✓ | ✓ | ✓ | ✓ |
| Dominio propio | ✗ | ✗ | ✓ | ✓ | ✓ |
| Widget embebible | ✗ | ✓ | ✓ | ✓ | ✓ |
| Reportes avanzados | ✗ | ✓ | ✓ | ✓ | ✓ |
| Comisiones staff | ✗ | ✗ | ✓ | ✓ | ✓ |
| IA asistente | ✗ | ✗ | ✗ | ✓ | ✓ |
| Workflows automáticos | ✗ | ✗ | ✓ | ✓ | ✓ |
| API acceso | ✗ | ✗ | ✗ | ✓ | ✓ |
| White-label | ✗ | ✗ | ✗ | ✗ | ✓ |
| Soporte | Chat | Chat | Prioritario | Prioritario | Dedicado |
| Prueba gratis | 14 días | 14 días | 14 días | 14 días | Demo |

---

## Reglas Técnicas Críticas (Recordatorio)

1. **Máximo 400 líneas por archivo** — sin excepciones
2. **Mobile-first responsive** — 320px / 768px / 1024px
3. **No `any` en TypeScript** — usar `unknown` + type guards
4. **API routes delgadas** — lógica en `lib/services/`
5. **No Stripe** — Flow.cl para cobros, Rebill para suscripciones SaaS
6. **Nunca commitear `.env` o `.env.local`**
7. **SIEMPRE `*.frandora.cl`** — cada módulo es un subdominio, nunca un path de frandora.cl

---

## Proveedores Clave

| Servicio | Proveedor | Por qué |
|---|---|---|
| Hosting | Vercel | Mejor para Next.js, CDN global |
| Base de datos | Supabase | PostgreSQL + realtime + storage |
| Auth | Clerk | Premium, seguro, fácil |
| Suscripciones SaaS | Rebill | Líder en Latam para SaaS |
| Pagos en reservas | Flow.cl | Pasarela chilena, todas las tarjetas |
| Email transaccional | Resend | Moderno, $0/3K emails |
| SMS/WhatsApp | Twilio | Estándar global, API confiable |
| Cache/Colas | Upstash Redis | Serverless, paga por uso |
| Storage | Cloudflare R2 | Sin egress fees |
| Monitoreo errores | Sentry | Error tracking en tiempo real |
| Analytics | PostHog | Open source, feature flags, grabaciones |
| IA | Claude Haiku 4.5 | Asistente conversacional del negocio |

---

*Última actualización: Fase 7 completada — iniciando Fase 8 (Gestión Avanzada de Agenda)*
