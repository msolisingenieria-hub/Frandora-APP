"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { ClientsTable } from "@/components/dashboard/clients/ClientsTable";
import { ClientDrawer } from "@/components/dashboard/clients/ClientDrawer";
import type { ClientListItem } from "@/lib/services/client.service";

export default function ClientesPage() {
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(null);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "new" | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openClient = (client: ClientListItem) => {
    setSelectedClient(client);
    setDrawerMode("view");
  };

  const openNew = () => {
    setSelectedClient(null);
    setDrawerMode("new");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedClient(null);
  };

  const onSaved = () => {
    setRefreshTrigger((n) => n + 1);
  };

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">
              CRM
            </p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Clientes
          </h1>
        </div>
      </div>

      {/* Tabla */}
      <ClientsTable
        onSelectClient={openClient}
        onNewClient={openNew}
        refreshTrigger={refreshTrigger}
      />

      {/* Drawer */}
      {drawerMode && (
        <ClientDrawer
          client={selectedClient}
          mode={drawerMode}
          onClose={closeDrawer}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
