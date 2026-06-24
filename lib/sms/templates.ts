// Mensajes de texto cortos en español chileno — max 160 caracteres por segmento

export function smsConfirmacion(data: {
  clientName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}): string {
  return `✅ ¡Hola ${data.clientName}! Tu hora en ${data.businessName} está confirmada: ${data.serviceName} el ${data.date} a las ${data.time}. ¡Te esperamos!`;
}

export function smsRecordatorio24h(data: {
  clientName: string;
  businessName: string;
  serviceName: string;
  date: string;
  time: string;
}): string {
  return `⏰ Recordatorio: Mañana tienes hora en ${data.businessName} — ${data.serviceName} a las ${data.time}. Si necesitas cancelar, avísanos con tiempo.`;
}

export function smsRecordatorio2h(data: {
  clientName: string;
  businessName: string;
  time: string;
}): string {
  return `⏰ Hola ${data.clientName}! En 2 horas tienes tu hora en ${data.businessName} a las ${data.time}. ¡Te esperamos!`;
}

export function smsCancelacion(data: {
  clientName: string;
  businessName: string;
  publicUrl: string;
}): string {
  return `❌ Hola ${data.clientName}, tu hora en ${data.businessName} fue cancelada. Para reagendar: ${data.publicUrl}`;
}
