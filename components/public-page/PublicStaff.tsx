"use client";

import Image from "next/image";
import { User } from "lucide-react";
import type { PublicStaffFull } from "@/types/public-page";

type Props = {
  staff: PublicStaffFull[];
  showBios: boolean;
  onBook: (staffId: string) => void;
};

function StaffCard({
  member,
  showBio,
  onBook,
}: {
  member: PublicStaffFull;
  showBio: boolean;
  onBook: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-brand-sm p-5 flex flex-col items-center text-center
      hover:shadow-brand hover:-translate-y-1 transition-all duration-200 ease-out">
      {/* Avatar */}
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-3 bg-brand-mist shrink-0">
        {member.avatarUrl ? (
          <Image src={member.avatarUrl} alt={member.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={28} className="text-brand-teal" />
          </div>
        )}
      </div>

      {/* Nombre */}
      <h3 className="font-sans font-semibold text-brand-navy text-base mb-1">{member.name}</h3>

      {/* Especialidades */}
      {member.specialties.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-2">
          {member.specialties.slice(0, 3).map((sp) => (
            <span key={sp} className="px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold bg-brand-mist text-brand-navy">
              {sp}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {showBio && member.bio && (
        <p className="font-body text-slate-500 text-xs mb-3 line-clamp-2">{member.bio}</p>
      )}

      <button
        onClick={() => onBook(member.id)}
        className="mt-auto w-full py-2 rounded-xl font-sans font-semibold text-xs text-white
          transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer hover:brightness-90"
        style={{ background: "var(--biz-primary, #0D1B2A)" }}
      >
        Reservar con {member.name.split(" ")[0]}
      </button>
    </div>
  );
}

export function PublicStaff({ staff, showBios, onBook }: Props) {
  if (staff.length === 0) return null;

  return (
    <section id="equipo" className="px-4 md:px-10 py-8 md:py-10 bg-gradient-to-b from-white to-brand-mist/20">
      <h2 className="font-sans font-bold text-brand-navy text-xl md:text-2xl mb-5">Nuestro equipo</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {staff.map((m) => (
          <StaffCard key={m.id} member={m} showBio={showBios} onBook={onBook} />
        ))}
      </div>
    </section>
  );
}
