import Link from "next/link";
import { Gift, Zap, ShieldCheck } from "lucide-react";
import { FrandoraLogo } from "@/components/ui/FrandoraLogo";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ROOT_URL } from "@/lib/urls";

const BENEFITS = [
  {
    Icon: Gift,
    title: "14 días gratis",
    desc: "Sin tarjeta de crédito requerida",
    color: "bg-brand-teal/20 text-brand-teal",
  },
  {
    Icon: Zap,
    title: "Setup en 5 minutos",
    desc: "Asistente guiado paso a paso",
    color: "bg-white/10 text-white",
  },
  {
    Icon: ShieldCheck,
    title: "Cancela cuando quieras",
    desc: "Sin contratos ni permanencia",
    color: "bg-white/10 text-white/70",
  },
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel izquierdo — Brand premium */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #132539 0%, #0D1B2A 40%, #0a2030 100%)" }}
      >
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-20 left-0 w-64 h-64 rounded-full -translate-x-1/3 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(111,168,158,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-8 w-px h-48 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(111,168,158,0.2), transparent)" }} />

        <div className="relative z-10">
          <Link href={ROOT_URL}><FrandoraLogo size="md" variant="light" showTagline /></Link>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-white font-sans text-3xl font-semibold leading-snug">
            Únete a cientos de<br />
            <span className="text-brand-teal">negocios que ya crecen</span><br />
            con Frandora.
          </h2>
          <div className="space-y-5">
            {BENEFITS.map(({ Icon, title, desc, color }) => (
              <div key={title} className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={17} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-white font-sans font-medium text-sm">{title}</p>
                  <p className="text-white/55 text-xs mt-0.5">{desc}</p>
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
        <div className="lg:hidden mb-8 flex justify-center">
          <Link href={ROOT_URL}><FrandoraLogo size="md" variant="dark" showTagline /></Link>
        </div>

        <div className="w-full max-w-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
