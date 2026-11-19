import type { CalendarEvent } from '../types/event';
import { getUpcoming } from './dates';

/**
 * Upcoming events most like this one, for "More events like this": same type of event, shared themes,
 * same organiser, and somewhere the visitor could also go (both online, or the same country / region).
 * Ties go to the soonest. Never the event itself.
 */
export function similarEvents(event: CalendarEvent, events: CalendarEvent[], count = 3): CalendarEvent[] {
  const score = (e: CalendarEvent) => {
    let s = 0;
    if (e.event_type === event.event_type) s += 3;
    s += 2 * e.themes.filter((t) => event.themes.includes(t)).length;
    if (e.organiser === event.organiser) s += 1;
    if (e.format === 'Online' && event.format === 'Online') s += 2;
    else if (e.country && e.country === event.country) s += 2;
    else if (e.region === event.region) s += 1;
    return s;
  };
  return getUpcoming(events)
    .filter((e) => e.id !== event.id)
    .map((e, i) => ({ e, s: score(e), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, count)
    .map(({ e }) => e);
}
