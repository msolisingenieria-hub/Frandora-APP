"use client";

import { useState } from "react";
import type { PublicPageData } from "@/types/public-page";
import { PublicHero }          from "./PublicHero";
import { PublicGallery }       from "./PublicGallery";
import { PublicServices }      from "./PublicServices";
import { PublicStaff }         from "./PublicStaff";
import { PublicReviews }       from "./PublicReviews";
import { PublicSchedule }      from "./PublicSchedule";
import { PublicMap }           from "./PublicMap";
import { PublicFaq }           from "./PublicFaq";
import { PublicStickyBar }     from "./PublicStickyBar";
import { PublicBookingDrawer } from "./PublicBookingDrawer";

type Props = {
  data: PublicPageData;
};

export function PublicPageLayout({ data }: Props) {
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [preServiceId,   setPreServiceId]   = useState<string | null>(null);
  const [preStaffId,     setPreStaffId]     = useState<string | null>(null);

  function openBooking(serviceId?: string, staffId?: string) {
    setPreServiceId(serviceId ?? null);
    setPreStaffId(staffId ?? null);
    setDrawerOpen(true);
  }

  const { customization, ratingStats } = data;

  return (
    <>
      {/* Contenido principal */}
      <main className="min-h-screen bg-white pb-24 lg:pb-0">
        <PublicHero
          data={data}
          onBook={() => openBooking()}
        />

        {customization.showGallery && customization.galleryUrls.length > 0 && (
          <PublicGallery urls={customization.galleryUrls} businessName={data.name} />
        )}

        <PublicServices
          services={data.services}
          currency={data.currency}
          layout={customization.servicesLayout}
          onBook={(serviceId) => openBooking(serviceId)}
        />

        {data.staff.length > 0 && (
          <PublicStaff
            staff={data.staff}
            showBios={customization.showStaffBios}
            onBook={(staffId) => openBooking(undefined, staffId)}
          />
        )}

        {customization.showReviews && (
          <PublicReviews reviews={data.reviews} stats={ratingStats} />
        )}

        {customization.showSchedule && (
          <PublicSchedule schedule={data.schedule} />
        )}

        {customization.showMap && (
          <PublicMap
            address={data.address}
            city={data.city}
            mapEmbed={customization.mapEmbed}
            businessName={data.name}
          />
        )}

        {customization.showFaq && customization.faqs.length > 0 && (
          <PublicFaq faqs={customization.faqs} />
        )}

        {/* Footer mínimo */}
        <footer className="px-4 md:px-10 py-6 border-t border-slate-100 text-center">
          <p className="font-body text-slate-400 text-xs">
            Powered by{" "}
            <a
              href="https://frandora.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-teal font-semibold hover:underline"
            >
              Frandora
            </a>
          </p>
        </footer>
      </main>

      {/* Barra sticky mobile */}
      <PublicStickyBar
        businessName={data.name}
        rating={ratingStats.average}
        totalReviews={ratingStats.total}
        onBook={() => openBooking()}
      />

      {/* Drawer de reserva */}
      <PublicBookingDrawer
        data={data}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialServiceId={preServiceId}
        initialStaffId={preStaffId}
      />
    </>
  );
}
