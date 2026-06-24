"use client";

import { useState, useEffect } from "react";
import { Megaphone, Mail, MessageSquare, Bell, Send, Users, CheckCircle2, Lock } from "lucide-react";

type Stat = { label: string; value: string; sub: string };

const CANALES = [
  { id: "email",    icon: Mail,         label: "Correo",   desc: "Para recordatorios, confirmaciones y campañas" },
  { id: "sms",      icon: MessageSquare, label: "SMS",      desc: "Mensajes de texto directos al teléfono" },
  { id: "whatsapp", icon: MessageSquare, label: "WhatsApp", desc: "Mensajes por WhatsApp Business" },
];

const AUTOMATICOS = [
  {
    id: "confirmacion",
    icon: CheckCircle2,
    label: "Confirmación de hora",
    desc: "Se envía al instante cuando alguien reserva",
    canales: ["Correo", "SMS"],
    activo: true,
  },
  {
    id: "recordatorio_24h",
    icon: Bell,
    label: "Recordatorio 24 horas antes",
    desc: "Le recuerda al cliente su hora al día siguiente",
    canales: ["Correo", "SMS"],
    activo: true,
  },
  {
    id: "recordatorio_2h",
    icon: Bell,
    label: "Recordatorio 2 horas antes",
    desc: "Un aviso extra justo antes de la hora",
    canales: ["SMS"],
    activo: true,
  },
  {
    id: "post_servicio",
    icon: Mail,
    label: "Pedir opinión después de la atención",
    desc: "Se envía cuando marcas la cita como completada",
    canales: ["Correo"],
    activo: false,
  },
  {
    id: "cumpleanos",
    icon: Mail,
    label: "Saludo de cumpleaños con descuento",
    desc: "Sorprende a tus clientes en su día",
    canales: ["Correo"],
    activo: false,
    proximamente: true,
  },
  {
    id: "reactivacion",
    icon: Users,
    label: "Recordatorio de clientes sin cita",
    desc: "Avisa a clientes que llevan más de 30 días sin venir",
    canales: ["Correo"],
    activo: false,
    proximamente: true,
  },
];

const TEST_STATS: Stat[] = [
  { label: "Correos enviados este mes", value: "—", sub: "Configura Resend para ver datos" },
  { label: "SMS enviados este mes",     value: "—", sub: "Configura Twilio para ver datos" },
  { label: "Tasa de apertura",          value: "—", sub: "Disponible pronto" },
];

export default function MarketingPage() {
  const [tab, setTab] = useState<"automaticos" | "campanas">("automaticos");
  const [stats] = useState<Stat[]>(TEST_STATS);
  const [, setLoading] = useState(true);

  useEffect(() => { setLoading(false); }, []);

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: "linear-gradient(160deg, rgba(13,27,42,0.04) 0%, #f8fafc 30%, #ffffff 100%)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-0.5">
            <Megaphone size={18} className="text-brand-teal" />
            <p className="text-brand-teal text-xs font-sans font-semibold tracking-[0.18em] uppercase">Comunicaciones</p>
          </div>
          <h1 className="text-brand-navy font-sans font-bold text-2xl md:text-3xl tracking-tight">Marketing y avisos</h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Mantén a tus clientes informados y hazlos volver sin esfuerzo.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-brand p-5">
              <p className="text-brand-navy font-sans font-bold text-2xl mb-0.5">{s.value}</p>
              <p className="text-slate-500 text-xs font-body">{s.label}</p>
              <p className="text-slate-300 text-[11px] font-body mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 mb-6 w-fit">
          {([
            { id: "automaticos", label: "Avisos automáticos" },
            { id: "campanas",    label: "Campañas" },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={[
                "px-5 py-2.5 rounded-lg text-sm font-sans font-semibold transition-all",
                tab === t.id ? "bg-white text-brand-navy shadow-brand-sm" : "text-slate-500 hover:text-brand-navy",
              ].join(" ")}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── AVISOS AUTOMÁTICOS ── */}
        {tab === "automaticos" && (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm font-body mb-4">
              Estos avisos se envían solos, sin que tengas que hacer nada. Solo actívalos.
            </p>
            {AUTOMATICOS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id}
                  className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${item.proximamente ? "border-slate-100 opacity-60" : "border-slate-100 shadow-brand"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.activo ? "bg-emerald-100" : "bg-slate-100"}`}>
                    <Icon size={18} className={item.activo ? "text-emerald-600" : "text-slate-400"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-brand-navy font-sans font-semibold text-sm">{item.label}</p>
                      {item.proximamente && (
                        <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-brand-teal/15 text-brand-teal">Próximamente</span>
                      )}
                      {item.activo && !item.proximamente && (
                        <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Activo</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs font-body mt-0.5">{item.desc}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {item.canales.map((c) => (
                        <span key={c} className="text-[11px] font-body text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  {item.proximamente
                    ? <Lock size={16} className="text-slate-300 shrink-0 mt-0.5" />
                    : null}
                </div>
              );
            })}

            {/* Canales configurados */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6 mt-6">
              <h3 className="text-brand-navy font-sans font-semibold text-sm mb-4">Canales de comunicación</h3>
              <div className="space-y-3">
                {CANALES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <Icon size={16} className="text-slate-400 shrink-0" />
                      <div className="flex-1">
                        <p className="text-brand-navy font-sans font-semibold text-sm">{c.label}</p>
                        <p className="text-slate-400 text-xs font-body">{c.desc}</p>
                      </div>
                      <span className="text-[11px] font-sans font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg whitespace-nowrap">
                        Falta configurar
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-slate-400 text-xs font-body mt-4 text-center">
                Pide a tu equipo técnico que agregue las claves de Resend y Twilio en la configuración del servidor.
              </p>
            </div>
          </div>
        )}

        {/* ── CAMPAÑAS ── */}
        {tab === "campanas" && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-slate-300" />
            </div>
            <p className="text-brand-navy font-sans font-semibold mb-1">Campañas de correo y SMS</p>
            <p className="text-slate-400 text-sm font-body mb-4 max-w-md mx-auto">
              Envía ofertas especiales, novedades o saludos a todos tus clientes con un solo click. Esta función está disponible en el plan <strong>Profesional</strong> en adelante.
            </p>
            <button
              className="px-6 py-3 rounded-xl font-sans font-semibold text-sm text-white inline-flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0D1B2A, #1a3347)" }}
              onClick={() => window.location.href = "/dashboard/facturacion"}
            >
              Ver planes disponibles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
