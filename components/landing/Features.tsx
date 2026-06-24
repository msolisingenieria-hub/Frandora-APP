import { Calendar, CreditCard, Bell, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description:
      "Calendario visual con drag & drop, múltiples profesionales, sincronización con Google Calendar y página de reservas pública 24/7.",
    color: "bg-brand-teal/10 text-brand-teal",
  },
  {
    icon: CreditCard,
    title: "Pagos integrados",
    description:
      "Cobra depósitos o el total al reservar vía Flow.cl. Acepta tarjetas, transferencias y gift cards. Sin configuración compleja.",
    color: "bg-brand-navy/8 text-brand-navy",
  },
  {
    icon: Bell,
    title: "Notificaciones automáticas",
    description:
      "Recordatorios por WhatsApp, SMS y email que se envían solos. Reduce los no-shows hasta un 40% sin que muevas un dedo.",
    color: "bg-brand-teal/10 text-brand-teal",
  },
  {
    icon: BarChart3,
    title: "Control total del negocio",
    description:
      "Inventario, punto de venta, comisiones de staff, reportes de ventas y programa de lealtad. Todo lo que necesitas para crecer.",
    color: "bg-brand-navy/8 text-brand-navy",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-brand-caps text-xs mb-3 block">Por qué Frandora</span>
          <h2 className="font-sans font-bold text-3xl md:text-4xl lg:text-5xl text-brand-navy leading-tight mb-4">
            Todo lo que tu negocio necesita,{" "}
            <span className="gradient-text">en un solo lugar</span>
          </h2>
          <p className="font-body text-brand-navy/60 text-base md:text-lg">
            Olvídate de usar 5 herramientas distintas. Frandora centraliza todo
            para que te enfoques en lo que importa: atender a tus clientes.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="card-premium p-6 flex flex-col gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${feat.color}`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-brand-navy text-base mb-2">
                    {feat.title}
                  </h3>
                  <p className="font-body text-brand-navy/60 text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
