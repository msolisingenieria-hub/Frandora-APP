"use client";

import { useState } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { SIGN_UP_URL } from "@/lib/urls";

// Íconos SVG de proveedores sociales
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.35.74 3.17.77 1.2-.24 2.35-.95 3.64-.84 1.54.12 2.69.7 3.44 1.76-3.15 1.9-2.4 6.07.77 7.23-.57 1.55-1.35 3.08-3.02 3.96zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#f25022" d="M1 1h10v10H1z"/>
      <path fill="#00a4ef" d="M13 1h10v10H13z"/>
      <path fill="#7fba00" d="M1 13h10v10H1z"/>
      <path fill="#ffb900" d="M13 13h10v10H13z"/>
    </svg>
  );
}

const SOCIAL_PROVIDERS = [
  { id: "oauth_google",    label: "Google",    icon: GoogleIcon    },
  { id: "oauth_apple",     label: "Apple",     icon: AppleIcon     },
  { id: "oauth_microsoft", label: "Microsoft", icon: MicrosoftIcon },
] as const;

type OAuthStrategy = typeof SOCIAL_PROVIDERS[number]["id"];

function clerkMsg(code: string): string {
  const map: Record<string, string> = {
    form_identifier_not_found: "No existe una cuenta con ese correo.",
    form_password_incorrect:   "Contraseña incorrecta. Vuelve a intentarlo.",
    too_many_requests:         "Demasiados intentos. Espera unos minutos.",
    form_code_incorrect:       "Código incorrecto. Revísalo e inténtalo de nuevo.",
    verification_expired:      "El código venció. Intenta de nuevo.",
  };
  return map[code] ?? "Ocurrió un error. Inténtalo de nuevo.";
}

type Phase = "credentials" | "code";

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut }                      = useAuth();
  const router                           = useRouter();

  const [phase, setPhase]       = useState<Phase>("credentials");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError]       = useState("");

  async function completeSession(sessionId: string | null) {
    if (!sessionId) { setError("No se pudo iniciar la sesión."); return; }
    await setActive!({ session: sessionId });
    router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
        return;
      }
      // Client Trust: Clerk pide verificación por email al entrar desde dispositivo nuevo
      if ((result.status as string) === "needs_client_trust") {
        const factor = result.supportedSecondFactors?.find((f) => f.strategy === "email_code");
        if (factor && factor.strategy === "email_code") {
          await signIn.prepareSecondFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
          setPhase("code");
        }
        return;
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { code?: string; message?: string }[] };
      const code     = clerkErr?.errors?.[0]?.code ?? "";

      // Si ya hay sesión activa → cerrarla y redirigir al dashboard
      if (code === "session_exists") {
        await signOut();
        // Pequeño delay para que Clerk limpie el estado antes de volver a intentar
        setTimeout(() => router.push("/dashboard"), 300);
        return;
      }
      setError(clerkMsg(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.attemptSecondFactor({ strategy: "email_code", code });
      if (result.status === "complete") {
        await completeSession(result.createdSessionId);
      } else {
        setError("Código incorrecto o vencido.");
      }
    } catch (err: unknown) {
      const code = (err as { errors?: { code?: string }[] })?.errors?.[0]?.code ?? "";
      setError(clerkMsg(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(strategy: OAuthStrategy) {
    if (!isLoaded || !signIn) return;
    setSocialLoading(strategy);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl:          "/sso-callback",
        redirectUrlComplete:  "/dashboard",
      });
    } catch {
      setError("No se pudo conectar con ese proveedor. Inténtalo de nuevo.");
      setSocialLoading(null);
    }
  }

  const errorBox = error && (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );

  // ── Paso 2: código por email (Client Trust) ───────────────────────────────
  if (phase === "code") {
    return (
      <form onSubmit={handleCode} noValidate className="space-y-4">
        <div className="mb-6">
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
            Verifica tu identidad
          </h1>
          <p className="mt-1 text-sm font-body text-slate-500">
            Te enviamos un código a <strong>{email}</strong>
          </p>
        </div>
        {errorBox}
        <div>
          <label htmlFor="verify-code" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Código de verificación
          </label>
          <input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl tracking-[0.5em] font-body text-slate-800 placeholder:text-slate-300 placeholder:tracking-[0.4em] outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" />Verificando...</> : "Confirmar y entrar"}
        </button>
        <button
          type="button"
          onClick={() => setPhase("credentials")}
          className="w-full text-xs font-body text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Volver
        </button>
      </form>
    );
  }

  // ── Paso 1: email + contraseña + social ──────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
          Bienvenido de vuelta
        </h1>
        <p className="mt-1 text-sm font-body text-slate-500">
          Ingresa con tu cuenta de Frandora
        </p>
      </div>

      {errorBox}

      {/* ── Botones sociales ── */}
      <div className="grid grid-cols-3 gap-2.5">
        {SOCIAL_PROVIDERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSocial(id)}
            disabled={!!socialLoading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-sans font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            aria-label={`Continuar con ${label}`}
          >
            {socialLoading === id
              ? <Loader2 size={15} className="animate-spin text-slate-400" />
              : <><Icon /><span className="hidden sm:inline">{label}</span></>
            }
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-body text-slate-400 shrink-0">o con tu correo</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Formulario email + password ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-sans font-semibold text-slate-700">
              Contraseña
            </label>
            <Link href="/sign-in?forgot=true" className="text-xs font-body text-brand-teal hover:text-brand-navy transition-colors">
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

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" />Ingresando...</> : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-sm font-body text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link href={SIGN_UP_URL} className="font-semibold text-brand-navy hover:text-brand-teal transition-colors">
          Empieza gratis 14 días
        </Link>
      </p>
    </div>
  );
}
