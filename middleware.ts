import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "frandora.cl";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.frandora.cl";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
  "/settings(.*)",
  "/api/protected(.*)",
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  const isLocalhost =
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.includes(".app.github.dev") ||   // GitHub Codespaces
    hostname.includes(".preview.app.github.dev");

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
  if (isRootDomain) return NextResponse.next();

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
    return NextResponse.rewrite(new URL(`/app${url.pathname}`, req.url));
  }

  // ── 3. admin.frandora.cl → Super Admin ──
  if (subdomain === "admin") {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL("/sign-in", APP_URL));
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
  }

  // ── 4. [slug].frandora.cl → Página pública del negocio ──
  if (subdomain && subdomain !== "www") {
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
