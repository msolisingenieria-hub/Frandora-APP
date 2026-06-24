/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.frandora.cl" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "**.cloudflare.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["*.frandora.cl", "localhost:3000"],
    },
  },
};

export default nextConfig;
