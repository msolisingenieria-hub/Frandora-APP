"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, Mail } from "lucide-react";
import { SIGN_IN_URL } from "@/lib/urls";

type Step = "form" | "verify";

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

function clerkMsg(code: string): string {
  const map: Record<string, string> = {
    form_identifier_exists:         "Ya existe una cuenta con ese correo. ¿Quieres ingresar?",
    form_password_pwned:            "Esa contraseña es demasiado común. Elige una más segura.",
    form_password_length_too_short: "La contraseña debe tener al menos 8 caracteres.",
    verification_failed:            "Código incorrecto. Vuelve a intentarlo.",
    verification_expired:           "El código expiró. Solicita uno nuevo.",
    too_many_requests:              "Demasiados intentos. Espera unos minutos.",
  };
  return map[code] ?? "Ocurrió un error. Inténtalo de nuevo.";
}

export function SignUpForm() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [step, setStep]         = useState<Step>("form");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError]       = useState("");

  const firstName = name.split(" ")[0] ?? name;
  const lastName  = name.split(" ").slice(1).join(" ") || undefined;

  async function handleGoogleSignUp() {
    if (!isLoaded || !signUp) return;
    setSocialLoading(true);
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy:             "oauth_google",
        redirectUrl:          "/sso-callback",
        redirectUrlComplete:  "/onboarding",
      });
    } catch {
      setError("No se pudo conectar con Google. Inténtalo de nuevo.");
      setSocialLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8)  { setError("La contraseña debe tener al menos 8 caracteres."); return; }

    setLoading(true);
    setError("");

    try {
      await signUp.create({ emailAddress: email, password, firstName, lastName });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      const code = (err as { errors?: { code: string }[] })?.errors?.[0]?.code ?? "";
      setError(clerkMsg(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/onboarding");
      }
    } catch (err: unknown) {
      const errCode = (err as { errors?: { code: string }[] })?.errors?.[0]?.code ?? "";
      setError(clerkMsg(errCode));
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!signUp) return;
    setError("");
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch {
      setError("No se pudo reenviar el código. Intenta de nuevo.");
    }
  }

  const errorBox = error && (
    <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );

  // ── Paso 2: verificar correo ──────────────────────────────────────────────
  if (step === "verify") {
    return (
      <form onSubmit={handleVerify} noValidate className="space-y-4">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 ring-1 ring-brand-teal/25">
            <Mail size={18} className="text-brand-teal" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-brand-navy">
              Confirma tu correo
            </h1>
            <p className="mt-0.5 text-sm font-body text-slate-500">
              Te enviamos un código de 6 dígitos a <strong className="text-slate-700">{email}</strong>
            </p>
          </div>
        </div>

        {errorBox}

        <div>
          <label htmlFor="code" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Código de verificación
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-sans font-semibold tracking-[0.5em] text-brand-navy placeholder:tracking-normal placeholder:text-slate-400 placeholder:text-sm outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando...</> : "Confirmar correo"}
        </button>

        <p className="text-center text-sm font-body text-slate-500">
          ¿No llegó el código?{" "}
          <button
            type="button"
            onClick={resendCode}
            className="font-semibold text-brand-teal hover:text-brand-navy transition-colors"
          >
            Reenviar
          </button>
        </p>
      </form>
    );
  }

  // ── Paso 1: registro ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="mb-2">
        <h1 className="font-sans text-2xl font-semibold tracking-tight text-brand-navy">
          Crea tu cuenta gratis
        </h1>
        <p className="mt-1 text-sm font-body text-slate-500">
          14 días de prueba sin tarjeta de crédito
        </p>
      </div>

      {errorBox}

      {/* ── Botón Google ── */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={socialLoading}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-sans font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {socialLoading
          ? <Loader2 size={15} className="animate-spin text-slate-400" />
          : <><GoogleIcon /><span>Registrarse con Google</span></>
        }
      </button>

      {/* Divisor */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-body text-slate-400 shrink-0">o con tu correo</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={handleRegister} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Nombre completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="María González"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-teal focus:bg-white focus:ring-2 focus:ring-brand-teal/20"
          />
        </div>

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
          <label htmlFor="password" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
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

        <div>
          <label htmlFor="confirm" className="block text-xs font-sans font-semibold text-slate-700 mb-1.5">
            Confirma tu contraseña
          </label>
          <input
            id="confirm"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la contraseña"
            className={[
              "w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm font-body text-slate-800 placeholder:text-slate-400 outline-none transition-[border-color,box-shadow] duration-150 focus:bg-white focus:ring-2",
              confirm && confirm !== password
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                : "border-slate-200 focus:border-brand-teal focus:ring-brand-teal/20",
            ].join(" ")}
          />
          {confirm && confirm !== password && (
            <p className="mt-1 text-xs text-rose-600">Las contraseñas no coinciden.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !name || !email || !password || password !== confirm}
          className="w-full rounded-xl py-3 text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #1a3450 100%)" }}
        >
          {loading ? <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</> : "Crear cuenta gratis"}
        </button>

        <p className="text-center text-xs font-body text-slate-400">
          Al registrarte aceptas nuestros{" "}
          <Link href="/terminos" className="underline hover:text-slate-600 transition-colors">Términos de uso</Link>
          {" "}y{" "}
          <Link href="/privacidad" className="underline hover:text-slate-600 transition-colors">Política de privacidad</Link>.
        </p>

        <p className="text-center text-sm font-body text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href={SIGN_IN_URL} className="font-semibold text-brand-navy hover:text-brand-teal transition-colors">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
