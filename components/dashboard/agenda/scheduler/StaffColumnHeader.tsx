import type { AgendaStaff } from "@/types/agenda";

interface Props {
  staff:           AgendaStaff;
  isWorking:       boolean;
  appointmentCount: number;
}

export function StaffColumnHeader({ staff, isWorking, appointmentCount }: Props) {
  const initials = staff.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[160px] relative">
      {/* Avatar */}
      <div className="relative">
        {staff.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={staff.avatarUrl} alt={staff.name}
            className={`w-9 h-9 rounded-full object-cover ring-2 ${isWorking ? "ring-brand-teal/40" : "ring-slate-200"}`} />
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-sans font-bold ring-2 ${isWorking ? "ring-brand-teal/40 bg-brand-navy text-white" : "ring-slate-200 bg-slate-100 text-slate-400"}`}>
            {initials}
          </div>
        )}
        {/* Dot de color */}
        {staff.color && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: staff.color }} />
        )}
        {/* Badge de citas */}
        {appointmentCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-teal text-white text-[9px] font-sans font-bold flex items-center justify-center">
            {appointmentCount > 9 ? "9+" : appointmentCount}
          </span>
        )}
      </div>

      {/* Nombre y rol */}
      <div className="text-center">
        <p className={`text-xs font-sans font-semibold truncate max-w-[130px] ${isWorking ? "text-brand-navy" : "text-slate-400"}`}>
          {staff.name.split(" ")[0]}
        </p>
        {staff.role && (
          <p className="text-[9px] font-body text-slate-400 uppercase tracking-wide truncate max-w-[130px]">
            {staff.role}
          </p>
        )}
      </div>

      {!isWorking && (
        <span className="text-[9px] font-body text-slate-300 uppercase tracking-wide">No atiende</span>
      )}
    </div>
  );
}
