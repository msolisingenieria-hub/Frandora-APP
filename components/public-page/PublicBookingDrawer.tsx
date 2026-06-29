"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { BookingPage } from "@/components/booking/BookingPage";
import type { PublicPageData } from "@/types/public-page";
import type { PublicBusiness } from "@/types/booking";

type Props = {
  data: PublicPageData;
  open: boolean;
  onClose: () => void;
  initialServiceId?: string | null;
  initialStaffId?: string | null;
};

function toPublicBusiness(data: PublicPageData): PublicBusiness {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    logoUrl: data.logoUrl,
    coverUrl: data.coverUrl,
    city: data.city,
    phone: data.phone,
    currency: data.currency,
    timezone: data.timezone,
    services: data.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: s.duration,
      price: s.price,
      color: s.color,
      imageUrl: s.imageUrl,
      categoryName: s.categoryName,
    })),
    staff: data.staff.map((m) => ({
      id: m.id,
      name: m.name,
      avatarUrl: m.avatarUrl,
      bio: m.bio,
      specialties: m.specialties,
      serviceIds: m.serviceIds,
    })),
    schedule: data.schedule,
  };
}

export function PublicBookingDrawer({
  data,
  open,
  onClose,
  initialServiceId,
  initialStaffId,
}: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-250 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Panel deslizante */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-brand-lg
          max-h-[92vh] transition-transform duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]
          lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[480px] lg:rounded-none lg:max-h-full
          ${open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Reservar cita"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <span className="font-sans font-semibold text-brand-navy text-base">Reservar en {data.name}</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <BookingPage
            business={toPublicBusiness(data)}
            initialServiceId={initialServiceId ?? undefined}
            initialStaffId={initialStaffId ?? undefined}
            compact
          />
        </div>
      </div>
    </>
  );
}
