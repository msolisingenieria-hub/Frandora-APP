import { prisma } from "@/lib/db/client";
import { createFlowPayment, getFlowPaymentStatus, getFlowPaymentUrl } from "@/lib/flow/client";
import { API_URL, businessUrl } from "@/lib/urls";

export type InitiateBookingPaymentInput = {
  appointmentId: string;
  businessId: string;
  clientEmail: string;
  amount: number;
  description: string;
};

export type BookingPaymentResult = {
  paymentUrl: string;
  flowToken: string;
  paymentId: string;
};

// Inicia un pago Flow.cl para una reserva
export async function initiateBookingPayment(
  input: InitiateBookingPaymentInput
): Promise<BookingPaymentResult> {
  const { appointmentId, businessId, clientEmail, amount, description } = input;
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { slug: true },
  });
  if (!business) throw new Error("Negocio no encontrado");

  const response = await createFlowPayment({
    commerceOrder: appointmentId,
    subject: description,
    amount,
    email: clientEmail,
    urlConfirmation: `${API_URL}/webhooks/flow`,
    urlReturn: `${businessUrl(business.slug)}?appointmentId=${appointmentId}`,
  });

  // Guardar el pago en la BD
  const payment = await prisma.payment.create({
    data: {
      businessId,
      appointmentId,
      clientId: null,
      amount,
      total: amount,
      currency: "CLP",
      method: "ONLINE",
      status: "PENDING",
      flowToken: response.token,
      flowOrderId: String(response.flowOrder),
    },
  });

  return {
    paymentUrl: getFlowPaymentUrl(response),
    flowToken: response.token,
    paymentId: payment.id,
  };
}

// Confirma un pago Flow.cl desde el webhook
export async function confirmFlowPayment(token: string): Promise<void> {
  const status = await getFlowPaymentStatus(token);

  const paymentStatus =
    status.status === 2 ? "COMPLETED" :
    status.status === 3 ? "FAILED" :
    status.status === 4 ? "FAILED" : "PENDING";

  await prisma.payment.updateMany({
    where: { flowToken: token },
    data: { status: paymentStatus as "COMPLETED" | "FAILED" | "PENDING" },
  });

  // Si el pago completó, confirmar la cita
  if (paymentStatus === "COMPLETED") {
    await prisma.payment.findFirst({
      where: { flowToken: token },
    }).then(async (p) => {
      if (p?.appointmentId) {
        await prisma.appointment.update({
          where: { id: p.appointmentId },
          data: { status: "CONFIRMED" },
        });
      }
    });
  }
}

// Obtiene el estado de pago de una cita
export async function getAppointmentPayment(appointmentId: string) {
  return prisma.payment.findFirst({
    where: { appointmentId },
    orderBy: { createdAt: "desc" },
  });
}

// Obtiene resumen de pagos del negocio para el dashboard
export async function getPaymentsSummary(businessId: string, from: Date, to: Date) {
  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      status: "COMPLETED",
      createdAt: { gte: from, lte: to },
    },
    select: { total: true, method: true },
  });

  const total = payments.reduce((sum, p) => sum + p.total, 0);
  const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.total;
    return acc;
  }, {});

  return { total, count: payments.length, byMethod, payments };
}
