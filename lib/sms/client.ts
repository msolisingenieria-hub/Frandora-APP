import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[SMS] Twilio no configurado — SMS omitido");
    return false;
  }
  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({ body: message, from: fromNumber, to });
    return true;
  } catch (err) {
    console.error("[SMS] Error al enviar:", err);
    return false;
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const waNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!accountSid || !authToken || !waNumber) {
    console.warn("[WhatsApp] Twilio WhatsApp no configurado — mensaje omitido");
    return false;
  }
  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body:  message,
      from:  `whatsapp:${waNumber}`,
      to:    `whatsapp:${to}`,
    });
    return true;
  } catch (err) {
    console.error("[WhatsApp] Error al enviar:", err);
    return false;
  }
}
