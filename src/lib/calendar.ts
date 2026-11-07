// Month grid for the calendar view. Weeks start on Monday.
import type { CalendarEvent } from '../types/event';

export interface CalendarDay {
  iso: string;               // "2026-11-14"
  day: number;               // 14
  events: CalendarEvent[];   // events running on this day (multi-day events appear on each day)
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11" -> { year: 2026, month: 11 } (1-based month). */
export const parseMonth = (key: string) => ({ year: +key.slice(0, 4), month: +key.slice(5, 7) });
export const monthKey = (year: number, month: number) => `${year}-${pad(month)}`;
export const isMonthKey = (s: string | null): s is string => !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

export function addMonths(key: string, delta: number): string {
  const { year, month } = parseMonth(key);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return monthKey(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

/** Weeks of the month: each week is 7 slots, null for days outside the month. */
export function buildMonth(key: string, events: CalendarEvent[]): (CalendarDay | null)[][] {
  const { year, month } = parseMonth(key);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0

  const slots: (CalendarDay | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${key}-${pad(d)}`;
    slots.push({ iso, day: d, events: events.filter((e) => e.start_date <= iso && e.end_date >= iso) });
  }
  while (slots.length % 7) slots.push(null);

  const weeks: (CalendarDay | null)[][] = [];
  for (let i = 0; i < slots.length; i += 7) weeks.push(slots.slice(i, i + 7));
  return weeks;
}

/** Number of distinct events that touch this month. */
export function countInMonth(key: string, events: CalendarEvent[]): number {
  const start = `${key}-01`, end = `${key}-31`;
  return events.filter((e) => e.start_date <= end && e.end_date >= start).length;
}
