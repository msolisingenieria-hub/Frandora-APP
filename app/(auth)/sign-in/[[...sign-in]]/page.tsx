import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";

const FEATURES = [
  "Agenda inteligente con recordatorios automáticos",
  "Pagos online integrados con Flow.cl",
  "CRM de clientes con historial completo",
  "Reportes y analytics en tiempo real",
];

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo — Brand premium */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #132539 0%, #0D1B2A 40%, #0a2030 100%)" }}
      >
        {/* Decoración premium */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-32 left-0 w-64 h-64 rounded-full -translate-x-1/3 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-8 w-px h-48 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(111,168,158,0.2), transparent)" }} />

        <div className="relative z-10">
          <Link href="/"><FrandoraLogo size="md" variant="light" showTagline /></Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-white font-sans text-3xl font-semibold leading-snug">
            Tu negocio, organizado.<br />
            <span className="text-brand-teal">Tus clientes, felices.</span>
          </h2>
          <ul className="space-y-4">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-teal text-xs">✓</span>
                <span className="text-white/75 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/25 text-xs">
          © {new Date().getFullYear()} Frandora · Hecho con ♥ en Chile
        </p>
      </div>

      {/* Panel derecho — Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-br from-brand-navy/5 via-white to-brand-mist/20">
        {/* Logo móvil */}
        <div className="lg:hidden mb-8 flex justify-center">
          <Link href="/"><FrandoraLogo size="md" variant="dark" showTagline /></Link>
        </div>

        <div className="w-full max-w-sm">
          <SignIn />
          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/sign-up" className="text-brand-navy hover:text-brand-teal font-semibold transition-colors">
              Empieza gratis 14 días
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
