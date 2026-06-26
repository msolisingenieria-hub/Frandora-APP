import { type LucideIcon, Scissors, Sparkles, Crown, Dumbbell, Heart, Palette, Leaf, Smile, Stethoscope, PawPrint, GraduationCap, Plus } from "lucide-react";

type Industry = { Icon: LucideIcon; label: string };

const INDUSTRIES: Industry[] = [
  { Icon: Scissors,     label: "Barberías" },
  { Icon: Sparkles,     label: "Spas" },
  { Icon: Crown,        label: "Salones de belleza" },
  { Icon: Dumbbell,     label: "Fitness & Gym" },
  { Icon: Heart,        label: "Yoga & Pilates" },
  { Icon: Palette,      label: "Nail Studio" },
  { Icon: Leaf,         label: "Masajes" },
  { Icon: Sparkles,     label: "Clínica Estética" },
  { Icon: Smile,        label: "Odontología" },
  { Icon: Stethoscope,  label: "Fisioterapia" },
  { Icon: PawPrint,     label: "Veterinaria" },
  { Icon: GraduationCap, label: "Coaching" },
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

        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map(({ Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white border border-brand-mist rounded-full px-4 py-2
                         shadow-brand-sm hover:border-brand-teal hover:shadow-teal transition-[border-color,box-shadow] duration-200
                         cursor-default group"
            >
              <Icon size={14} className="text-brand-teal/70 group-hover:text-brand-teal transition-colors duration-150 flex-shrink-0" />
              <span className="font-body text-sm font-medium text-brand-navy group-hover:text-brand-teal transition-colors duration-150 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-brand-teal/10 border border-brand-teal/30 rounded-full px-4 py-2">
            <Plus size={13} className="text-brand-teal flex-shrink-0" />
            <span className="font-body text-sm font-medium text-brand-teal whitespace-nowrap">
              Y mucho más
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
