// Landing pages for the searches people make: a type of event (/hackathons), a format (/online), a theme (/ai),
// a region (/europe) or a city (/city/london). Used by the app (CollectionPage) and by scripts/prerender.ts,
// which gives each one its own HTML file, title and description, and lists it in the sitemap.

import type { CalendarEvent, Region } from '../types/event';

export interface Collection {
  path: string;          // "/hackathons"
  kind: 'Topic' | 'Region' | 'City';
  label: string;         // short name for links: "Hackathons", "Europe", "London"
  kicker: string;        // small label above the heading
  heading: string;       // the page's h1
  title: string;         // <title>, without " · BuilderBee"
  intro: string;         // one or two sentences under the heading (also the meta description)
  colour: string;        // hero-lab colour for the header
  match: (e: CalendarEvent) => boolean;
}

const C = { purple: '#7B00DA', orange: '#FF6600', blue: '#0006FA', pink: '#FE06E5', green: '#21B700', sky: '#009BE9' };

export const TOPICS: Collection[] = [
  {
    path: '/hackathons', kind: 'Topic', label: 'Hackathons', kicker: 'Hackathons', colour: C.purple,
    heading: 'Hackathons and buildathons for women and non-binary builders',
    title: 'Hackathons for women and non-binary people',
    intro: 'Women-only and women and non-binary hackathons and buildathons, online and around the world. Build something in a weekend, meet your people, and maybe win a prize.',
    match: (e) => e.event_type === 'Hackathon' || e.event_type === 'Buildathon',
  },
  {
    path: '/workshops', kind: 'Topic', label: 'Workshops', kicker: 'Workshops', colour: C.orange,
    heading: 'Tech workshops and bootcamps for women',
    title: 'Tech workshops for women and non-binary people',
    intro: 'Hands-on workshops and bootcamps for women and non-binary people: learn AI tools, coding, no-code and design, often free and beginner friendly.',
    match: (e) => e.event_type === 'Workshop' || e.event_type === 'Bootcamp',
  },
  {
    path: '/meetups', kind: 'Topic', label: 'Meetups', kicker: 'Meetups', colour: C.green,
    heading: 'Women in tech meetups',
    title: 'Women in tech meetups',
    intro: 'Meetups, build nights and show-and-tells for women and non-binary people in tech, online and in cities around the world.',
    match: (e) => e.event_type === 'Meetup' || e.event_type === 'Pitch night',
  },
  {
    path: '/conferences', kind: 'Topic', label: 'Conferences', kicker: 'Conferences', colour: C.blue,
    heading: 'Women in tech conferences',
    title: 'Women in tech conferences',
    intro: 'Conferences and summits for women and non-binary people in tech, data and AI.',
    match: (e) => e.event_type === 'Conference',
  },
  {
    path: '/online', kind: 'Topic', label: 'Online', kicker: 'Online', colour: C.sky,
    heading: 'Online tech events for women',
    title: 'Online tech events for women and non-binary people',
    intro: 'Virtual hackathons, workshops and meetups you can join from anywhere. Hybrid events with an online option are included too.',
    match: (e) => e.format === 'Online' || e.format === 'Hybrid',
  },
  {
    path: '/ai', kind: 'Topic', label: 'AI', kicker: 'AI', colour: C.pink,
    heading: 'AI events for women',
    title: 'AI events, workshops and hackathons for women',
    intro: 'Learn and build with AI alongside other women and non-binary people: AI hackathons, hands-on workshops with tools like Claude and Lovable, and women in AI meetups.',
    match: (e) => e.themes.includes('AI'),
  },
  {
    path: '/free', kind: 'Topic', label: 'Free', kicker: 'Free', colour: C.green,
    heading: 'Free tech events for women',
    title: 'Free tech events for women and non-binary people',
    intro: 'Hackathons, workshops and meetups for women and non-binary people in tech that cost nothing to join.',
    match: (e) => e.cost === 'Free',
  },
  {
    path: '/beginners', kind: 'Topic', label: 'Beginner friendly', kicker: 'Beginner friendly', colour: C.orange,
    heading: 'Beginner-friendly tech events for women',
    title: 'Beginner-friendly tech events for women',
    intro: 'New to tech, coding or AI? These events say first-timers are welcome, so it’s a good place to start.',
    match: (e) => e.level === 'Beginner friendly',
  },
  {
    path: '/gaming-and-arts', kind: 'Topic', label: 'Gaming & arts', kicker: 'Gaming & arts', colour: C.purple,
    heading: 'Game jams and creative tech events for women',
    title: 'Game jams and creative tech events for women and non-binary people',
    intro: 'Game jams, gaming meetups and art, music and creative coding hackathons for women and non-binary people.',
    match: (e) => e.themes.includes('Gaming') || e.themes.includes('Arts'),
  },
];

const REGION_PAGES: { region: Region; slug: string; name: string; colour: string }[] = [
  { region: 'Europe', slug: 'europe', name: 'Europe', colour: C.blue },
  { region: 'North America', slug: 'north-america', name: 'North America', colour: C.orange },
  { region: 'LatAm', slug: 'latin-america', name: 'Latin America', colour: C.green },
  { region: 'Africa', slug: 'africa', name: 'Africa', colour: C.purple },
  { region: 'Asia', slug: 'asia', name: 'Asia', colour: C.pink },
  { region: 'Oceania', slug: 'oceania', name: 'Australia and Oceania', colour: C.sky },
];

export const REGIONS: Collection[] = REGION_PAGES.map((r) => ({
  path: `/${r.slug}`, kind: 'Region', label: r.name, kicker: r.name, colour: r.colour,
  heading: `Women in tech events in ${r.name}`,
  title: `Women in tech events in ${r.name}`,
  intro: `Hackathons, workshops and meetups for women and non-binary people in tech across ${r.name}.`,
  match: (e) => e.region === r.region,
}));

/** "Montréal" -> "montreal", "New York" -> "new-york" */
export const citySlug = (city: string) =>
  city.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CITY_COLOURS = Object.values(C);

/** One page for every city that has (or had) an in-person or hybrid event, so old links keep working */
export function cityCollections(events: CalendarEvent[]): Collection[] {
  const cities = new Map<string, { city: string; country: string }>();
  for (const e of events) {
    if (e.city && !cities.has(citySlug(e.city))) cities.set(citySlug(e.city), { city: e.city, country: e.country });
  }
  return [...cities].sort(([a], [b]) => a.localeCompare(b)).map(([slug, { city, country }], i) => ({
    path: `/city/${slug}`, kind: 'City', label: city, kicker: country || city, colour: CITY_COLOURS[i % CITY_COLOURS.length],
    heading: `Women in tech events in ${city}`,
    title: `Women in tech events in ${city}`,
    intro: `Hackathons, workshops and meetups for women and non-binary people in tech in ${city}${country && country !== city ? `, ${country}` : ''}.`,
    match: (e) => !!e.city && citySlug(e.city) === slug,
  }));
}

export function allCollections(events: CalendarEvent[]): Collection[] {
  return [...TOPICS, ...REGIONS, ...cityCollections(events)];
}

/** Collections worth linking to and listing in the sitemap: at least this many upcoming events */
export const MIN_EVENTS = 2;
