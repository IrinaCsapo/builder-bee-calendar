// Landing pages for the searches people make: a type of event (/hackathons), a format (/online), a theme (/ai),
// a region (/europe), a country (/country/united-kingdom) or a city (/city/london). Used by the app (CollectionPage) and by scripts/prerender.ts,
// which gives each one its own HTML file, title and description, and lists it in the sitemap.

import { perksOf, type CalendarEvent, type Region } from '../types/event';

export interface Collection {
  path: string;          // "/hackathons"
  kind: 'Topic' | 'Region' | 'Country' | 'City';
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
    path: '/free-credits', kind: 'Topic', label: 'Free credits', kicker: 'Free credits', colour: C.pink,
    heading: 'Tech events for women with free AI credits',
    title: 'Tech events for women with free AI credits',
    intro: 'Hackathons and workshops for women and non-binary people where you get free credits for tools like Lovable, Claude or ElevenLabs, so you can keep building after the event.',
    match: (e) => perksOf(e).includes('Free credits'),
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
    // People search "hackathons in new york" and "tech events in new york", so the title names both
    title: `Women in tech events in ${city}: hackathons, meetups, workshops`,
    intro: `Hackathons, workshops and meetups for women and non-binary people in tech in ${city}${country && country !== city ? `, ${country}` : ''}.`,
    match: (e) => !!e.city && citySlug(e.city) === slug,
  }));
}

// Countries that read naturally with "the": "events in the United Kingdom"
const WITH_THE = new Set(['United States', 'United Kingdom', 'Netherlands', 'Philippines', 'United Arab Emirates', 'Czech Republic']);
const countryName = (country: string) => (WITH_THE.has(country) ? `the ${country}` : country);

/** One page for every country that has (or had) an in-person or hybrid event (/country/united-kingdom) */
export function countryCollections(events: CalendarEvent[]): Collection[] {
  const countries = new Map<string, string>();
  for (const e of events) {
    if (e.country && e.format !== 'Online' && !countries.has(citySlug(e.country))) countries.set(citySlug(e.country), e.country);
  }
  return [...countries].sort(([a], [b]) => a.localeCompare(b)).map(([slug, country], i) => ({
    path: `/country/${slug}`, kind: 'Country', label: country, kicker: country, colour: CITY_COLOURS[(i + 2) % CITY_COLOURS.length],
    heading: `Women in tech events in ${countryName(country)}`,
    title: `Women in tech events and hackathons in ${countryName(country)}`,
    intro: `Hackathons, workshops, meetups and conferences for women and non-binary people in tech across ${countryName(country)}.`,
    match: (e) => !!e.country && e.format !== 'Online' && citySlug(e.country) === slug,
  }));
}

export function allCollections(events: CalendarEvent[]): Collection[] {
  return [...TOPICS, ...REGIONS, ...countryCollections(events), ...cityCollections(events)];
}

/** Collections worth linking to and listing in the sitemap: at least this many upcoming events */
export const MIN_EVENTS = 2;

// ---- Plain facts and FAQs (shown on the pages, and as structured data for search engines and AI tools) ----

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "2026-11-21" -> "21 November" */
const shortDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTH_NAMES[Number(iso.slice(5, 7)) - 1]}`;
const where = (e: CalendarEvent) => (e.format === 'Online' ? 'online' : [e.city, e.country].filter(Boolean).join(', '));
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** One quotable sentence about the whole calendar: "BuilderBee lists 86 upcoming events … in 19 countries …" */
export function siteSummary(upcoming: CalendarEvent[]): string {
  const countries = new Set(upcoming.map((e) => e.country).filter(Boolean)).size;
  const online = upcoming.filter((e) => e.format !== 'In person').length;
  return `BuilderBee lists ${plural(upcoming.length, 'upcoming event')} for women, non-binary people and allies in tech, ` +
    `${online} of them online and the rest in ${plural(countries, 'country', 'countries')}, checked and updated every day.`;
}

/** What a collection's events are called in a sentence: "hackathons and buildathons", "events in London" */
function noun(c: Collection): string {
  const NOUNS: Record<string, string> = {
    '/hackathons': 'hackathons and buildathons', '/workshops': 'workshops and bootcamps', '/meetups': 'meetups',
    '/conferences': 'conferences', '/online': 'online and hybrid events', '/ai': 'AI events', '/free': 'free events',
    '/beginners': 'beginner-friendly events', '/free-credits': 'events with free AI credits', '/gaming-and-arts': 'game jams and creative tech events',
  };
  return NOUNS[c.path] ?? `events in ${c.kind === 'Country' ? countryName(c.label) : c.label}`;
}

/** One quotable sentence about a collection: "BuilderBee lists 10 upcoming hackathons … The next is …" */
export function collectionSummary(c: Collection, upcoming: CalendarEvent[]): string {
  const list = upcoming.filter(c.match);
  if (!list.length) return `There are no upcoming ${noun(c)} on BuilderBee right now; new events are added every morning.`;
  const next = list[0];
  return `BuilderBee lists ${list.length} upcoming ${noun(c)} for women and non-binary people in tech, updated daily. ` +
    `The next is ${next.title} on ${shortDate(next.start_date)} (${where(next)}).`;
}

export interface Faq { q: string; a: string }

/** A few questions people ask about a collection, answered from the live data */
export function collectionFaq(c: Collection, upcoming: CalendarEvent[]): Faq[] {
  const list = upcoming.filter(c.match);
  const n = noun(c);
  const faq: Faq[] = [];
  if (list.length) {
    const first = list.slice(0, 3).map((e) => `${e.title} (${shortDate(e.start_date)}, ${where(e)})`);
    faq.push({
      q: `What ${n} for women are coming up?`,
      a: `There ${list.length === 1 ? 'is' : 'are'} ${list.length} upcoming ${n} on BuilderBee. The next ${first.length === 1 ? 'one is' : 'ones are'} ${first.join('; ')}.`,
    });
    const free = list.filter((e) => e.cost === 'Free').length;
    faq.push({
      q: `Are they free?`,
      a: free === list.length
        ? `Yes, all ${list.length} are free to join.`
        : `${free} of the ${list.length} are free to join; the others are paid. Each event is labelled Free or Paid.`,
    });
  }
  if (c.path !== '/online') {
    const online = upcoming.filter((e) => e.format !== 'In person').length;
    faq.push({
      q: `Can I join from anywhere?`,
      a: `Yes: ${online} upcoming events on BuilderBee are online or hybrid, so you can join them from anywhere. See builderbee.club/online.`,
    });
  }
  faq.push(
    {
      q: 'Who are these events for?',
      a: 'Every event on BuilderBee is for women and/or non-binary people in tech (some also welcome allies). Each listing quotes the organiser’s own words about who it’s for, so check that before you register.',
    },
    {
      q: 'How does BuilderBee find events?',
      a: 'Every morning a scout checks organisers’ calendars and searches Luma, Eventbrite and the web, and only adds events whose dates and registration link it has confirmed on the official page. Anyone can also submit an event at builderbee.club/submit.',
    },
  );
  return faq;
}
