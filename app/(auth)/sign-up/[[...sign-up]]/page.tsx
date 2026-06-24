import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

const BENEFITS = [
  { emoji: "🎯", title: "14 días gratis", desc: "Sin tarjeta de crédito requerida" },
  { emoji: "⚡", title: "Setup en 5 minutos", desc: "Asistente guiado paso a paso" },
  { emoji: "🔒", title: "Cancela cuando quieras", desc: "Sin contratos ni permanencia" },
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo — Brand navy */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-navy flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-teal/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-20 left-0 w-56 h-56 rounded-full bg-brand-teal/8 -translate-x-1/2" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex flex-col gap-0.5">
            <span className="text-white font-sans font-bold text-2xl tracking-tight">Frandora</span>
            <span className="text-brand-teal/70 text-xs tracking-[0.2em] uppercase">Schedule Smart. Grow More.</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-white font-sans text-3xl font-semibold leading-snug">
            Únete a cientos de<br />
            <span className="text-brand-teal">negocios que ya crecen</span><br />
            con Frandora.
          </h2>
          <div className="space-y-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-4">
                <span className="text-2xl">{b.emoji}</span>
                <div>
                  <p className="text-white font-sans font-medium text-sm">{b.title}</p>
                  <p className="text-white/55 text-xs mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs">
          © {new Date().getFullYear()} Frandora · Hecho con ♥ en Chile
        </p>
      </div>

      {/* Panel derecho — Auth */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen bg-gradient-to-br from-brand-navy/5 via-white to-brand-mist/20">
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="text-brand-navy font-sans font-bold text-2xl">Frandora</Link>
          <p className="text-brand-teal text-xs tracking-widest uppercase mt-0.5">Schedule Smart. Grow More.</p>
        </div>

        <div className="w-full max-w-sm">
          <SignUp />
          <p className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/sign-in" className="text-brand-navy hover:text-brand-teal font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
