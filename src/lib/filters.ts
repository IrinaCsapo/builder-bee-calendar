import type { CalendarEvent, EventType, Format, Region, Theme } from '../types/event';

export interface Filters {
  formats: Format[];          // empty = all formats
  type: EventType | '';
  region: Region | '';
  country: string;
  theme: Theme | '';
  freeOnly: boolean;
  beginnerOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  formats: [],
  type: '',
  region: '',
  country: '',
  theme: '',
  freeOnly: false,
  beginnerOnly: false,
};

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.formats.length > 0 || !!f.type || !!f.region || !!f.country || !!f.theme || f.freeOnly || f.beginnerOnly
  );
}

export function applyFilters(events: CalendarEvent[], f: Filters): CalendarEvent[] {
  return events.filter(
    (e) =>
      (f.formats.length === 0 || f.formats.includes(e.format)) &&
      (!f.type || e.event_type === f.type) &&
      (!f.region || e.region === f.region) &&
      (!f.country || e.country === f.country) &&
      (!f.theme || e.themes.includes(f.theme)) &&
      (!f.freeOnly || e.cost === 'Free') &&
      (!f.beginnerOnly || e.level === 'Beginner friendly'),
  );
}

export function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
