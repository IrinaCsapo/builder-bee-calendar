import type { CalendarEvent } from '../types/event';
import type { Community } from '../data/communities';
import { applyFilters, EMPTY_FILTERS } from './filters';
import { getUpcoming } from './dates';

/** A community's upcoming events on BuilderBee (soonest first), found with its `search` words. */
export function communityEvents(c: Community, events: CalendarEvent[]): CalendarEvent[] {
  if (!c.search) return [];
  return applyFilters(getUpcoming(events), { ...EMPTY_FILTERS, query: c.search });
}
