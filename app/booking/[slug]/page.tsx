import { notFound } from "next/navigation";
import { getPublicBusinessData } from "@/lib/services/slots.service";
import { BookingPage } from "@/components/booking/BookingPage";
import type { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPublicBusinessData(params.slug);
  if (!data) return { title: "Negocio no encontrado" };
  return {
    title: `Reservar en ${data.name}`,
    description: data.description ?? `Reserva un servicio en ${data.name}`,
  };
}

export default async function PublicBookingPage({ params }: Props) {
  const data = await getPublicBusinessData(params.slug);
  if (!data) notFound();

  return <BookingPage business={data} />;
}
