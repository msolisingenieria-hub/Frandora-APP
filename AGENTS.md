# Frandora APP - Reglas para agentes

## Verificacion obligatoria

Antes de hacer push o abrir PR, ejecutar:

```bash
npm run verify
```

Si el cambio toca UI publica, landing, reservas, auth, middleware o responsive, ejecutar ademas:

```bash
npm run verify:e2e
```

`npm run build` requiere variables reales de Clerk y base de datos. Si falla por variables faltantes, no se debe pushear hasta configurarlas en local o confirmar que Vercel las tiene.

## URLs de produccion

En produccion todo debe vivir en subdominios:

- `frandora.cl` - landing publica.
- `app.frandora.cl` - panel, auth y onboarding.
- `admin.frandora.cl` - super admin.
- `api.frandora.cl` - API y webhooks.
- `[slug].frandora.cl` - pagina publica de cada negocio.

No crear enlaces publicos a `frandora.cl/booking/...`, `frandora.cl/dashboard`, `frandora.cl/sign-in` o `frandora.cl/sign-up`. Esos paths solo son implementacion interna de Next o desarrollo local. Usar `lib/urls.ts` para generar URLs.

## Variables de entorno Vercel

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

## Seguridad multi-tenant

- Toda API autenticada debe obtener `businessId` con `getBusinessId(userId)`.
- No usar `findUnique({ id })` para modificar citas, pagos, clientes, equipo, servicios, productos, cupones o gift cards sin filtrar por `businessId`.
- Las reservas publicas deben revalidar en backend que servicio/profesional pertenecen al negocio, que el profesional ofrece el servicio, que el horario no esta tomado y que no esta en el pasado.

## Pagos

- No introducir Stripe.
- Suscripciones SaaS: Rebill.
- Pagos de reservas: Flow.cl.
- Webhooks publicos deben apuntar a `api.frandora.cl`.

## Calidad de codigo

- Ningun archivo `.ts` o `.tsx` debe superar 400 lineas.
- No usar `any`; preferir `unknown` con type guards.
- API routes delgadas; logica de negocio en `lib/services/`.
- No correr `npm audit fix --force` sin revisar, porque puede subir versiones mayores de Next/React o librerias criticas.
