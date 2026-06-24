// Plantillas de email en español chileno simple, sin tecnicismos

function baseLayout(content: string, businessName: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${businessName}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,27,42,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0D1B2A,#1a3347);padding:32px 40px;text-align:center;">
        <p style="color:#6FA89E;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 4px;">RESERVAS</p>
        <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">${businessName}</h1>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:6px 0 0;">Powered by Frandora</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:40px;">${content}</td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">¿Necesitas ayuda? Contáctanos directamente.</p>
        <p style="color:#cbd5e1;font-size:11px;margin:8px 0 0;">Este correo fue enviado por ${businessName} a través de <a href="https://frandora.cl" style="color:#6FA89E;text-decoration:none;">frandora.cl</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#0D1B2A,#1a3347);color:#ffffff;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;text-decoration:none;margin-top:8px;">${text}</a>`;
}

function pill(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
      <span style="color:#94a3b8;font-size:13px;">${label}</span>
    </td>
    <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
      <span style="color:#0D1B2A;font-size:13px;font-weight:600;">${value}</span>
    </td>
  </tr>`;
}

export type AppointmentEmailData = {
  clientName: string;
  businessName: string;
  serviceName: string;
  staffName: string | null;
  date: string;
  time: string;
  bookingCode: string;
  publicUrl: string;
};

export function confirmationEmail(data: AppointmentEmailData): string {
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#6FA89E20,#0D1B2A10);border-radius:16px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✅</span>
      </div>
      <h2 style="color:#0D1B2A;font-size:22px;font-weight:700;margin:0 0 8px;">¡Tu hora está confirmada!</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Hola ${data.clientName}, te esperamos con todo listo.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
      ${pill("Servicio", data.serviceName)}
      ${data.staffName ? pill("Tu profesional", data.staffName) : ""}
      ${pill("Fecha", data.date)}
      ${pill("Hora", data.time)}
      ${pill("Código de reserva", `#${data.bookingCode}`)}
    </table>
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:28px;">
      <p style="color:#92400e;font-size:13px;margin:0;">⏰ Si necesitas cancelar o cambiar la hora, avísanos con tiempo. Consulta nuestra política de cancelación.</p>
    </div>
    <div style="text-align:center;">
      ${btn("Ver mi reserva", data.publicUrl)}
    </div>`;
  return baseLayout(content, data.businessName);
}

export function reminderEmail(data: AppointmentEmailData, hoursAhead: 24 | 2): string {
  const timeText = hoursAhead === 24 ? "mañana" : "en 2 horas";
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">⏰</span>
      <h2 style="color:#0D1B2A;font-size:22px;font-weight:700;margin:16px 0 8px;">Te recordamos tu hora</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Hola ${data.clientName}, tienes una hora agendada <strong>${timeText}</strong>.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
      ${pill("Servicio", data.serviceName)}
      ${data.staffName ? pill("Tu profesional", data.staffName) : ""}
      ${pill("Fecha", data.date)}
      ${pill("Hora", data.time)}
      ${pill("Código de reserva", `#${data.bookingCode}`)}
    </table>
    <div style="text-align:center;">
      ${btn("Ver mi reserva", data.publicUrl)}
    </div>`;
  return baseLayout(content, data.businessName);
}

export function cancellationEmail(data: AppointmentEmailData): string {
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">❌</span>
      <h2 style="color:#0D1B2A;font-size:22px;font-weight:700;margin:16px 0 8px;">Tu hora fue cancelada</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Hola ${data.clientName}, tu reserva en ${data.businessName} fue cancelada.</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:28px;">
      ${pill("Servicio", data.serviceName)}
      ${pill("Fecha", data.date)}
      ${pill("Hora", data.time)}
    </table>
    <p style="color:#64748b;font-size:14px;text-align:center;">¿Quieres reagendar? Puedes pedir una nueva hora cuando quieras.</p>
    <div style="text-align:center;margin-top:16px;">
      ${btn("Agendar nueva hora", data.publicUrl)}
    </div>`;
  return baseLayout(content, data.businessName);
}

export function welcomeClientEmail(data: { clientName: string; businessName: string; publicUrl: string }): string {
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">👋</span>
      <h2 style="color:#0D1B2A;font-size:22px;font-weight:700;margin:16px 0 8px;">¡Bienvenido/a a ${data.businessName}!</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Hola ${data.clientName}, ya puedes reservar tu próxima hora en línea, cuando quieras.</p>
    </div>
    <div style="text-align:center;margin:28px 0;">
      ${btn("Reservar ahora", data.publicUrl)}
    </div>
    <p style="color:#94a3b8;font-size:13px;text-align:center;">Reserva en minutos, desde tu celular o computador, sin llamadas.</p>`;
  return baseLayout(content, data.businessName);
}

export function postServiceEmail(data: { clientName: string; businessName: string; reviewUrl: string; rebookUrl: string }): string {
  const content = `
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:48px;">🌟</span>
      <h2 style="color:#0D1B2A;font-size:22px;font-weight:700;margin:16px 0 8px;">¿Cómo te fue?</h2>
      <p style="color:#64748b;font-size:15px;margin:0;">Hola ${data.clientName}, gracias por visitarnos. Tu opinión nos ayuda a mejorar.</p>
    </div>
    <div style="text-align:center;margin:20px 0;">
      ${btn("Dejar mi opinión ⭐", data.reviewUrl)}
    </div>
    <div style="border-top:1px solid #f1f5f9;margin:28px 0;padding-top:24px;text-align:center;">
      <p style="color:#64748b;font-size:14px;margin:0 0 12px;">¿Ya quieres tu próxima hora?</p>
      ${btn("Reservar de nuevo", data.rebookUrl)}
    </div>`;
  return baseLayout(content, data.businessName);
}
