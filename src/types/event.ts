// Single source of truth for the event data model.
// The allowed-value lists are used by the type, the build-time validator,
// and (later) the filter dropdowns, so they can never drift apart.

export const EVENT_TYPES = ['Hackathon', 'Buildathon', 'Meetup', 'Conference', 'Workshop', 'Bootcamp', 'Pitch night'] as const;
export const FORMATS = ['In person', 'Online', 'Hybrid'] as const;
// "Global" is for online events that aren't tied to one region.
export const REGIONS = ['Europe', 'North America', 'LatAm', 'Africa', 'Asia', 'Oceania', 'Global'] as const;
export const THEMES = ['AI', 'Fintech', 'Health', 'Climate', 'Web3', 'Design', 'No-code', 'Hardware', 'Social impact', 'Marketing', 'Creative'] as const;
export const LEVELS = ['Beginner friendly', 'All levels', 'Advanced'] as const;
export const COSTS = ['Free', 'Paid'] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type Format = (typeof FORMATS)[number];
export type Region = (typeof REGIONS)[number];
export type Theme = (typeof THEMES)[number];
export type Level = (typeof LEVELS)[number];
export type Cost = (typeof COSTS)[number];

export interface CalendarEvent {
  id: string;              // slug, e.g. "femmehacks-2027"
  title: string;
  organiser: string;
  event_type: EventType;
  format: Format;
  start_date: string;      // ISO date, YYYY-MM-DD
  end_date: string;        // ISO date, YYYY-MM-DD
  timezone: string;        // IANA, e.g. "Europe/London"
  city: string;            // empty string for online events
  country: string;         // empty string for online events with no home country
  region: Region;
  venue?: string;
  lat?: number;
  lng?: number;
  themes: Theme[];
  audience: string;        // shown exactly as the organiser writes it
  level: Level;
  cost: Cost;
  registration_url: string;
  deadline?: string;       // ISO date
  prize?: string;          // short, as the organiser states it, e.g. "$10,000 in prizes"
  image_url?: string;
  source: string;          // where we found it, or "placeholder"
}
