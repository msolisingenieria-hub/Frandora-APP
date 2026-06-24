import { Resend } from "resend";

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Frandora <reservas@frandora.cl>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY no configurado — email omitido");
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    return true;
  } catch (err) {
    console.error("[Email] Error al enviar:", err);
    return false;
  }
}
