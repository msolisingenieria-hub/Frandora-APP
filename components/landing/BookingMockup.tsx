const APPOINTMENTS = [
  { time: "09:00", name: "Juan Pérez", service: "Corte + Barba", color: "bg-brand-teal" },
  { time: "10:30", name: "Diego Muñoz", service: "Corte clásico", color: "bg-brand-teal/70" },
  { time: "12:00", name: "Disponible", service: "", color: "bg-white/10" },
  { time: "14:00", name: "Mario Silva", service: "Afeitado", color: "bg-brand-teal" },
];

export default function BookingMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Floating notification — new booking */}
      <div className="absolute -top-4 -right-2 md:-right-8 z-10 bg-white rounded-xl shadow-brand px-3 py-2 flex items-center gap-2 animate-float">
        <span className="text-lg">🔔</span>
        <div>
          <p className="text-[11px] font-sans font-semibold text-brand-navy leading-tight">Nueva reserva</p>
          <p className="text-[10px] font-body text-brand-navy/60 leading-tight">Sofía Ramírez · 16:00</p>
        </div>
      </div>

      {/* Main calendar card */}
      <div className="bg-brand-navy/90 backdrop-blur border border-brand-teal/20 rounded-2xl p-5 shadow-teal-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-brand-teal text-[11px] font-body font-medium tracking-widest uppercase">Hoy</p>
            <p className="text-white text-sm font-sans font-semibold">Martes, 24 Junio</p>
          </div>
          <div className="bg-brand-teal/20 border border-brand-teal/30 rounded-lg px-3 py-1">
            <span className="text-brand-teal text-xs font-sans font-semibold">23 citas</span>
          </div>
        </div>

        {/* Staff selector */}
        <div className="flex gap-2 mb-4">
          {["Carlos", "Ana", "Luis"].map((s, i) => (
            <div
              key={s}
              className={`flex-1 text-center text-[10px] font-body py-1 rounded-lg cursor-pointer transition-all ${
                i === 0
                  ? "bg-brand-teal text-white font-semibold"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Appointment slots */}
        <div className="space-y-2">
          {APPOINTMENTS.map((apt) => (
            <div
              key={apt.time}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                apt.name === "Disponible"
                  ? "border border-dashed border-white/15"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <span className="text-[11px] font-body text-white/40 w-10 shrink-0">
                {apt.time}
              </span>
              {apt.name === "Disponible" ? (
                <span className="text-[11px] font-body text-white/25 italic">Disponible</span>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${apt.color}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-sans font-medium text-white truncate">{apt.name}</p>
                    <p className="text-[10px] font-body text-white/40 truncate">{apt.service}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating stat — payment */}
      <div className="absolute -bottom-4 -left-2 md:-left-8 bg-white rounded-xl shadow-brand px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-brand-mist flex items-center justify-center">
          <span className="text-sm">💳</span>
        </div>
        <div>
          <p className="text-[11px] font-sans font-semibold text-brand-navy leading-tight">Pago recibido</p>
          <p className="text-[10px] font-body text-brand-teal font-medium leading-tight">$45.000 CLP</p>
        </div>
      </div>
    </div>
  );
}
