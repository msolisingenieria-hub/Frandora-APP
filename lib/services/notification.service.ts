import { sendEmail } from "@/lib/email/client";
import { sendSMS } from "@/lib/sms/client";
import {
  confirmationEmail, reminderEmail, cancellationEmail,
  welcomeClientEmail, postServiceEmail,
  type AppointmentEmailData,
} from "@/lib/email/templates";
import {
  smsConfirmacion, smsRecordatorio24h,
  smsRecordatorio2h, smsCancelacion,
} from "@/lib/sms/templates";
import { prisma } from "@/lib/db/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function loadAppointmentData(appointmentId: string) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      business: { select: { name: true, slug: true } },
      clients:  {
        include: { client: { select: { name: true, email: true, phone: true } } },
        take: 1,
      },
      services: { include: { service: { select: { name: true } } }, take: 1 },
      staff:    { select: { name: true } },
    },
  });
  if (!appt) return null;

  const client  = appt.clients[0]?.client;
  const service = appt.services[0]?.service;

  return {
    id:           appt.id,
    clientName:   client?.name  ?? "Cliente",
    clientEmail:  client?.email ?? null,
    clientPhone:  client?.phone ?? null,
    businessName: appt.business.name,
    businessSlug: appt.business.slug,
    serviceName:  service?.name ?? "Servicio",
    staffName:    appt.staff?.name ?? null,
    date:         format(appt.startTime, "EEEE d 'de' MMMM", { locale: es }),
    time:         format(appt.startTime, "HH:mm"),
    bookingCode:  appt.bookingCode.slice(0, 8).toUpperCase(),
    publicUrl:    `https://${appt.business.slug}.frandora.cl`,
    reminderSentAt: appt.reminderSentAt,
    confirmationSentAt: appt.confirmationSentAt,
  };
}

export async function notifyConfirmacion(appointmentId: string) {
  const d = await loadAppointmentData(appointmentId);
  if (!d || d.confirmationSentAt) return; // ya enviado

  const emailData: AppointmentEmailData = {
    clientName: d.clientName, businessName: d.businessName, serviceName: d.serviceName,
    staffName: d.staffName, date: d.date, time: d.time, bookingCode: d.bookingCode, publicUrl: d.publicUrl,
  };

  await Promise.all([
    d.clientEmail
      ? sendEmail({ to: d.clientEmail, subject: `✅ Hora confirmada — ${d.businessName}`, html: confirmationEmail(emailData) })
      : Promise.resolve(),
    d.clientPhone
      ? sendSMS(d.clientPhone, smsConfirmacion({
          clientName: d.clientName, businessName: d.businessName,
          serviceName: d.serviceName, date: d.date, time: d.time,
        }))
      : Promise.resolve(),
  ]);

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { confirmationSentAt: new Date() },
  });
}

export async function notifyRecordatorio(appointmentId: string, horasAntes: 24 | 2) {
  const d = await loadAppointmentData(appointmentId);
  if (!d) return;

  const emailData: AppointmentEmailData = {
    clientName: d.clientName, businessName: d.businessName, serviceName: d.serviceName,
    staffName: d.staffName, date: d.date, time: d.time, bookingCode: d.bookingCode, publicUrl: d.publicUrl,
  };

  await Promise.all([
    d.clientEmail
      ? sendEmail({
          to: d.clientEmail,
          subject: `⏰ Recordatorio: tu hora en ${d.businessName}`,
          html: reminderEmail(emailData, horasAntes),
        })
      : Promise.resolve(),
    d.clientPhone
      ? sendSMS(
          d.clientPhone,
          horasAntes === 24
            ? smsRecordatorio24h({ clientName: d.clientName, businessName: d.businessName, serviceName: d.serviceName, date: d.date, time: d.time })
            : smsRecordatorio2h({ clientName: d.clientName, businessName: d.businessName, time: d.time })
        )
      : Promise.resolve(),
  ]);

  // Marcamos reminderSentAt solo en el recordatorio de 24h (es el principal)
  if (horasAntes === 24) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { reminderSentAt: new Date() },
    });
  }
}

export async function notifyCancelacion(appointmentId: string) {
  const d = await loadAppointmentData(appointmentId);
  if (!d) return;

  const emailData: AppointmentEmailData = {
    clientName: d.clientName, businessName: d.businessName, serviceName: d.serviceName,
    staffName: d.staffName, date: d.date, time: d.time, bookingCode: d.bookingCode, publicUrl: d.publicUrl,
  };

  await Promise.all([
    d.clientEmail
      ? sendEmail({ to: d.clientEmail, subject: `❌ Tu hora fue cancelada — ${d.businessName}`, html: cancellationEmail(emailData) })
      : Promise.resolve(),
    d.clientPhone
      ? sendSMS(d.clientPhone, smsCancelacion({ clientName: d.clientName, businessName: d.businessName, publicUrl: d.publicUrl }))
      : Promise.resolve(),
  ]);
}

export async function notifyBienvenidaCliente(data: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  businessSlug: string;
}) {
  await sendEmail({
    to:      data.clientEmail,
    subject: `👋 Bienvenido/a a ${data.businessName}`,
    html:    welcomeClientEmail({
      clientName: data.clientName,
      businessName: data.businessName,
      publicUrl: `https://${data.businessSlug}.frandora.cl`,
    }),
  });
}

export async function notifyPostServicio(data: {
  clientEmail: string;
  clientName: string;
  businessName: string;
  businessSlug: string;
  appointmentId: string;
}) {
  const url = `https://${data.businessSlug}.frandora.cl`;
  await sendEmail({
    to:      data.clientEmail,
    subject: `🌟 ¿Cómo te fue en ${data.businessName}?`,
    html:    postServiceEmail({
      clientName: data.clientName, businessName: data.businessName,
      reviewUrl: `${url}/opinion/${data.appointmentId}`,
      rebookUrl: url,
    }),
  });
}

// Procesar recordatorios pendientes — cron job cada 30 minutos
export async function procesarRecordatoriosPendientes() {
  const now = new Date();

  // Recordatorio 24h: citas entre 23h y 25h, sin recordatorio enviado aún
  const en24h = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: {
        gte: new Date(now.getTime() + 23 * 3_600_000),
        lte: new Date(now.getTime() + 25 * 3_600_000),
      },
      reminderSentAt: null,
    },
    select: { id: true },
  });

  // Recordatorio 2h: citas entre 1h45 y 2h15, sin recordatorio enviado (o ya con 24h)
  const en2h = await prisma.appointment.findMany({
    where: {
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: {
        gte: new Date(now.getTime() + 105 * 60_000),
        lte: new Date(now.getTime() + 135 * 60_000),
      },
    },
    select: { id: true },
  });

  await Promise.all([
    ...en24h.map((a) => notifyRecordatorio(a.id, 24)),
    ...en2h.map((a) => notifyRecordatorio(a.id, 2)),
  ]);

  return { en24h: en24h.length, en2h: en2h.length };
}
