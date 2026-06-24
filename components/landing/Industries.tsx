const INDUSTRIES = [
  { icon: "✂️", label: "Barberías" },
  { icon: "💆", label: "Spas" },
  { icon: "💇", label: "Salones de belleza" },
  { icon: "🏋️", label: "Fitness & Gym" },
  { icon: "🧘", label: "Yoga & Pilates" },
  { icon: "💅", label: "Nail Studio" },
  { icon: "🌿", label: "Masajes" },
  { icon: "✨", label: "Clínica Estética" },
  { icon: "🦷", label: "Odontología" },
  { icon: "🩺", label: "Fisioterapia" },
  { icon: "🐾", label: "Veterinaria" },
  { icon: "🎓", label: "Coaching" },
];

export default function Industries() {
  return (
    <section id="industries" className="bg-brand-gray py-16 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <span className="text-brand-caps text-xs mb-3 block">Para tu tipo de negocio</span>
          <h2 className="font-sans font-bold text-2xl md:text-3xl text-brand-navy">
            Diseñado para cualquier negocio de servicios
          </h2>
        </div>

        {/* Grid responsive — scroll horizontal en mobile */}
        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.label}
              className="flex items-center gap-2 bg-white border border-brand-mist rounded-full px-4 py-2
                         shadow-brand-sm hover:border-brand-teal hover:shadow-teal transition-all duration-200
                         cursor-default group"
            >
              <span className="text-lg">{ind.icon}</span>
              <span className="font-body text-sm font-medium text-brand-navy group-hover:text-brand-teal transition-colors whitespace-nowrap">
                {ind.label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2">
            <span className="text-lg">➕</span>
            <span className="font-body text-sm font-medium text-brand-teal whitespace-nowrap">
              Y mucho más
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
