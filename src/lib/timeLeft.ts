import { useEffect, useState } from 'react';
import type { CalendarEvent } from '../types/event';

/** UTC milliseconds for a wall-clock time on a date in an IANA timezone. */
function zonedTime(dateISO: string, time: string, timeZone: string): number {
  const guess = Date.parse(`${dateISO}T${time}Z`);
  try {
    // e.g. "GMT+05:30" / "GMT-05:00" / "GMT"
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date(guess)).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT';
    const m = name.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    const offsetMin = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
    return guess - offsetMin * 60_000;
  } catch {
    return guess;
  }
}

const span = (ms: number) => {
  const mins = Math.max(1, Math.floor(ms / 60_000));
  const d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export interface TimeLeft {
  label: string;     // "Registration closes in 2d 14h"
  urgent: boolean;   // under 3 days
}

/**
 * Countdown shown on cards. Uses the event's own timezone:
 * - a known deadline closes at the end of that day
 * - otherwise registration is assumed open until the event starts
 */
export function timeLeft(e: CalendarEvent, now = Date.now()): TimeLeft {
  const start = zonedTime(e.start_date, '00:00:00', e.timezone);
  const end = zonedTime(e.end_date, '23:59:59', e.timezone);
  if (e.deadline) {
    const deadline = zonedTime(e.deadline, '23:59:59', e.timezone);
    if (deadline > now) return { label: `Registration closes in ${span(deadline - now)}`, urgent: deadline - now < 3 * 86_400_000 };
    if (start > now) return { label: 'Registration closed', urgent: false };
  }
  if (start > now) return { label: `Starts in ${span(start - now)}`, urgent: start - now < 3 * 86_400_000 };
  if (end > now) return { label: 'Happening now', urgent: true };
  return { label: 'Ended', urgent: false };
}

/** Re-renders every minute so countdowns stay current. */
export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
