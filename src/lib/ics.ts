// Builds an iCalendar (.ics) file in the browser, so no server is needed.
// Works with Apple Calendar, Outlook and Google Calendar (via import).
import type { CalendarEvent } from '../types/event';

// Text values must escape backslashes, semicolons, commas and newlines (RFC 5545 §3.3.11).
const escapeText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

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

const locationOf = (event: CalendarEvent) => event.format === 'Online'
  ? 'Online'
  : [event.venue, event.city, event.country].filter(Boolean).join(', ');
const descriptionOf = (event: CalendarEvent, pageUrl: string) => [
  `Organised by ${event.organiser}.`,
  `Who it's for: ${event.audience}`,
  `${event.event_type} · ${event.format} · ${event.cost} · ${event.level}`,
  `Register: ${event.registration_url}`,
  `Times and details may change, so check the organiser's page.`,
  `Found on BuilderBee: ${pageUrl}`,
].join('\n');

/**
 * Google Calendar's "new event" screen, filled in: one click, then Save. All-day, end date exclusive.
 * (Apple Calendar has no such link; it uses the .ics file, which opens straight into the Calendar app.)
 */
export function googleCalendarUrl(event: CalendarEvent, pageUrl: string): string {
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compactDate(event.start_date)}/${compactDate(nextDay(event.end_date))}`,
    details: descriptionOf(event, pageUrl),
    location: locationOf(event),
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Outlook's "new event" screen, filled in. work = Microsoft 365 (work or school), else Outlook.com. */
export function outlookCalendarUrl(event: CalendarEvent, pageUrl: string, work = false): string {
  const q = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.start_date,
    enddt: nextDay(event.end_date),
    allday: 'true',
    body: descriptionOf(event, pageUrl),
    location: locationOf(event),
  });
  return `https://${work ? 'outlook.office.com' : 'outlook.live.com'}/calendar/0/action/compose?${q}`;
}

/** The VEVENT lines for one event (all-day, since we only know dates). */
function eventLines(event: CalendarEvent, pageUrl: string, stampNow: string): string[] {
  const location = locationOf(event);
  const description = descriptionOf(event, pageUrl);
  return [
    'BEGIN:VEVENT',
    `UID:${event.id}@builder-bee-calendar`,
    `DTSTAMP:${stampNow}`,
    // We only know dates, not times, so these are all-day events. DTEND is exclusive.
    `DTSTART;VALUE=DATE:${compactDate(event.start_date)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay(event.end_date))}`,
    `SUMMARY:${escapeText(event.title)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${event.registration_url}`,
    'TRANSP:TRANSPARENT', // all-day: don't mark the whole day as busy
    'END:VEVENT',
  ];
}

const calendar = (header: string[], body: string[]) =>
  ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BuilderBee//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...header, ...body, 'END:VCALENDAR']
    .map(fold).join('\r\n') + '\r\n';

/** One event, for the "Add to calendar" button. */
export function buildIcs(event: CalendarEvent, pageUrl: string): string {
  return calendar([], eventLines(event, pageUrl, stamp()));
}

/**
 * The subscribable feed (builderbee.club/calendar.ics, made at build time by scripts/prerender.ts).
 * Calendar apps check it again every so often, so new events appear on their own.
 */
export function buildFeed(events: CalendarEvent[], siteUrl: string): string {
  const now = stamp();
  return calendar(
    [
      'X-WR-CALNAME:BuilderBee',
      `X-WR-CALDESC:${escapeText(`Hackathons, buildathons, meetups and workshops for women, non-binary people and allies in tech. ${siteUrl}`)}`,
      'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
      'X-PUBLISHED-TTL:PT12H',
    ],
    events.flatMap((e) => eventLines(e, `${siteUrl}/event/${e.id}`, now)),
  );
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
