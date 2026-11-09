import type { CalendarEvent } from '../types/event';
import { distanceKm, formatDistance, type Origin } from './location';
import { registrationCloses } from './timeLeft';

// Dates in events.json are plain calendar dates (YYYY-MM-DD). We treat them as
// UTC midnight everywhere so formatting never shifts a day in other timezones.
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** Today's date in the visitor's local timezone, as YYYY-MM-DD. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** An event stays visible until its end_date has passed. */
export function getUpcoming(events: CalendarEvent[], today = todayISO()): CalendarEvent[] {
  return events
    .filter((e) => e.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date) || a.title.localeCompare(b.title));
}

export interface MonthGroup {
  key: string;          // "2026-11"
  label: string;        // "November 2026"
  detail?: string;
  events: CalendarEvent[];
}

/** Groups already-sorted events by the month they start in. */
export function groupByMonth(events: CalendarEvent[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const e of events) {
    const key = e.start_date.slice(0, 7);
    if (!groups.has(key)) groups.set(key, { key, label: formatMonth(e.start_date), events: [] });
    groups.get(key)!.events.push(e);
  }
  return [...groups.values()];
}

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts });
const monthFmt = fmt({ month: 'long', year: 'numeric' });
const fullFmt = fmt({ day: 'numeric', month: 'long', year: 'numeric' });
const shortMonthFmt = fmt({ month: 'short' });

/** "November 2026" */
export const formatMonth = (iso: string) => monthFmt.format(toDate(iso));
/** "28 March 2027", for screen readers and detail pages */
export const formatFull = (iso: string) => fullFmt.format(toDate(iso));
/** "Mar" */
export const formatShortMonth = (iso: string) => shortMonthFmt.format(toDate(iso));
/** "28" */
export const formatDay = (iso: string) => String(toDate(iso).getUTCDate());

/** "27 to 28 February 2027", or a single full date for one-day events. */
export function formatRange(start: string, end: string): string {
  if (start === end) return formatFull(start);
  return `${formatFull(start)} to ${formatFull(end)}`;
}

// ---- Group by place, nearest first (for "Events near me") -------------


export interface EventGroup {
  key: string;
  label: string;
  detail?: string;
  events: CalendarEvent[];
}

/** Online events first, then one group per "City, Country", nearest first. */
export function groupByPlace(events: CalendarEvent[], origin: Origin): EventGroup[] {
  const online = events.filter((e) => e.format === 'Online');
  const places = new Map<string, { label: string; km: number; events: CalendarEvent[] }>();
  for (const e of events) {
    if (e.format === 'Online' || e.lat === undefined || e.lng === undefined) continue;
    const key = `${e.city}|${e.country}`;
    if (!places.has(key)) {
      places.set(key, { label: [e.city, e.country].filter(Boolean).join(', '), km: distanceKm(origin, { lat: e.lat, lng: e.lng }), events: [] });
    }
    places.get(key)!.events.push(e);
  }
  const groups: EventGroup[] = [];
  if (online.length) groups.push({ key: 'online', label: 'Online', detail: 'Join from anywhere', events: online });
  for (const [key, p] of [...places.entries()].sort((a, b) => a[1].km - b[1].km)) {
    groups.push({ key: slug(key), label: p.label, detail: formatDistance(p.km, origin), events: p.events });
  }
  return groups;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// ---- Group by type (the main list: each event appears once) -----------

const CATEGORIES: { key: string; label: string; types: CalendarEvent['event_type'][] }[] = [
  { key: 'build', label: 'Hackathons & buildathons', types: ['Hackathon', 'Buildathon'] },
  { key: 'meet', label: 'Meetups & talks', types: ['Meetup', 'Pitch night'] },
  { key: 'learn', label: 'Workshops & bootcamps', types: ['Workshop', 'Bootcamp'] },
  { key: 'conf', label: 'Conferences', types: ['Conference'] },
];

/**
 * One row per category, in a fixed order. Inside a row, the event whose
 * registration ends soonest comes first; events whose registration has
 * closed (but haven't ended) go to the back.
 */
export function groupByType(events: CalendarEvent[], now = Date.now()): EventGroup[] {
  const key = (e: CalendarEvent) => {
    const closes = registrationCloses(e);
    return closes > now ? closes : Number.MAX_SAFE_INTEGER - (Date.parse(e.end_date) || 0);
  };
  return CATEGORIES.map((c) => {
    const list = events.filter((e) => c.types.includes(e.event_type)).sort((a, b) => key(a) - key(b));
    return { key: c.key, label: c.label, events: list };
  }).filter((g) => g.events.length > 0);
}
