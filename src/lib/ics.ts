// Builds an iCalendar (.ics) file in the browser, so no server is needed.
// Works with Apple Calendar, Outlook and Google Calendar (via import).
import type { CalendarEvent } from '../types/event';

// Text values must escape backslashes, semicolons, commas and newlines (RFC 5545 §3.3.11).
const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// Lines longer than 75 bytes must be folded: CRLF followed by a space (§3.1).
function fold(line: string): string {
  const bytes = new TextEncoder();
  const out: string[] = [];
  let current = '';
  for (const ch of line) {
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes.encode(current + ch).length > limit) { out.push(current); current = ''; }
    current += ch;
  }
  out.push(current);
  return out.join('\r\n ');
}

const compactDate = (iso: string) => iso.replace(/-/g, '');                 // 2027-03-27 -> 20270327
const nextDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); // 20261107T101500Z

export function buildIcs(event: CalendarEvent, pageUrl: string): string {
  const location = event.format === 'Online'
    ? 'Online'
    : [event.venue, event.city, event.country].filter(Boolean).join(', ');
  const description = [
    `Organised by ${event.organiser}.`,
    `Who it's for: ${event.audience}`,
    `${event.event_type} · ${event.format} · ${event.cost} · ${event.level}`,
    `Register: ${event.registration_url}`,
    `Times and details may change, so check the organiser's page.`,
    `Found on Builder Bee Calendar: ${pageUrl}`,
  ].join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Builder Bee Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@builder-bee-calendar`,
    `DTSTAMP:${stamp()}`,
    // We only know dates, not times, so these are all-day events. DTEND is exclusive.
    `DTSTART;VALUE=DATE:${compactDate(event.start_date)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay(event.end_date))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${event.registration_url}`,
    'TRANSP:TRANSPARENT', // all-day: don't mark the whole day as busy
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Triggers a download of the .ics file. */
export function downloadIcs(event: CalendarEvent, pageUrl: string) {
  const blob = new Blob([buildIcs(event, pageUrl)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}.ics`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
