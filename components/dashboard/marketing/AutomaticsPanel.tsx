"use client";

import { Mail, MessageSquare, Bell, Send, Users, CheckCircle2, Lock } from "lucide-react";

const CANALES = [
  { id: "email",    icon: Mail,          label: "Correo",   desc: "Para recordatorios, confirmaciones y campañas" },
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
    activo: true,
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

export function AutomaticsPanel() {
  return (
    <div className="space-y-3">
      <p className="text-slate-500 text-sm font-body mb-4">
        Estos avisos se envían solos, sin que tengas que hacer nada.
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
            {item.proximamente && <Lock size={16} className="text-slate-300 shrink-0 mt-0.5" />}
          </div>
        );
      })}

      {/* Canales configurados */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-brand p-6 mt-2">
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
          Pide a tu equipo técnico que agregue las claves de Resend y Twilio en la configuración.
        </p>
      </div>

      {/* Campañas teaser */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
        <Send size={22} className="text-slate-200 mx-auto mb-2" />
        <p className="text-brand-navy font-sans font-semibold text-sm mb-1">Campañas masivas</p>
        <p className="text-slate-400 text-xs font-body mb-3 max-w-sm mx-auto">
          Envía ofertas y novedades a todos tus clientes con un click. Disponible en plan <strong>Profesional</strong> en adelante.
        </p>
        <a href="/dashboard/facturacion"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0D1B2A,#1a3347)" }}>
          Ver planes
        </a>
      </div>
    </div>
  );
}
