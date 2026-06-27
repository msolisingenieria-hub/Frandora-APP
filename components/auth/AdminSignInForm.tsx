"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

const ADMIN_EMAIL = "admin@frandora.cl";

function clerkMsg(code: string): string {
  const map: Record<string, string> = {
    form_identifier_not_found: "Credenciales incorrectas.",
    form_password_incorrect:   "Credenciales incorrectas.",
    too_many_requests:         "Demasiados intentos. Espera unos minutos.",
  };
  return map[code] ?? "Credenciales incorrectas.";
}

export function AdminSignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({ identifier: ADMIN_EMAIL, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/admin");
      }
    } catch (err: unknown) {
      const code = (err as { errors?: { code: string }[] })?.errors?.[0]?.code ?? "";
      setError(clerkMsg(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 ring-1 ring-brand-teal/25">
          <ShieldCheck size={18} className="text-brand-teal" />
        </div>
        <div>
          <h1 className="font-sans text-xl font-semibold tracking-tight text-brand-navy">
            Acceso de administrador
          </h1>
          <p className="mt-0.5 text-sm font-body text-slate-500">
            Panel exclusivo de Frandora
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Correo fijo — solo muestra */}
      <div>
        <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
          Correo electrónico
        </label>
        <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-body text-slate-500 select-none cursor-not-allowed">
          {ADMIN_EMAIL}
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="admin-password" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
          />
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !password}
        className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : "Ingresar al panel"}
      </button>
    </form>
  );
}
