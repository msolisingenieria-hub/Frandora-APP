import { AdminSignInForm } from "@/components/auth/AdminSignInForm";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";
import { ShieldCheck } from "lucide-react";

export default function AdminSignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: "linear-gradient(160deg, #132539 0%, #0D1B2A 50%, #091520 100%)" }}
      >
        {/* Glow decorativo */}
        <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.12) 0%, transparent 70%)" }}
        />
        <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none translate-y-1/2 -translate-x-1/3"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.07) 0%, transparent 70%)" }}
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <FrandoraLogo size="md" variant="light" />
          </div>

          {/* Badge ambiente */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            <ShieldCheck size={13} className="text-brand-teal" />
            <span className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-brand-teal">
              Zona restringida
            </span>
          </div>

          {/* Formulario */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-7 shadow-2xl">
            <AdminSignInForm />
          </div>

          <p className="mt-6 text-center text-xs font-body text-white/20">
            © {new Date().getFullYear()} Frandora · Acceso interno
          </p>
        </div>
      </div>
  );
}
