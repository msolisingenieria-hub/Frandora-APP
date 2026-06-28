"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Página de callback para OAuth social (Google, Apple, Microsoft).
 * Clerk redirige aquí después del flujo OAuth; esta página completa la sesión.
 */
export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();

  useEffect(() => {
    handleRedirectCallback({
      afterSignInUrl:  "/dashboard",
      afterSignUpUrl:  "/onboarding",
    }).catch(() => {
      router.push("/sign-in");
    });
  }, [handleRedirectCallback, router]);

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 60%, #ffffff 100%)" }}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-brand-teal" />
        <p className="text-sm font-body text-slate-500">Completando inicio de sesión...</p>
      </div>
    </div>
  );
}
