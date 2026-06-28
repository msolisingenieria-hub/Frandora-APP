"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, Mail, RotateCcw } from "lucide-react";

const ADMIN_EMAIL = "admin@frandora.cl";

function clerkMsg(code: string): string {
  const map: Record<string, string> = {
    form_identifier_not_found: "Credenciales incorrectas.",
    form_password_incorrect:   "Credenciales incorrectas.",
    form_code_incorrect:       "Código incorrecto. Revísalo e inténtalo de nuevo.",
    verification_expired:      "El código venció. Pide uno nuevo.",
    too_many_requests:         "Demasiados intentos. Espera unos minutos.",
  };
  return map[code] ?? "Algo salió mal. Inténtalo de nuevo.";
}

function errCode(err: unknown): string {
  return (err as { errors?: { code: string }[] })?.errors?.[0]?.code ?? "";
}

export function AdminSignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [phase, setPhase]       = useState<"password" | "code">("password");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState("");

  async function completeSession(sessionId: string | null) {
    if (!sessionId) {
      setError("No se pudo iniciar la sesión.");
      return;
    }
    await setActive!({ session: sessionId });
    // Recarga completa para que el middleware vea la sesión en la cookie.
    window.location.href = window.location.hostname.startsWith("admin.") ? "/" : "/admin";
  }

  async function sendEmailCode(): Promise<boolean> {
    if (!signIn) return false;
    const factor = signIn.supportedSecondFactors?.find((f) => f.strategy === "email_code");
    if (!factor || factor.strategy !== "email_code") {
      setError("No hay un método de verificación disponible para esta cuenta.");
      return false;
    }
    await signIn.prepareSecondFactor({
      strategy: "email_code",
      emailAddressId: factor.emailAddressId,
    });
    return true;
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: ADMIN_EMAIL, password });

      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
        return;
      }
      // Dispositivo nuevo → Clerk pide verificación por email (Client Trust).
      // El motor de Clerk (5.127+) soporta este estado aunque los tipos aún no lo declaren.
      if ((result.status as string) === "needs_client_trust") {
        if (await sendEmailCode()) setPhase("code");
        return;
      }
      setError("No se pudo completar el acceso.");
    } catch (err: unknown) {
      setError(clerkMsg(errCode(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptSecondFactor({ strategy: "email_code", code });
      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
        return;
      }
      setError("Código incorrecto o vencido.");
    } catch (err: unknown) {
      setError(clerkMsg(errCode(err)));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!isLoaded || !signIn || resending) return;
    setResending(true);
    setError("");
    try {
      await sendEmailCode();
    } catch (err: unknown) {
      setError(clerkMsg(errCode(err)));
    } finally {
      setResending(false);
    }
  }

  const errorBox = error && (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );

  // ── Paso 2: código por email ──
  if (phase === "code") {
    return (
      <form onSubmit={handleCodeSubmit} noValidate className="space-y-4">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 ring-1 ring-brand-teal/25">
            <Mail size={18} className="text-brand-teal" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-brand-navy">
              Verifica tu acceso
            </h1>
            <p className="mt-0.5 text-sm font-body text-slate-500">
              Te enviamos un código a {ADMIN_EMAIL}
            </p>
          </div>
        </div>

        {errorBox}

        <div>
          <label htmlFor="admin-code" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Código de verificación
          </label>
          <input
            id="admin-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg tracking-[0.5em] font-body text-slate-800 placeholder:text-slate-400 placeholder:tracking-[0.5em] outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : "Confirmar y entrar"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-sans font-medium text-slate-500 hover:text-brand-navy transition-colors disabled:opacity-50"
        >
          <RotateCcw size={13} className={resending ? "animate-spin" : ""} />
          {resending ? "Reenviando..." : "Reenviar código"}
        </button>
      </form>
    );
  }

  // ── Paso 1: correo + contraseña ──
  return (
    <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
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

      {errorBox}

      <div>
        <label className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
          Correo electrónico
        </label>
        <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-body text-slate-500 select-none cursor-not-allowed">
          {ADMIN_EMAIL}
        </div>
      </div>

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
