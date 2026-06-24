import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

// Tipografía oficial de Frandora Brand Identity
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Frandora — Schedule Smart. Grow More.",
    template: "%s | Frandora",
  },
  description:
    "La plataforma más completa para gestionar tu negocio de servicios. Agenda, clientes, pagos, inventario y más.",
  keywords: [
    "agendamiento",
    "reservas online",
    "gestión de negocio",
    "barbería",
    "spa",
    "salón de belleza",
    "software agendamiento",
    "scheduling software",
    "frandora",
  ],
  authors: [{ name: "Frandora" }],
  creator: "Frandora",
  metadataBase: new URL("https://frandora.cl"),
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://frandora.cl",
    siteName: "Frandora",
    title: "Frandora — Schedule Smart. Grow More.",
    description:
      "La plataforma más completa para negocios de servicios. Agenda, clientes, pagos e inventario en un solo lugar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frandora — Schedule Smart. Grow More.",
    description: "La plataforma más completa para negocios de servicios.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/logo-dark.png", type: "image/png", sizes: "any" },
    ],
    apple: "/logo-dark.png",
    shortcut: "/logo-dark.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
