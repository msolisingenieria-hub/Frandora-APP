import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "frandora.cl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.frandora.cl";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? `https://api.${ROOT_DOMAIN}`;

function copySearch(from: URL, to: URL) {
  to.search = from.search;
  return to;
}

function redirectRootBookingPath(url: URL) {
  const segments = url.pathname.split("/").filter(Boolean);

  if (segments[0] !== "booking") return null;
  if (segments[1] === "widget" && segments[2]) {
    return copySearch(url, new URL(`/widget/${segments[2]}`, `https://${segments[2]}.${ROOT_DOMAIN}`));
  }
  if (!segments[1]) return null;

  const slug = segments[1];
  const path = segments.slice(2).join("/");
  return copySearch(url, new URL(path ? `/${path}` : "/", `https://${slug}.${ROOT_DOMAIN}`));
}

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
  "/settings(.*)",
  "/api/protected(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl;
  const rawHostname =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    "";
  const hostname = rawHostname.split(":")[0] ?? "";
  const isLocalhost =
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes(".app.github.dev") ||         // GitHub Codespaces
    hostname.includes(".preview.app.github.dev") || // GitHub Codespaces preview
    hostname.includes(".vercel.app");               // Vercel preview/production URLs

  // En local: todo va a la raíz — landing en /, auth en /sign-in|sign-up
  if (isLocalhost) {
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        const signInUrl = new URL("/sign-in", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
    return NextResponse.next();
  }

  // En producción: routing por subdominio
  const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");
  const isRootDomain = hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`;

  // ── 1. frandora.cl → Landing ──
  if (isRootDomain) {
    const bookingRedirect = redirectRootBookingPath(url);
    if (bookingRedirect) return NextResponse.redirect(bookingRedirect);

    if (
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/onboarding") ||
      url.pathname.startsWith("/settings") ||
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up")
    ) {
      return NextResponse.redirect(copySearch(url, new URL(url.pathname, APP_URL)));
    }

    if (url.pathname.startsWith("/admin")) {
      const adminPath = url.pathname.replace(/^\/admin/, "") || "/";
      return NextResponse.redirect(copySearch(url, new URL(adminPath, `https://admin.${ROOT_DOMAIN}`)));
    }

    if (url.pathname.startsWith("/api")) {
      return NextResponse.redirect(copySearch(url, new URL(url.pathname, API_URL)));
    }

    return NextResponse.next();
  }

  // ── 2. app.frandora.cl → Dashboard ──
  if (subdomain === "app") {
    if (isProtectedRoute(req)) {
      const { userId } = await auth();
      if (!userId) {
        const signInUrl = new URL("/sign-in", APP_URL);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
    }
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // ── 3. admin.frandora.cl → Super Admin ──
  if (subdomain === "admin") {
    // La page de sign-in del admin no requiere sesión
    if (url.pathname === "/sign-in") {
      return NextResponse.rewrite(new URL("/admin/sign-in", req.url));
    }
    // En Clerk v6, auth.protect() maneja el handshake correctamente.
    // Si no hay sesión, redirige a NEXT_PUBLIC_CLERK_SIGN_IN_URL (/sign-in en este dominio).
    await auth.protect();
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
  }

  // ── 4. [slug].frandora.cl → Página pública del negocio ──
  if (subdomain === "api") {
    if (url.pathname.startsWith("/api")) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/api${url.pathname}`, req.url));
  }

  if (subdomain && subdomain !== "www") {
    if (url.pathname.startsWith("/widget/")) {
      return NextResponse.rewrite(new URL(`/booking${url.pathname}`, req.url));
    }
    return NextResponse.rewrite(new URL(`/booking/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/__clerk/:path*",
  ],
};
