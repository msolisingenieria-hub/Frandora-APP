import { getPortalData } from "@/lib/services/client-portal.service";
import { PortalLayout } from "@/components/client-portal/PortalLayout";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function ClientePortalPage({ params }: Props) {
  const { token } = await params;

  const data = await getPortalData(token);
  if (!data) {
    return (
      <div className="min-h-screen bg-[#F2F4F6] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-[#0D1B2A] mb-2">Acceso no válido</h1>
          <p className="text-gray-500 text-sm">
            Este enlace no es válido o ya venció. Pídele a tu negocio que te envíe un nuevo acceso.
          </p>
        </div>
      </div>
    );
  }

  return <PortalLayout data={data} token={token} />;
}
