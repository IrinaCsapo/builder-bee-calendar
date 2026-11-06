import raw from '../data/events.json';
import type { CalendarEvent } from '../types/event';

// events.json is checked by scripts/validate-events.ts before every build,
// so it's safe to treat it as CalendarEvent[] here.
export const allEvents = raw as unknown as CalendarEvent[];
