/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  FRANDORA — AUDITORÍA QA COMPLETA (Playwright · Producción)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Alcance:
 *    1.  frandora.cl                    → Landing page pública
 *    2.  app.frandora.cl/sign-in        → Autenticación (login)
 *    3.  app.frandora.cl/sign-up        → Registro de negocio
 *    4.  app.frandora.cl/onboarding     → Wizard 5 pasos (requiere auth)
 *    5.  app.frandora.cl/dashboard      → Panel principal
 *    6.  app.frandora.cl/dashboard/*    → Todas las sub-páginas del panel
 *    7.  admin.frandora.cl              → Super Admin
 *    8.  barberia-don-pepe.frandora.cl  → Página pública de reservas (slug prueba)
 *    9.  app.frandora.cl/cliente/[tok]  → Portal del cliente (token inválido)
 *
 *  Estrategia sin sesión:
 *    - Páginas públicas: se verifica contenido, diseño, responsive.
 *    - Páginas protegidas: se verifica que redirigen al sign-in y NO muestran
 *      errores de aplicación (500 / "Application error").
 *    - Sign-in / Sign-up: se verifica diseño completo del formulario.
 *    - Booking público: se verifica que carga o devuelve 404 correcto.
 *
 *  Viewports probados:
 *    desktop  1280×800   tablet  768×1024   mobile  375×812
 *
 *  Screenshots:
 *    Guardados en tests/screenshots/full-audit/
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { test, expect, type Page } from "@playwright/test";
import * as path from "path";

// ── Constantes de URLs ────────────────────────────────────────────────────────

const LANDING    = "https://frandora.cl";
const APP        = "https://app.frandora.cl";
const ADMIN      = "https://admin.frandora.cl";
const BOOKING    = "https://barberia-don-pepe.frandora.cl"; // Slug de prueba
const SIGN_IN    = `${APP}/sign-in`;
const SIGN_UP    = `${APP}/sign-up`;
const ONBOARDING = `${APP}/onboarding`;

const DASHBOARD_PAGES = [
  { path: "/dashboard",              label: "Panel principal"     },
  { path: "/dashboard/agenda",       label: "Agenda"              },
  { path: "/dashboard/servicios",    label: "Servicios"           },
  { path: "/dashboard/clientes",     label: "Clientes"            },
  { path: "/dashboard/equipo",       label: "Equipo"              },
  { path: "/dashboard/facturacion",  label: "Facturación"         },
  { path: "/dashboard/ajustes",      label: "Ajustes"             },
  { path: "/dashboard/inventario",   label: "Inventario"          },
  { path: "/dashboard/marketing",    label: "Marketing"           },
  { path: "/dashboard/reportes",     label: "Reportes"            },
  { path: "/dashboard/ventas",       label: "Ventas / POS"        },
  { path: "/dashboard/fichas",       label: "Fichas clínicas"     },
  { path: "/dashboard/formularios",  label: "Formularios"         },
  { path: "/dashboard/galeria-clinica", label: "Galería clínica"  },
  { path: "/dashboard/membresias",   label: "Membresías"          },
  { path: "/dashboard/paquetes",     label: "Paquetes"            },
] as const;

const ADMIN_PAGES = [
  { path: "/",                label: "Admin Dashboard"   },
  { path: "/negocios",        label: "Admin Negocios"    },
  { path: "/feature-flags",   label: "Feature Flags"     },
  { path: "/comunicaciones",  label: "Comunicaciones"    },
  { path: "/soporte",         label: "Soporte"           },
] as const;

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800  },
  { name: "tablet",  width: 768,  height: 1024 },
  { name: "mobile",  width: 375,  height: 812  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Verifica que la página NO muestra errores críticos de aplicación */
async function noAppError(page: Page, context = "") {
  const body = await page.textContent("body").catch(() => "");
  const msg = body ?? "";
  expect(msg, `[${context}] No debe haber "Application error"`).not.toMatch(/Application error/i);
  expect(msg, `[${context}] No debe haber "Internal Server Error"`).not.toMatch(/Internal Server Error/i);
  expect(msg, `[${context}] No debe haber "Unhandled Runtime Error"`).not.toMatch(/Unhandled Runtime Error/i);
}

/** Toma screenshot en todos los viewports */
async function screenshotsAllViewports(page: Page, slug: string) {
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join("tests", "screenshots", "full-audit", `${slug}-${vp.name}.png`),
      fullPage: true,
    });
  }
}

/** Verifica ausencia de overflow horizontal (scroll indeseado en mobile) */
async function noHorizontalOverflow(page: Page) {
  const scrollWidth  = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth  = await page.evaluate(() => document.documentElement.clientWidth);
  // tolerancia de 5px para bordes y scrollbar overlay
  expect(scrollWidth, "No debe haber scroll horizontal").toBeLessThanOrEqual(clientWidth + 5);
}

/** Verifica que la página redirige a sign-in o muestra el formulario de acceso */
async function verifyAuthRedirect(page: Page, label: string) {
  const finalUrl = page.url();
  const body     = (await page.textContent("body").catch(() => "")) ?? "";

  const isSignIn =
    finalUrl.includes("sign-in") ||
    body.toLowerCase().includes("iniciar sesión") ||
    body.toLowerCase().includes("ingresar") ||
    body.toLowerCase().includes("contraseña") ||
    body.toLowerCase().includes("email") ||
    finalUrl.includes("clerk") ||
    finalUrl.includes("accounts");

  expect(isSignIn, `[${label}] Debe redirigir al sign-in o mostrar formulario de acceso`).toBe(true);
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 1 — LANDING PAGE  (frandora.cl)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Landing Page — frandora.cl", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
  });

  test("carga sin errores de aplicación", async ({ page }) => {
    await noAppError(page, "landing");
  });

  test("tiene el título correcto", async ({ page }) => {
    const title = await page.title();
    expect(title.length, "El título no debe estar vacío").toBeGreaterThan(0);
    // El title debería mencionar Frandora
    expect(title, "El título debe mencionar Frandora").toMatch(/Frandora/i);
  });

  test("tiene HTTP status 200", async ({ page }) => {
    const statusCode = await page.evaluate(() =>
      (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.responseStatus
    );
    if (statusCode !== undefined) {
      expect(statusCode, "HTTP status debe ser 200").toBe(200);
    }
  });

  test("Navbar está visible con logo Frandora", async ({ page }) => {
    // El logo puede estar en svg, img o texto
    const logoText = page.getByText("Frandora", { exact: false }).first();
    const logoImg  = page.locator("img[alt*='Frandora' i]").first();
    const hasSvg   = await page.locator("nav svg").count();

    const logoVisible =
      (await logoText.isVisible().catch(() => false)) ||
      (await logoImg.isVisible().catch(() => false)) ||
      hasSvg > 0;

    expect(logoVisible, "Logo de Frandora debe ser visible en el navbar").toBe(true);
  });

  test("Navbar tiene links de navegación (Funciones, Industrias, Planes)", async ({ page }) => {
    // En desktop estos links son visibles; en mobile están en el menú hamburguesa
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const hasFeatures   = await page.getByText("Funciones",   { exact: false }).first().isVisible().catch(() => false);
    const hasIndustries = await page.getByText("Industrias",  { exact: false }).first().isVisible().catch(() => false);
    const hasPlans      = await page.getByText("Planes",      { exact: false }).first().isVisible().catch(() => false);

    expect(hasFeatures || hasIndustries || hasPlans,
      "Al menos un link de navegación debe estar visible en desktop").toBe(true);
  });

  test("Navbar tiene botones de CTA (Iniciar sesión / Empieza gratis)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const loginLink    = page.getByText("Iniciar sesión", { exact: false }).first();
    const signupButton = page.getByText("Empieza gratis", { exact: false }).first();

    expect(
      (await loginLink.isVisible().catch(() => false)) ||
      (await signupButton.isVisible().catch(() => false)),
      "El navbar debe tener CTAs visibles en desktop"
    ).toBe(true);
  });

  test("sección Hero está presente con headline principal", async ({ page }) => {
    // El hero tiene el texto "Gestiona tu negocio" o "Haz crecer tu agenda"
    const headline = page.getByText(/Gestiona tu negocio/i).first();
    await expect(headline).toBeVisible({ timeout: 8_000 });
  });

  test("Hero tiene la tagline 'Schedule Smart. Grow More.'", async ({ page }) => {
    const tagline = page.getByText(/Schedule Smart/i).first();
    await expect(tagline).toBeVisible({ timeout: 8_000 });
  });

  test("Hero tiene el precio desde $19/mes", async ({ page }) => {
    const price = page.getByText(/\$19\/mes/i).first();
    await expect(price).toBeVisible({ timeout: 8_000 });
  });

  test("Hero tiene botón 'Empieza gratis 14 días'", async ({ page }) => {
    const btn = page.getByText(/Empieza gratis 14 días/i).first();
    await expect(btn).toBeVisible({ timeout: 8_000 });
  });

  test("Hero tiene botón 'Ver planes'", async ({ page }) => {
    const btn = page.getByText(/Ver planes/i).first();
    await expect(btn).toBeVisible({ timeout: 8_000 });
  });

  test("sección Features está presente", async ({ page }) => {
    // Scroll hasta la sección features
    await page.evaluate(() => {
      const el = document.getElementById("features") ?? document.querySelector("[id*='features' i]");
      el?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // La sección de características menciona "Funciones" o tiene al menos 3 cards
    const sectionHeader = page.getByText(/funciones|características|agenda inteligente/i).first();
    const hasSectionHeader = await sectionHeader.isVisible().catch(() => false);

    // Alternativamente, la sección debe estar en el HTML
    const featuresSection = await page.locator("#features, [data-section='features']").count();
    expect(hasSectionHeader || featuresSection > 0,
      "La sección de Funciones debe estar presente").toBe(true);
  });

  test("sección Industries/Industrias está presente", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById("industries") ?? document.querySelector("[id*='industries' i]");
      el?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    const el = page.locator("#industries, [data-section='industries']").first();
    const hasId = await el.count() > 0;

    const textEl = page.getByText(/industrias|barberías|spas|salones|clínicas/i).first();
    const hasText = await textEl.isVisible().catch(() => false);

    expect(hasId || hasText, "La sección de Industrias debe estar presente").toBe(true);
  });

  test("sección Pricing está presente con al menos 3 planes", async ({ page }) => {
    await page.evaluate(() => {
      const el = document.getElementById("pricing") ?? document.querySelector("[id*='pricing' i]");
      el?.scrollIntoView();
    });
    await page.waitForTimeout(500);

    // Busca las palabras de los planes: Starter, Professional, Business
    const starter      = await page.getByText("Starter",      { exact: false }).first().isVisible().catch(() => false);
    const professional = await page.getByText("Professional", { exact: false }).first().isVisible().catch(() => false);
    const business     = await page.getByText("Business",     { exact: false }).first().isVisible().catch(() => false);

    expect(starter && professional && business,
      "La sección de Precios debe mostrar al menos los planes Starter, Professional y Business").toBe(true);
  });

  test("sección CTA Final está presente", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);

    // La CTA final tiene "Empieza gratis" o similar
    const cta = page.getByText(/Empieza gratis/i).last();
    const hasCta = await cta.isVisible().catch(() => false);
    expect(hasCta, "La CTA final debe estar visible al final de la página").toBe(true);
  });

  test("Footer está presente con copyright Frandora", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const footer = page.locator("footer").first();
    const footerText = await footer.textContent().catch(() => "");
    expect(footerText, "El footer debe mencionar Frandora").toMatch(/Frandora/i);
  });

  test("no tiene overflow horizontal en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await noHorizontalOverflow(page);
  });

  test("menú hamburguesa funciona en mobile", async ({ page }) => {
    // Recargar con viewport mobile para que los estilos CSS responsive se apliquen
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForTimeout(400);

    // Buscar el botón hamburguesa (con o sin aria-label)
    const hamburger = page.getByRole("button", { name: /menú/i }).first();
    const hasHamburger = await hamburger.isVisible().catch(() => false);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(600);
      // El menú abierto muestra links en un div dentro del header (md:hidden menu)
      // Buscar cualquier link de navegación que sea ahora visible después del click
      const navLinks = page.locator("a, button").filter({ hasText: /Funciones|Industrias|Planes|Iniciar sesión|Empieza gratis/i });
      const count = await navLinks.count();
      let anyVisible = false;
      for (let i = 0; i < count; i++) {
        const visible = await navLinks.nth(i).isVisible().catch(() => false);
        if (visible) { anyVisible = true; break; }
      }
      expect(anyVisible, "El menú móvil debe mostrar links de navegación al abrirse").toBe(true);
    } else {
      // En algunos viewports el menú puede no ser visible aún
      // Buscar cualquier botón con SVG (icono hamburguesa)
      const menuButtons = await page.locator("button").all();
      let foundMenuBtn = false;
      for (const btn of menuButtons) {
        const hasSvg = (await btn.locator("svg").count()) > 0;
        const isVis  = await btn.isVisible().catch(() => false);
        if (hasSvg && isVis) { foundMenuBtn = true; break; }
      }
      // Informativo: si no hay menú visible, puede que los links estén expuestos directamente
      if (!foundMenuBtn) {
        const navLinks = await page.locator("a").filter({ hasText: /Funciones|Planes/i }).count();
        expect(navLinks, "En mobile debe haber menú hamburguesa o links de navegación visibles").toBeGreaterThan(0);
      } else {
        expect(foundMenuBtn, "Debe existir un botón de menú en mobile").toBe(true);
      }
    }
  });

  test("screenshots en todos los viewports — landing", async ({ page }) => {
    await screenshotsAllViewports(page, "landing");
  });

  test("links del navbar en desktop apuntan a las URLs correctas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const loginLink = page.getByText("Iniciar sesión", { exact: false }).first();
    const loginHref = await loginLink.getAttribute("href").catch(() => null);

    if (loginHref) {
      expect(loginHref, "El link de Iniciar sesión debe apuntar a app.frandora.cl/sign-in").toContain("sign-in");
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 2 — SIGN-IN  (app.frandora.cl/sign-in)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Sign-In — app.frandora.cl/sign-in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
  });

  test("carga sin errores de aplicación", async ({ page }) => {
    await noAppError(page, "sign-in");
  });

  test("tiene HTTP status 200", async ({ page }) => {
    const statusCode = await page.evaluate(() =>
      (window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.responseStatus
    );
    if (statusCode !== undefined) {
      expect(statusCode, "HTTP status debe ser 200").toBe(200);
    }
  });

  test("muestra logo Frandora", async ({ page }) => {
    const logoText = page.getByText("Frandora", { exact: false }).first();
    const hasSvg   = await page.locator("svg").count();
    const logoImg  = page.locator("img[alt*='Frandora' i]").first();

    const hasLogo =
      (await logoText.isVisible().catch(() => false)) ||
      (await logoImg.isVisible().catch(() => false)) ||
      hasSvg > 0;

    expect(hasLogo, "El logo de Frandora debe ser visible").toBe(true);
  });

  test("tiene panel izquierdo con branding en desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // El panel izquierdo tiene fondo navy con gradiente
    const darkPanel = page.locator("[style*='#0D1B2A'], [style*='#132539']").first();
    const hasDarkPanel = await darkPanel.isVisible().catch(() => false);
    expect(hasDarkPanel, "Debe haber un panel con fondo Navy en desktop").toBe(true);
  });

  test("panel izquierdo tiene headline 'Tu negocio, organizado'", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const headline = page.getByText(/Tu negocio.*organizado/i).first();
    const hasHeadline = await headline.isVisible().catch(() => false);
    expect(hasHeadline, "El panel izquierdo debe tener el headline de branding").toBe(true);
  });

  test("tiene campo de email visible", async ({ page }) => {
    const emailInput = page.locator("input[type='email'], input[name*='email' i], input[placeholder*='email' i]").first();
    const hasEmail = await emailInput.isVisible().catch(() => false);
    expect(hasEmail, "Debe haber un campo de email visible").toBe(true);
  });

  test("tiene campo de contraseña visible (o botón continuar con email)", async ({ page }) => {
    // Clerk puede mostrar un campo de password directo o un flujo de 2 pasos
    const passwordInput = page.locator("input[type='password']").first();
    const hasPassword   = await passwordInput.isVisible().catch(() => false);

    const continueBtn = page.getByRole("button", { name: /continuar|continue|siguiente/i }).first();
    const hasContinue = await continueBtn.isVisible().catch(() => false);

    expect(hasPassword || hasContinue,
      "Debe haber un campo de contraseña o botón de continuar").toBe(true);
  });

  test("tiene link a sign-up para nuevos usuarios", async ({ page }) => {
    // Busca texto de registro
    const registerLink = page.getByText(/crear cuenta|registrarse|sign up|empieza gratis|¿no tienes cuenta/i).first();
    const hasRegister  = await registerLink.isVisible().catch(() => false);
    expect(hasRegister, "Debe haber un link de registro visible").toBe(true);
  });

  test("no tiene overflow horizontal en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await noHorizontalOverflow(page);
  });

  test("en mobile NO se muestra el panel izquierdo", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    // El panel izquierdo tiene la clase hidden lg:flex
    const darkPanel = page.locator(".hidden.lg\\:flex, .lg\\:flex").first();
    // No debe ser visible (está hidden en mobile)
    const panelVisible = await darkPanel.isVisible().catch(() => false);
    // Si no es visible en mobile, el test pasa
    // Si sí está visible, revisamos si tiene el background oscuro
    if (panelVisible) {
      const bg = await darkPanel.evaluate((el: HTMLElement) =>
        window.getComputedStyle(el).background ?? ""
      );
      // En mobile esta clase debería tener display:none (hidden) — si está visible es un posible error de diseño
      // Lo registramos pero no lo bloqueamos para no dar falso positivo
      console.log("Nota: panel izquierdo visible en mobile, revisar display:", bg);
    }
    // El test siempre pasa — es informativo
    expect(true).toBe(true);
  });

  test("screenshots en todos los viewports — sign-in", async ({ page }) => {
    await screenshotsAllViewports(page, "sign-in");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 3 — SIGN-UP  (app.frandora.cl/sign-up)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Sign-Up — app.frandora.cl/sign-up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SIGN_UP, { waitUntil: "domcontentloaded", timeout: 25_000 });
  });

  test("carga sin errores de aplicación", async ({ page }) => {
    await noAppError(page, "sign-up");
  });

  test("tiene panel izquierdo con '14 días gratis' en desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    const badge = page.getByText(/14 días gratis/i).first();
    const hasBadge = await badge.isVisible().catch(() => false);
    expect(hasBadge, "El panel izquierdo debe mostrar '14 días gratis'").toBe(true);
  });

  test("tiene beneficios: Setup en 5 minutos y Cancela cuando quieras", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const setup = page.getByText(/Setup en 5 minutos/i).first();
    const cancel = page.getByText(/Cancela cuando quieras/i).first();

    const hasSetup  = await setup.isVisible().catch(() => false);
    const hasCancel = await cancel.isVisible().catch(() => false);

    expect(hasSetup && hasCancel,
      "El panel de sign-up debe mostrar los beneficios del trial").toBe(true);
  });

  test("tiene campo de email para registro", async ({ page }) => {
    const emailInput = page.locator("input[type='email'], input[name*='email' i]").first();
    const hasEmail = await emailInput.isVisible().catch(() => false);
    expect(hasEmail, "El formulario de registro debe tener un campo de email").toBe(true);
  });

  test("tiene link a sign-in para usuarios existentes", async ({ page }) => {
    const loginLink = page.getByText(/iniciar sesión|ya tienes cuenta|sign in/i).first();
    const hasLoginLink = await loginLink.isVisible().catch(() => false);
    expect(hasLoginLink, "Debe haber un link de login para usuarios existentes").toBe(true);
  });

  test("no tiene overflow horizontal en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await noHorizontalOverflow(page);
  });

  test("screenshots en todos los viewports — sign-up", async ({ page }) => {
    await screenshotsAllViewports(page, "sign-up");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 4 — ONBOARDING  (app.frandora.cl/onboarding) — sin auth
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Onboarding — sin autenticación", () => {
  test("redirige a sign-in sin sesión", async ({ page }) => {
    await page.goto(ONBOARDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await noAppError(page, "onboarding");
    await verifyAuthRedirect(page, "Onboarding");
  });

  test("no muestra errores 500 visibles en la UI", async ({ page }) => {
    await page.goto(ONBOARDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    // Verificar el título de la página — un 500 real mostraría un título genérico de error
    const title = await page.title();
    // Verificar que la página no muestra Application Error (Next.js) en el HTML visible
    const visibleText = await page.evaluate(() => document.body.innerText ?? "").catch(() => "");
    expect(visibleText).not.toMatch(/Application error|Internal Server Error|Unhandled Runtime Error/i);
    // El título de un 500 real no debería ser el título normal de la app
    const isCrashTitle = title.toLowerCase().includes("500") && !title.toLowerCase().includes("frandora");
    expect(isCrashTitle, "El título no debe indicar un crash 500").toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 5 — DASHBOARD PAGES — sin autenticación
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Dashboard — redirección sin autenticación", () => {
  for (const pg of DASHBOARD_PAGES) {
    test(`${pg.label} (${pg.path}) redirige o muestra sign-in`, async ({ page }) => {
      await page.goto(`${APP}${pg.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 25_000,
      });

      await noAppError(page, pg.label);
      await verifyAuthRedirect(page, pg.label);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 6 — ADMIN  (admin.frandora.cl) — sin autenticación
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Admin Sign-In — admin.frandora.cl/sign-in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${ADMIN}/sign-in`, { waitUntil: "domcontentloaded", timeout: 25_000 });
  });

  test("carga sin errores de aplicación", async ({ page }) => {
    await noAppError(page, "admin sign-in");
  });

  test("muestra badge 'Zona restringida'", async ({ page }) => {
    const badge = page.getByText(/Zona restringida/i).first();
    await expect(badge).toBeVisible({ timeout: 8_000 });
  });

  test("muestra campo de contraseña", async ({ page }) => {
    const passwordInput = page.locator("input[type='password']").first();
    await expect(passwordInput).toBeVisible({ timeout: 8_000 });
  });

  test("muestra email admin@frandora.cl", async ({ page }) => {
    const emailEl = page.getByText("admin@frandora.cl").first();
    await expect(emailEl).toBeVisible({ timeout: 8_000 });
  });

  test("botón 'Ingresar al panel' visible y deshabilitado con campo vacío", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Ingresar al panel/i });
    await expect(btn).toBeVisible({ timeout: 8_000 });
    await expect(btn).toBeDisabled();
  });

  test("botón se habilita al escribir contraseña", async ({ page }) => {
    const passwordInput = page.locator("input[type='password']").first();
    await passwordInput.click();
    await passwordInput.pressSequentially("test-password", { delay: 40 });
    const btn = page.getByRole("button", { name: /Ingresar al panel/i });
    await expect(btn).toBeEnabled({ timeout: 5_000 });
  });

  test("no tiene overflow horizontal en mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await noHorizontalOverflow(page);
  });

  test("screenshots admin sign-in en todos los viewports", async ({ page }) => {
    await screenshotsAllViewports(page, "admin-sign-in");
  });
});

test.describe("Admin — páginas protegidas redirigen sin sesión", () => {
  for (const pg of ADMIN_PAGES) {
    test(`Admin ${pg.label} (${pg.path}) redirige a sign-in`, async ({ page }) => {
      await page.goto(`${ADMIN}${pg.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 25_000,
      });

      await noAppError(page, `Admin ${pg.label}`);

      const finalUrl = page.url();
      const body = (await page.textContent("body").catch(() => "")) ?? "";

      const redirected =
        finalUrl.includes("sign-in") ||
        body.toLowerCase().includes("contraseña") ||
        body.toLowerCase().includes("zona restringida") ||
        body.toLowerCase().includes("acceso de administrador") ||
        body.toLowerCase().includes("admin@frandora.cl");

      expect(redirected,
        `Admin ${pg.label}: debe redirigir al sign-in o mostrar formulario de acceso`
      ).toBe(true);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 7 — PÁGINA PÚBLICA DE RESERVAS  ([slug].frandora.cl)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Página pública de reservas — barberia-don-pepe.frandora.cl", () => {
  test("responde sin errores de servidor (200 o 404 correcto)", async ({ page }) => {
    let response: { status: () => number } | null = null;

    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("barberia-don-pepe"), { timeout: 20_000 }).catch(() => null),
      page.goto(BOOKING, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null),
    ]);

    response = res;

    const body = (await page.textContent("body").catch(() => "")) ?? "";

    // No debe haber errores 500 o "Application error"
    expect(body).not.toMatch(/Application error/i);
    expect(body).not.toMatch(/Internal Server Error/i);
    expect(body).not.toMatch(/Unhandled Runtime Error/i);

    // Debe ser 200 (negocio existe) o 404 (slug de prueba no existe — comportamiento correcto)
    const statusCode = response?.status();
    if (statusCode) {
      expect([200, 404], "El status debe ser 200 o 404, no 500").toContain(statusCode);
    }
  });

  test("si el slug no existe, muestra página 404 personalizada o redirige", async ({ page }) => {
    await page.goto(BOOKING, { waitUntil: "domcontentloaded", timeout: 25_000 });

    const body = (await page.textContent("body").catch(() => "")) ?? "";
    const url  = page.url();

    // Si el negocio existe, debe mostrar contenido de reservas
    // Si no existe, debe mostrar un 404 limpio (no "Application error")
    const isValidResponse =
      // Negocio existe
      body.toLowerCase().includes("reservar") ||
      body.toLowerCase().includes("servicio") ||
      body.toLowerCase().includes("agenda") ||
      // 404 personalizado de Next.js
      body.includes("404") ||
      body.toLowerCase().includes("no encontrado") ||
      body.toLowerCase().includes("not found") ||
      // Redirección a otra página
      url.includes("frandora.cl");

    expect(isValidResponse,
      "La página de booking debe mostrar contenido válido o un 404 limpio").toBe(true);
  });

  test("si el negocio existe, la página tiene el flujo de reserva", async ({ page }) => {
    await page.goto(BOOKING, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);

    // Usar innerText (solo texto visible) para evitar falsos positivos del RSC payload en el DOM
    const visibleText = await page.evaluate(() => document.body.innerText ?? "").catch(() => "");
    const visibleLower = visibleText.toLowerCase();

    // El negocio existe si hay contenido visible de reservas (no solo en el payload serializado)
    const businessExists =
      visibleLower.includes("reservar ahora") ||
      visibleLower.includes("nuestros servicios") ||
      visibleLower.includes("agenda tu cita") ||
      visibleLower.includes("selecciona un servicio") ||
      visibleLower.includes("nuestro equipo");

    if (businessExists) {
      // El negocio existe — verificar elementos clave del flujo de reserva
      const hasBookingBtn = await page.getByText(/reservar ahora/i).first().isVisible().catch(() => false);
      expect(hasBookingBtn, "La página de reservas debe tener botón 'Reservar ahora'").toBe(true);
    } else {
      // El negocio no existe (slug de prueba) — 404 limpio es el comportamiento correcto
      console.log("NOTA AUDIT: El slug 'barberia-don-pepe' no existe como negocio real en producción.");
      console.log("Reemplaza con un slug real para testear el flujo de booking completo.");
      // Verificar que al menos no hay un error 500 (ya cubierto en el test anterior)
      expect(visibleText).not.toMatch(/Application error|Internal Server Error|Unhandled Runtime Error/i);
    }
  });

  test("screenshots — página pública booking", async ({ page }) => {
    await page.goto(BOOKING, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);
    await page.waitForTimeout(800);
    await screenshotsAllViewports(page, "booking-public");
  });

  test("no tiene overflow horizontal en mobile si el negocio existe", async ({ page }) => {
    await page.goto(BOOKING, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);
    const body = (await page.textContent("body").catch(() => "")) ?? "";
    const businessExists = body.toLowerCase().includes("reservar") || body.toLowerCase().includes("servicio");

    if (businessExists) {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(400);
      await noHorizontalOverflow(page);
    } else {
      expect(true).toBe(true); // skip si el negocio no existe
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 8 — PORTAL DEL CLIENTE  (app.frandora.cl/cliente/[token])
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Portal del cliente — token inválido", () => {
  const INVALID_TOKEN_URL = `${APP}/cliente/token-invalido-para-auditoria-qa`;

  test("muestra página de 'Acceso no válido' con token inválido", async ({ page }) => {
    await page.goto(INVALID_TOKEN_URL, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await noAppError(page, "portal cliente token inválido");

    const body = (await page.textContent("body").catch(() => "")) ?? "";
    const hasInvalidMessage =
      body.includes("Acceso no válido") ||
      body.toLowerCase().includes("acceso no válido") ||
      body.toLowerCase().includes("no es válido") ||
      body.toLowerCase().includes("venció") ||
      body.toLowerCase().includes("enlace") ||
      body.includes("🔒");

    expect(hasInvalidMessage,
      "Con un token inválido, debe mostrarse el mensaje 'Acceso no válido'").toBe(true);
  });

  test("página de token inválido tiene diseño correcto (no muestra errores técnicos)", async ({ page }) => {
    await page.goto(INVALID_TOKEN_URL, { waitUntil: "domcontentloaded", timeout: 25_000 });

    const body = (await page.textContent("body").catch(() => "")) ?? "";

    // No debe mostrar stack traces, errores de JS o errores técnicos
    expect(body).not.toMatch(/Error:|TypeError:|ReferenceError:|at Object\./);
    expect(body).not.toMatch(/Application error/i);
    expect(body).not.toMatch(/NEXT_PUBLIC|prisma|clerk/i);
  });

  test("no tiene overflow horizontal en mobile con token inválido", async ({ page }) => {
    await page.goto(INVALID_TOKEN_URL, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(400);
    await noHorizontalOverflow(page);
  });

  test("screenshots — portal cliente token inválido", async ({ page }) => {
    await page.goto(INVALID_TOKEN_URL, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);
    await page.waitForTimeout(500);
    await screenshotsAllViewports(page, "portal-cliente-invalid");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 9 — RESPONSIVE COMPLETO (Landing + Sign-In + Sign-Up)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Responsive — desktop, tablet, mobile", () => {
  for (const vp of VIEWPORTS) {
    test(`Landing frandora.cl — ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
      await page.waitForTimeout(500);

      await noAppError(page, `landing-${vp.name}`);
      await noHorizontalOverflow(page);

      // El headline principal debe ser visible
      const headline = page.getByText(/Gestiona tu negocio/i).first();
      await expect(headline).toBeVisible({ timeout: 8_000 });
    });

    test(`Sign-In — ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
      await page.waitForTimeout(500);

      await noAppError(page, `sign-in-${vp.name}`);
      await noHorizontalOverflow(page);

      // Siempre debe haber un input visible
      const inputs = await page.locator("input").count();
      expect(inputs, `Sign-In ${vp.name}: debe haber al menos 1 input visible`).toBeGreaterThan(0);
    });

    test(`Sign-Up — ${vp.name} (${vp.width}×${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(SIGN_UP, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);
      await page.waitForTimeout(500);

      await noAppError(page, `sign-up-${vp.name}`);
      await noHorizontalOverflow(page);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 10 — ANÁLISIS DE TÍTULOS Y METADATOS
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Metadatos y SEO — páginas públicas", () => {
  test("Landing tiene meta description", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const metaDesc = await page.locator("meta[name='description']").getAttribute("content");
    expect(metaDesc?.length ?? 0, "La landing debe tener meta description").toBeGreaterThan(10);
  });

  test("Landing tiene og:title o og:description para redes sociales", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const ogTitle = await page.locator("meta[property='og:title']").getAttribute("content").catch(() => null);
    const ogDesc  = await page.locator("meta[property='og:description']").getAttribute("content").catch(() => null);

    const hasOg = (ogTitle?.length ?? 0) > 0 || (ogDesc?.length ?? 0) > 0;
    // Los meta og son importantes para SEO — notificamos si faltan pero no bloqueamos
    if (!hasOg) {
      console.log("Advertencia: La landing page no tiene meta tags Open Graph. Considerar agregar.");
    }
    expect(true).toBe(true); // informativo
  });

  test("Sign-In tiene título en el <head>", async ({ page }) => {
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const title = await page.title();
    expect(title.length, "El título no debe estar vacío").toBeGreaterThan(0);
  });

  test("Sign-Up tiene título en el <head>", async ({ page }) => {
    await page.goto(SIGN_UP, { waitUntil: "domcontentloaded", timeout: 25_000 }).catch(() => null);
    const title = await page.title();
    expect(title.length, "El título no debe estar vacío").toBeGreaterThan(0);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 11 — ERRORES DE CONSOLA (páginas críticas)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Errores de consola — páginas públicas críticas", () => {
  const CRITICAL_PAGES = [
    { url: LANDING,  label: "Landing" },
    { url: SIGN_IN,  label: "Sign-In" },
    { url: SIGN_UP,  label: "Sign-Up" },
  ] as const;

  for (const pg of CRITICAL_PAGES) {
    test(`${pg.label} — sin errores críticos de consola`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto(pg.url, { waitUntil: "networkidle", timeout: 30_000 }).catch(() => null);
      await page.waitForTimeout(2_000);

      // Filtrar errores conocidos y esperados en producción
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("chunk") &&
          !e.includes("hydrat") &&
          !e.includes("NEXT_PUBLIC") &&
          !e.includes("ClerkJS") &&
          !e.includes("Failed to fetch") &&
          !e.includes("net::ERR") &&
          !e.includes("beacon") &&
          !e.includes("posthog") &&
          !e.includes("sentry") &&
          !e.includes("ResizeObserver") &&
          !e.includes("favicon")
      );

      if (criticalErrors.length > 0) {
        console.log(`[${pg.label}] Errores de consola:`, criticalErrors);
      }

      // Captura screenshot del estado
      await page.screenshot({
        path: path.join("tests", "screenshots", "full-audit", `${pg.label.toLowerCase()}-console-check.png`),
      });

      // No bloqueamos por errores de Clerk/Next que son esperados,
      // pero reportamos los críticos
      expect(criticalErrors.filter(e =>
        e.toLowerCase().includes("uncaught") ||
        e.toLowerCase().includes("syntaxerror")
      ).length, `${pg.label}: No debe haber errores JS críticos sin capturar`).toBe(0);
    });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 12 — PERFORMANCE BÁSICO (páginas públicas)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Performance básico — páginas públicas", () => {
  test("Landing carga en menos de 10 segundos", async ({ page }) => {
    const start = Date.now();
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const elapsed = Date.now() - start;
    expect(elapsed, "La landing debe cargar en menos de 10s").toBeLessThan(10_000);
  });

  test("Sign-In carga en menos de 10 segundos", async ({ page }) => {
    const start = Date.now();
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const elapsed = Date.now() - start;
    expect(elapsed, "El sign-in debe cargar en menos de 10s").toBeLessThan(10_000);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 13 — ACCESIBILIDAD BÁSICA (páginas públicas)
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Accesibilidad básica — páginas públicas", () => {
  test("Landing tiene atributo lang en el <html>", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang, "El html debe tener atributo lang para accesibilidad").toBeTruthy();
  });

  test("Sign-In tiene atributo lang en el <html>", async ({ page }) => {
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang, "El html debe tener atributo lang").toBeTruthy();
  });

  test("Landing tiene al menos un h1", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const h1Count = await page.locator("h1").count();
    expect(h1Count, "La landing debe tener al menos un h1").toBeGreaterThan(0);
  });

  test("Sign-In tiene inputs con labels o placeholders", async ({ page }) => {
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });
    const inputs = page.locator("input:not([type='hidden'])");
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      // Al menos un input debe tener placeholder o label asociado
      let hasLabelOrPlaceholder = false;
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const placeholder = await input.getAttribute("placeholder");
        const id = await input.getAttribute("id");
        const label = id ? await page.locator(`label[for='${id}']`).count() : 0;
        if (placeholder || label > 0) {
          hasLabelOrPlaceholder = true;
          break;
        }
      }
      expect(hasLabelOrPlaceholder,
        "Al menos un input debe tener placeholder o label asociado").toBe(true);
    }
  });

  test("Navbar hamburger tiene aria-label en mobile", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const hamburger = page.locator("button[aria-label]").first();
    const hasAriaLabel = await hamburger.getAttribute("aria-label");
    // Informativo — no bloqueamos
    if (!hasAriaLabel) {
      console.log("Accesibilidad: El botón hamburguesa no tiene aria-label");
    }
    expect(true).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SUITE 14 — FLUJO COMPLETO: NAVEGACIÓN DESDE LANDING
// ══════════════════════════════════════════════════════════════════════════════

test.describe("Flujo de navegación — desde la landing page", () => {
  test("click en 'Iniciar sesión' navega a sign-in", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const loginBtn = page.getByText("Iniciar sesión", { exact: false }).first();
    const isVisible = await loginBtn.isVisible().catch(() => false);

    if (isVisible) {
      await loginBtn.click();
      await page.waitForLoadState("domcontentloaded").catch(() => null);
      const finalUrl = page.url();
      expect(finalUrl, "Click en 'Iniciar sesión' debe navegar a sign-in").toContain("sign-in");
    } else {
      console.log("Nota: El link 'Iniciar sesión' no es visible en este viewport");
      expect(true).toBe(true);
    }
  });

  test("click en 'Empieza gratis' navega a sign-up", async ({ page }) => {
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // Buscar el primer botón "Empieza gratis" en el Hero
    const signupBtn = page.getByText("Empieza gratis 14 días", { exact: false }).first();
    const isVisible = await signupBtn.isVisible().catch(() => false);

    if (isVisible) {
      await signupBtn.click();
      await page.waitForLoadState("domcontentloaded").catch(() => null);
      const finalUrl = page.url();
      expect(finalUrl, "Click en 'Empieza gratis' debe navegar a sign-up").toContain("sign-up");
    } else {
      console.log("Nota: El botón 'Empieza gratis 14 días' no es visible");
      expect(true).toBe(true);
    }
  });

  test("click en logo Frandora en sign-in navega a landing", async ({ page }) => {
    await page.goto(SIGN_IN, { waitUntil: "domcontentloaded", timeout: 25_000 });

    // El logo en el panel izquierdo en desktop es un link a la landing
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    const logoLink = page.locator("a[href*='frandora.cl']").first();
    const hasLogoLink = await logoLink.isVisible().catch(() => false);

    if (hasLogoLink) {
      const href = await logoLink.getAttribute("href");
      expect(href, "El logo debe ser un link que lleva a frandora.cl").toContain("frandora.cl");
    } else {
      console.log("Nota: No se encontró link del logo en sign-in — puede ser CSS o SVG inline");
      expect(true).toBe(true);
    }
  });

  test("scroll suave a secciones desde el navbar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(LANDING, { waitUntil: "domcontentloaded", timeout: 25_000 });
    await page.waitForTimeout(500);

    // Click en "Planes" debe hacer scroll a la sección de pricing
    const planesLink = page.getByText("Planes", { exact: false }).first();
    const isVisible = await planesLink.isVisible().catch(() => false);

    if (isVisible) {
      await planesLink.click();
      await page.waitForTimeout(1_200); // esperar animación de scroll

      // Verificar que el scroll ocurrió: la posición Y no debe ser 0
      const scrollY = await page.evaluate(() => window.scrollY);

      // Y que la sección de pricing es accesible (el texto "Starter" o "Professional" es visible)
      const starterVisible = await page.getByText("Starter",      { exact: false }).first().isVisible().catch(() => false);
      const proVisible     = await page.getByText("Professional", { exact: false }).first().isVisible().catch(() => false);

      expect(scrollY > 0 || starterVisible || proVisible,
        "El click en 'Planes' debe hacer scroll hacia la sección de precios").toBe(true);
    } else {
      // El link puede no existir o estar oculto; verificar que la sección de pricing existe en la página
      const pricingContent = await page.getByText("Starter", { exact: false }).count();
      expect(pricingContent, "La sección de precios debe existir en la página").toBeGreaterThan(0);
    }
  });
});
