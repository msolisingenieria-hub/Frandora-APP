import type { OnboardingData } from "@/types/onboarding";

type Props = {
  data: OnboardingData;
  onChange: (partial: Partial<OnboardingData>) => void;
};

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
};

function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-sans font-medium text-brand-navy">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function StepBusiness({ data, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-brand p-6 md:p-8">
      <p className="text-slate-500 text-sm mb-6">
        Esta información aparecerá en tu página pública de reservas.
      </p>

      <div className="space-y-5">
        <Field label="Nombre de tu negocio" required hint="Ej: Barbería Don Pepe, Studio Glow, Spa Serenidad">
          <input
            type="text"
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            placeholder="Mi Negocio"
            className="input-brand"
          />
        </Field>

        <Field label="Descripción" hint="Breve descripción de tu negocio (opcional)">
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Somos un equipo de profesionales especializados en..."
            rows={3}
            className="input-brand resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Teléfono de contacto" required hint="Ej: +56 9 1234 5678">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="input-brand"
            />
          </Field>

          <Field label="Ciudad" required>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Santiago, Valparaíso..."
              className="input-brand"
            />
          </Field>
        </div>

        <Field label="Dirección" hint="Calle, número, comuna (opcional)">
          <input
            type="text"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="Av. Providencia 1234, Providencia"
            className="input-brand"
          />
        </Field>
      </div>
    </div>
  );
}
