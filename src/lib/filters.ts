import { EVENT_TYPES, FORMATS, REGIONS, THEMES } from '../types/event';
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

// ---- URL query string <-> Filters --------------------------------------
// Keys: format (comma-separated), type, region, country, theme, free=1, beginner=1
// Unknown values in a shared link are ignored rather than breaking the page.


const pick = <T extends string>(allowed: readonly T[], value: string | null): T | '' =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : '';

export function filtersFromQuery(q: URLSearchParams): Filters {
  const formats = (q.get('format') ?? '')
    .split(',')
    .map((f) => pick(FORMATS, f))
    .filter((f): f is Format => f !== '');
  return {
    formats: [...new Set(formats)],
    type: pick(EVENT_TYPES, q.get('type')),
    region: pick(REGIONS, q.get('region')),
    country: q.get('country') ?? '',
    theme: pick(THEMES, q.get('theme')),
    freeOnly: q.get('free') === '1',
    beginnerOnly: q.get('beginner') === '1',
  };
}

export function filtersToQuery(f: Filters): string {
  const q = new URLSearchParams();
  if (f.formats.length) q.set('format', FORMATS.filter((x) => f.formats.includes(x)).join(','));
  if (f.type) q.set('type', f.type);
  if (f.region) q.set('region', f.region);
  if (f.country) q.set('country', f.country);
  if (f.theme) q.set('theme', f.theme);
  if (f.freeOnly) q.set('free', '1');
  if (f.beginnerOnly) q.set('beginner', '1');
  return q.toString();
}
