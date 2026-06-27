import { requireSuperAdmin } from "@/lib/auth/admin";
import { listFeatureFlags } from "@/lib/services/admin-feature-flags.service";
import { FeatureFlagsClient } from "@/components/admin/FeatureFlagsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feature Flags · Frandora Admin" };

export default async function FeatureFlagsPage() {
  await requireSuperAdmin();
  const flags = await listFeatureFlags();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-navy">Feature Flags</h1>
        <p className="mt-1 font-body text-sm text-slate-500">
          Activa o desactiva funciones sin necesidad de subir cambios. Los cambios son instantáneos.
        </p>
      </div>

      <FeatureFlagsClient flags={flags} />
    </div>
  );
}
