// Genera archivos ICS (iCalendar) para exportar citas a Google Calendar, Apple Calendar, Outlook

function escapeIcs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export interface IcsEvent {
  uid:         string;
  summary:     string;
  description?: string;
  location?:   string;
  start:       Date;
  end:         Date;
  organizer?:  { name: string; email: string };
  url?:        string;
}

export function buildIcsFile(event: IcsEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Frandora//Frandora Calendar//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}@frandora.cl`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${escapeIcs(event.summary)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcs(event.location)}`);
  }
  if (event.organizer) {
    lines.push(`ORGANIZER;CN=${escapeIcs(event.organizer.name)}:mailto:${event.organizer.email}`);
  }
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function buildGoogleCalendarUrl(event: IcsEvent): string {
  const params = new URLSearchParams({
    action:  "TEMPLATE",
    text:    event.summary,
    dates:   `${formatIcsDate(event.start)}/${formatIcsDate(event.end)}`,
    ...(event.description ? { details: event.description } : {}),
    ...(event.location    ? { location: event.location }   : {}),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
