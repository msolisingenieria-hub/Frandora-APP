import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.frandora.cl" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*.frandora.cl", "localhost:3000"],
    },
    instrumentationHook: true,
  },
  async headers() {
    // Headers de seguridad seguros para TODAS las rutas (no rompen el widget
    // embebible porque no incluyen X-Frame-Options aquí).
    const baseSecurity = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // Cámara/ubicación permitidas solo a same-origin (fotos antes/después,
      // QR de membresías, "local más cercano" del roadmap); bloqueadas para
      // iframes de terceros. Micrófono deshabilitado: no hay caso de uso.
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
    ];
    // Anti-clickjacking SOLO en zonas sensibles que nunca deben ir en un iframe.
    // El widget público (/booking/widget) se deja embebible a propósito.
    const noFrame = [{ key: "X-Frame-Options", value: "SAMEORIGIN" }];
    return [
      { source: "/:path*", headers: baseSecurity },
      { source: "/dashboard/:path*", headers: noFrame },
      { source: "/admin/:path*", headers: noFrame },
      { source: "/onboarding/:path*", headers: noFrame },
      { source: "/settings/:path*", headers: noFrame },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "frandora",
  project: "javascript-nextjs-tt",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
