"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, UserPlus, Phone, Mail, Calendar, Star } from "lucide-react";
import type { ClientListItem } from "@/lib/services/client.service";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  onSelectClient: (client: ClientListItem) => void;
  onNewClient: () => void;
  refreshTrigger?: number;
};

export function ClientsTable({ onSelectClient, onNewClient, refreshTrigger }: Props) {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(data.clients ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchClients(); }, [fetchClients, refreshTrigger]);

  // Debounce search
  useEffect(() => { setPage(1); }, [search]);

  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const STATUS_COLORS = [
    "bg-brand-teal/20 text-brand-teal",
    "bg-brand-navy/10 text-brand-navy",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal font-body text-brand-navy placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={onNewClient}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-sans font-semibold text-sm text-white shrink-0 transition-all hover:-translate-y-px"
            style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
          >
            <UserPlus size={15} />
            Nuevo cliente
          </button>
        </div>
        <p className="text-slate-400 text-xs mt-2 font-body">
          {total} {total === 1 ? "cliente" : "clientes"} en total
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Search size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-sans font-medium">
              {search ? "Sin resultados para esa búsqueda" : "Aún no hay clientes"}
            </p>
            {!search && (
              <p className="text-slate-400 text-sm mt-1 font-body">
                Las reservas online agregan clientes automáticamente
              </p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Última visita</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Citas</th>
                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  {/* Avatar + nombre */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-sans font-bold shrink-0"
                        style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
                      >
                        {getInitials(client.name)}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-brand-navy group-hover:text-brand-teal transition-colors">
                          {client.name}
                        </p>
                        {client.loyaltyPoints > 0 && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-[11px] text-amber-600 font-body">{client.loyaltyPoints} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-body">
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate max-w-[180px]">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-body">
                          <Phone size={11} className="shrink-0" />
                          {client.phone}
                        </div>
                      )}
                      {!client.email && !client.phone && (
                        <span className="text-slate-300 text-xs">Sin contacto</span>
                      )}
                    </div>
                  </td>

                  {/* Última visita */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {client.lastVisit ? (
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-body">
                        <Calendar size={11} className="text-slate-400" />
                        {format(new Date(client.lastVisit), "d MMM yyyy", { locale: es })}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">Sin visitas</span>
                    )}
                  </td>

                  {/* Total citas */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-brand-navy font-sans font-bold text-sm">
                      {client.totalAppointments}
                    </span>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.slice(0, 3).map((tag, ti) => (
                        <span key={tag} className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-medium ${STATUS_COLORS[ti % STATUS_COLORS.length]}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-body">
            Página {page} de {Math.ceil(total / 20)}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-sans font-medium"
            >
              Anterior
            </button>
            <button
              disabled={page >= Math.ceil(total / 20)}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-sans font-medium"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
