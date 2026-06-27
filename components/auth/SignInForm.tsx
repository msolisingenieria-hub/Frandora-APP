"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { SIGN_UP_URL } from "@/lib/urls";

function clerkMsg(code: string): string {
  const map: Record<string, string> = {
    form_identifier_not_found: "No existe una cuenta con ese correo.",
    form_password_incorrect:   "Contraseña incorrecta. Vuelve a intentarlo.",
    too_many_requests:         "Demasiados intentos. Espera unos minutos.",
    session_exists:            "Ya tienes una sesión activa.",
  };
  return map[code] ?? "Ocurrió un error. Inténtalo de nuevo.";
}

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail]       = useState("");
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
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
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
      <div className="mb-6">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
          Bienvenido de vuelta
        </h1>
        <p className="mt-1 text-sm font-body text-slate-500">
          Ingresa tus datos para continuar
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.cl"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
        />
      </div>

      {/* Contraseña */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-xs font-sans font-semibold text-slate-700">
            Contraseña
          </label>
          <Link
            href="/sign-in?forgot=true"
            className="text-xs font-body text-brand-teal hover:text-brand-navy transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            required
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

      {/* Botón */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Ingresando...</> : "Ingresar"}
      </button>

      <p className="text-center text-sm font-body text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href={SIGN_UP_URL} className="font-semibold text-brand-navy hover:text-brand-teal transition-colors">
          Empieza gratis 14 días
        </Link>
      </p>
    </form>
  );
}
