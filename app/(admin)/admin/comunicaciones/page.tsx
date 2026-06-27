import { requireSuperAdmin } from "@/lib/auth/admin";
import { listAnnouncements, listBroadcasts } from "@/lib/services/admin-communications.service";
import { ComunicacionesClient } from "@/components/admin/ComunicacionesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comunicaciones · Frandora Admin" };

export default async function ComunicacionesPage() {
  await requireSuperAdmin();
  const [announcements, broadcasts] = await Promise.all([listAnnouncements(), listBroadcasts()]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-navy">Comunicaciones Globales</h1>
        <p className="mt-1 font-body text-sm text-slate-500">
          Envía mensajes a todos los negocios o segmentos específicos. Los banners aparecen en el panel del negocio.
        </p>
      </div>

      <ComunicacionesClient announcements={announcements} broadcasts={broadcasts} />
    </div>
  );
}
