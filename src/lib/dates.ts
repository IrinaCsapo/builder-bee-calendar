import type { CalendarEvent } from '../types/event';

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
