import type { ReactNode } from "react";
import { prisma } from "@/lib/db/client";

type Props = {
  children: ReactNode;
  params: { slug: string };
};

// Fuentes soportadas en la página pública de cada negocio
const GOOGLE_FONTS: Record<string, string> = {
  "Poppins":         "Poppins:wght@300;400;500;600;700",
  "Inter":           "Inter:wght@300;400;500;600",
  "Playfair Display":"Playfair+Display:wght@400;600;700",
  "Montserrat":      "Montserrat:wght@300;400;500;600;700",
};

export default async function BookingSlugLayout({ children, params }: Props) {
  const customization = await prisma.businessCustomization.findFirst({
    where: { business: { slug: params.slug } },
    select: {
      primaryColor:   true,
      secondaryColor: true,
      accentColor:    true,
      fontFamily:     true,
      borderRadius:   true,
    },
  });

  const primary   = customization?.primaryColor   ?? "#0D1B2A";
  const secondary = customization?.secondaryColor ?? "#6FA89E";
  const accent    = customization?.accentColor    ?? "#CFE3DF";
  const font      = customization?.fontFamily     ?? "Poppins";
  const radius    = customization?.borderRadius   ?? "0.75rem";

  const fontQuery = GOOGLE_FONTS[font] ?? GOOGLE_FONTS["Poppins"];
  const needsExternalFont = font !== "Poppins" && font !== "Inter";

  const cssVars = `
    :root {
      --biz-primary:   ${primary};
      --biz-secondary: ${secondary};
      --biz-accent:    ${accent};
      --biz-font:      '${font}', sans-serif;
      --biz-radius:    ${radius};
    }
  `.trim();

  return (
    <>
      {needsExternalFont && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href={`https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`}
            rel="stylesheet"
          />
        </>
      )}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      {children}
    </>
  );
}
