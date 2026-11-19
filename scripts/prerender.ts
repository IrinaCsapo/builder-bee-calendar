// Runs after `vite build`. GitHub Pages only serves files, so for search engines and link
// previews (LinkedIn, WhatsApp, Slack…) every page gets its own HTML file with its own title,
// description, preview image and address:
//   dist/event/<id>.html   → builderbee.club/event/<id>   (plus Google "Event" structured data)
//   dist/about.html        → builderbee.club/about        (and the other pages)
//   dist/community/<slug>.html    → a community and its upcoming events
//   dist/hackathons.html, dist/europe.html, dist/city/<slug>.html → topic, region and city pages
// Every page also carries a plain HTML version of its content inside #root, for crawlers that don't
// run JavaScript (Bing, AI search tools). Browsers hide it and show the app (see index.html).
//   dist/404.html          → anything else; the app shows its own "not found" page
//   dist/sitemap.xml, dist/robots.txt, dist/calendar.ics (the subscribable calendar)
// Each file is the normal app; the browser takes over as usual once it loads.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import type { CalendarEvent } from '../src/types/event';
import { buildFeed } from '../src/lib/ics';
import { ALL_COMMUNITIES, communitySlug } from '../src/data/communities';
import { communityEvents } from '../src/lib/communityEvents';
import { similarEvents } from '../src/lib/similar';
import { allCollections, MIN_EVENTS, TOPICS, REGIONS, cityCollections, collectionFaq, collectionSummary, siteSummary, type Collection, type Faq } from '../src/lib/collections';
import { CONTACT_EMAIL, FOUNDERS, REPO_URL } from '../src/lib/site';

const SITE = 'https://builderbee.club';
const DIST = new URL('../dist/', import.meta.url);
const events = JSON.parse(readFileSync(new URL('../src/data/events.json', import.meta.url), 'utf8')) as CalendarEvent[];
const template = readFileSync(new URL('index.html', DIST), 'utf8');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Meta {
  path: string;          // "/about"
  title: string;         // full <title>
  description: string;
  image?: string;        // absolute URL; default is the site's preview image
  imageAlt?: string;
  jsonLd?: object;
  body?: string;         // plain HTML of the page's content, for crawlers that don't run JavaScript
  noindex?: boolean;     // keep it out of search results
}

function render(m: Meta): string {
  const url = SITE + m.path;
  let html = template;
  const set = (pattern: RegExp, value: string) => {
    if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
    html = html.replace(pattern, value);
  };
  set(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
  set(/(<meta name="description" content=")[^"]*/, `$1${esc(m.description)}`);
  set(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`);
  set(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.description)}`);
  set(/(<meta property="og:url" content=")[^"]*/, `$1${esc(url)}`);
  if (m.image) {
    set(/(<meta property="og:image" content=")[^"]*/, `$1${esc(m.image)}`);
    // The site image's size and description don't apply to an event's own picture
    html = html.replace(/\s*<meta property="og:image:(width|height)"[^>]*>/g, '');
    set(/(<meta property="og:image:alt" content=")[^"]*/, `$1${esc(m.imageAlt ?? m.title)}`);
  }
  const extra = [`<link rel="canonical" href="${esc(url)}" />`];
  if (m.noindex) extra.push('<meta name="robots" content="noindex" />');
  if (m.jsonLd) extra.push(`<script type="application/ld+json">${JSON.stringify(m.jsonLd).replace(/</g, '\\u003c')}</script>`);
  set(/<\/head>/, `    ${extra.join('\n    ')}\n  </head>`);
  if (m.body) set(/<div id="root"><\/div>/, `<div id="root">${staticPage(m.body)}</div>`);
  return html;
}

function write(file: string, html: string) {
  const target = new URL(file, DIST);
  mkdirSync(new URL('.', target), { recursive: true });
  writeFileSync(target, html);
}

// ---- Plain HTML for crawlers ----------------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const upcoming = events.filter((e) => e.end_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));
const upcomingIn = (c: Collection) => upcoming.filter(c.match);
const linkable = (list: Collection[]) => list.filter((c) => upcomingIn(c).length >= MIN_EVENTS);

const NAV = [['/', 'Events'], ['/communities', 'Communities'], ['/how-it-works', 'How it works'], ['/about', 'About'], ['/submit', 'Submit an event'], ['/subscribe', 'Subscribe']];

function staticPage(main: string): string {
  const browse = [['By type', linkable(TOPICS)], ['By region', linkable(REGIONS)], ['By city', linkable(cityCollections(events))]] as const;
  return `<div class="static-page">
<header><p><a href="/"><strong>BuilderBee</strong></a>: hackathons and tech events for women, non-binary people and allies</p>
<nav><ul>${NAV.map(([href, text]) => `<li><a href="${href}">${text}</a></li>`).join('')}</ul></nav></header>
<main>${main}</main>
<nav><h2>Browse events</h2>${browse.filter(([, l]) => l.length).map(([title, list]) =>
    `<h3>${title}</h3><ul>${list.map((c) => `<li><a href="${c.path}">${esc(c.label)}</a> (${upcomingIn(c).length})</li>`).join('')}</ul>`).join('')}</nav>
<footer><p>BuilderBee Club. Made by builders, for builders. <a href="/privacy">Privacy policy</a></p></footer>
</div>`;
}

function eventItems(list: CalendarEvent[]): string {
  if (!list.length) return '<p>No upcoming events here right now. New events are added every morning.</p>';
  return `<ul>${list.map((e) => `<li><a href="/event/${e.id}">${esc(e.title)}</a>: ${esc(e.event_type)} by ${esc(e.organiser)}, ${dateRange(e.start_date, e.end_date)}, ${esc(place(e))}${e.cost === 'Free' ? ', free' : ''}</li>`).join('\n')}</ul>`;
}

function faqHtml(faq: Faq[]): string {
  return `<h2>Questions</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`;
}

// ---- Structured data (schema.org), read by search engines and AI tools ----

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'BuilderBee',
  alternateName: 'BuilderBee Club',
  url: `${SITE}/`,
  logo: `${SITE}/logo.png`,
  email: CONTACT_EMAIL,
  description: 'A free calendar of hackathons, workshops, meetups and conferences for women, non-binary people and allies in tech, online and around the world, updated every day.',
  founder: FOUNDERS.map((f) => ({ '@type': 'Person', name: f.name, ...(f.linkedin ? { sameAs: [f.linkedin] } : {}) })),
  sameAs: [REPO_URL],
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'BuilderBee', url: `${SITE}/`, publisher: { '@id': `${SITE}/#organization` } };

const itemList = (name: string, list: CalendarEvent[]) => ({
  '@type': 'ItemList',
  name,
  numberOfItems: list.length,
  itemListElement: list.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}/event/${e.id}`, name: e.title })),
});
const faqPage = (faq: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
const graph = (...items: object[]) => ({ '@context': 'https://schema.org', '@graph': items });

// ---- Events ---------------------------------------------------------------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return { y, m: MONTHS[m - 1], d }; };
function dateRange(start: string, end: string): string {
  const a = day(start), b = day(end);
  if (start === end) return `${a.d} ${a.m} ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${a.m} ${a.y}`;
  if (a.y === b.y) return `${a.d} ${a.m} – ${b.d} ${b.m} ${a.y}`;
  return `${a.d} ${a.m} ${a.y} – ${b.d} ${b.m} ${b.y}`;
}
const place = (e: CalendarEvent) =>
  e.format === 'Online' ? 'Online' : [e.city, e.country].filter(Boolean).join(', ') + (e.format === 'Hybrid' ? ' and online' : '');

function eventDescription(e: CalendarEvent): string {
  const article = /^[AEIOU]/.test(e.event_type) ? 'An' : 'A';
  const bits = [
    `${article} ${e.event_type.toLowerCase()} by ${e.organiser}`,
    `${dateRange(e.start_date, e.end_date)} · ${place(e)}`,
    e.cost === 'Free' ? 'Free' : '',
  ].filter(Boolean);
  const text = `${bits.join('. ')}. ${e.audience}`.trim();
  return text.length > 300 ? text.slice(0, 297).replace(/\s+\S*$/, '') + '…' : text;
}

function eventJsonLd(e: CalendarEvent, url: string) {
  const online = e.format === 'Online';
  const physical = {
    '@type': 'Place',
    name: e.venue || e.city,
    address: { '@type': 'PostalAddress', ...(e.venue ? { streetAddress: e.venue } : {}), addressLocality: e.city, addressCountry: e.country },
    ...(e.lat !== undefined && e.lng !== undefined ? { geo: { '@type': 'GeoCoordinates', latitude: e.lat, longitude: e.lng } } : {}),
  };
  const virtual = { '@type': 'VirtualLocation', url: e.registration_url };
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    description: eventDescription(e),
    url,
    startDate: e.start_date,
    endDate: e.end_date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: `https://schema.org/${online ? 'Online' : e.format === 'Hybrid' ? 'Mixed' : 'Offline'}EventAttendanceMode`,
    location: online ? virtual : e.format === 'Hybrid' ? [physical, virtual] : physical,
    ...(e.image_url ? { image: [e.image_url] } : {}),
    organizer: { '@type': 'Organization', name: e.organiser },
    ...(e.cost === 'Free'
      ? { isAccessibleForFree: true, offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', url: e.registration_url, availability: 'https://schema.org/InStock' } }
      : { offers: { '@type': 'Offer', url: e.registration_url, availability: 'https://schema.org/InStock' } }),
  };
}

for (const e of events) {
  const path = `/event/${e.id}`;
  write(`event/${e.id}.html`, render({
    path,
    title: `${e.title} · BuilderBee`,
    description: eventDescription(e),
    image: e.image_url,
    imageAlt: e.title,
    jsonLd: eventJsonLd(e, SITE + path),
    body: `<article><h1>${esc(e.title)}</h1>
<p>${esc(e.event_type)} by ${esc(e.organiser)}</p>
<p>${dateRange(e.start_date, e.end_date)} · ${esc(place(e))}${e.venue ? ` · ${esc(e.venue)}` : ''}</p>
<p>${esc(e.audience)}</p>
<p>${[e.level, e.cost, ...e.themes].map(esc).join(' · ')}${e.prize ? ` · Prize: ${esc(e.prize)}` : ''}${e.deadline ? ` · Register by ${dateRange(e.deadline, e.deadline)}` : ''}</p>
<p><a href="${esc(e.registration_url)}">Register on the organiser's site</a></p></article>
<h2>More events like this</h2>${eventItems(similarEvents(e, events))}`,
  }));
}

// ---- Other pages ------------------------------------------------------------

const PAGES: Meta[] = [
  { path: '/about', title: 'About · BuilderBee', description: 'One place to find hackathons and tech events for women and non-binary builders, so you can find something to join this month in under 30 seconds.' },
  { path: '/communities', title: 'Communities · BuilderBee', description: 'Groups and organisations that run events for women, non-binary people and allies in tech. Follow the ones you like so you hear about their next event first.' },
  { path: '/how-it-works', title: 'How it works · BuilderBee', description: 'How BuilderBee finds, checks and lists hackathons, workshops, meetups and conferences for women, non-binary people and allies in tech.' },
  { path: '/submit', title: 'Submit an event · BuilderBee', description: 'Know a hackathon, meetup or workshop that welcomes women and non-binary builders? Add it to the BuilderBee calendar. No account needed.' },
  { path: '/subscribe', title: 'Subscribe · BuilderBee', description: 'Get the latest hackathons and tech events for women and non-binary builders every week, by email or in your own calendar.' },
  { path: '/privacy', title: 'Privacy policy · BuilderBee', description: 'What BuilderBee collects (as little as possible) and why. We never sell your data or give it to anyone else.' },
  { path: '/cookies', title: 'Cookie policy · BuilderBee', description: 'BuilderBee doesn’t set any cookies, and there’s no advertising or tracking across sites.' },
];
for (const p of PAGES) {
  const heading = p.title.replace(/ · BuilderBee$/, '');
  const extra = p.path === '/communities'
    ? `<ul>${ALL_COMMUNITIES.map((c) => `<li><a href="/community/${communitySlug(c)}">${esc(c.name)}</a>: ${esc(c.about)}</li>`).join('')}</ul>`
    : '';
  write(`${p.path.slice(1)}.html`, render({
    ...p,
    ...(p.path === '/about' ? { jsonLd: graph(ORGANIZATION) } : {}),
    body: `<h1>${esc(heading)}</h1><p>${esc(p.description)}</p>${extra}`,
  }));
}

// Where people land after confirming the weekly email (not in the sitemap or search results)
write('subscribed.html', render({
  path: '/subscribed', noindex: true,
  title: 'You’re subscribed · BuilderBee',
  description: 'You’re subscribed to the BuilderBee weekly email: new hackathons, workshops and meetups for women, non-binary people and allies in tech, every Monday.',
  body: '<h1>You’re subscribed to the BuilderBee weekly email</h1><p>Every Monday morning you’ll get one short email with new hackathons, workshops and meetups for women, non-binary people and allies in tech.</p><p><a href="/">Browse events</a></p>',
}));

// One page per community (/communities/<slug>), with its upcoming events
const slugs = new Set<string>();
const COMMUNITY_PAGES: Meta[] = ALL_COMMUNITIES.map((c) => {
  const slug = communitySlug(c);
  if (slugs.has(slug)) throw new Error(`prerender: two communities share the address /community/${slug}`);
  slugs.add(slug);
  const n = communityEvents(c, events).length;
  const count = n ? ` ${n} upcoming ${n === 1 ? 'event' : 'events'} on BuilderBee.` : '';
  return {
    path: `/community/${slug}`, title: `${c.name} events · BuilderBee`, description: `${c.about}${count}`,
    body: `<h1>${esc(c.name)}</h1><p>${esc(c.about)}</p><p>${esc(c.where)} · <a href="${esc(c.url)}">Visit their site</a></p>
<h2>Upcoming events</h2>${eventItems(communityEvents(c, events))}`,
  };
});
for (const p of COMMUNITY_PAGES) write(`${p.path.slice(1)}.html`, render(p));

// Topic, region and city pages (/hackathons, /europe, /city/london)
const COLLECTIONS = allCollections(events);
for (const c of COLLECTIONS) {
  const n = upcomingIn(c).length;
  const faq = collectionFaq(c, upcoming);
  write(`${c.path.slice(1)}.html`, render({
    path: c.path,
    title: `${c.title} · BuilderBee`,
    description: `${c.intro}${n ? ` ${n} upcoming ${n === 1 ? 'event' : 'events'}.` : ''}`,
    jsonLd: graph(itemList(c.title, upcomingIn(c)), faqPage(faq)),
    body: `<h1>${esc(c.heading)}</h1><p>${esc(c.intro)}</p><p>${esc(collectionSummary(c, upcoming))}</p>
<h2>Coming up</h2>${eventItems(upcomingIn(c))}${faqHtml(faq)}`,
  }));
}

// The home page: canonical address and the full list of upcoming events. Anything unknown falls back to the app.
const homeDescription = 'Hackathons, buildathons, meetups and workshops for women, non-binary people and allies in tech. Online and around the world.';
const home = render({
  path: '/',
  title: 'BuilderBee: hackathons and tech events for women, non-binary people and allies',
  description: homeDescription,
  jsonLd: graph(ORGANIZATION, WEBSITE, itemList('Upcoming events for women and non-binary people in tech', upcoming)),
  body: `<h1>Find your next hackathon</h1>
<p>${homeDescription}</p><p>${esc(siteSummary(upcoming))}</p>
<h2>Upcoming events</h2>${eventItems(upcoming)}`,
}).replace(/(<meta property="og:title" content=")[^"]*/, '$1BuilderBee: find your next hackathon');
write('index.html', home);
write('404.html', template);

// ---- Calendar feed: upcoming events plus the last month, so recent ones don't vanish mid-event ----

const monthAgo = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10);
const feedEvents = events.filter((e) => e.end_date >= monthAgo).sort((a, b) => a.start_date.localeCompare(b.start_date));
write('calendar.ics', buildFeed(feedEvents, SITE));

// ---- Sitemap and robots.txt ---------------------------------------------------

const urls = [
  { loc: `${SITE}/`, changefreq: 'daily', priority: '1.0' },
  ...PAGES.map((p) => ({ loc: SITE + p.path, changefreq: 'monthly', priority: '0.5' })),
  ...COMMUNITY_PAGES.map((p) => ({ loc: SITE + p.path, changefreq: 'weekly', priority: '0.6' })),
  ...linkable(COLLECTIONS).map((c) => ({ loc: SITE + c.path, changefreq: 'daily', priority: c.kind === 'Topic' ? '0.9' : '0.7' })),
  ...upcoming.map((e) => ({ loc: `${SITE}/event/${e.id}`, changefreq: 'weekly', priority: '0.8' })),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`);
// llms.txt: a plain summary of the site for AI tools (a proposed convention, https://llmstxt.org)
const linkLine = (c: Collection) => `- [${c.title}](${SITE}${c.path}): ${upcomingIn(c).length} upcoming`;
write('llms.txt', `# BuilderBee

> ${ORGANIZATION.description}

${siteSummary(upcoming)} Every event is for women and/or non-binary people in tech (some also welcome allies). A daily scout checks organisers' calendars, Luma, Eventbrite and the web, and only lists events whose dates and registration link are confirmed on the official page. Anyone can submit an event. BuilderBee is free, has no ads, sets no cookies and never sells data. Made by Irina and Tracey.

## Browse
- [All upcoming events](${SITE}/)
${linkable(TOPICS).map(linkLine).join('\n')}

## By region and city
${[...linkable(REGIONS), ...linkable(cityCollections(events))].map(linkLine).join('\n')}

## About
- [About BuilderBee](${SITE}/about)
- [How it works](${SITE}/how-it-works)
- [Communities that run these events](${SITE}/communities)
- [Submit an event](${SITE}/submit)
- [Weekly email and calendar feed](${SITE}/subscribe)
- [Calendar feed (iCal)](${SITE}/calendar.ics)

## Upcoming events
${upcoming.map((e) => `- [${e.title}](${SITE}/event/${e.id}): ${e.event_type} by ${e.organiser}, ${dateRange(e.start_date, e.end_date)}, ${place(e)}${e.cost === 'Free' ? ', free' : ''}`).join('\n')}

Contact: ${CONTACT_EMAIL}
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /hero-lab\nDisallow: /hero-old\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`prerender: ${events.length} event pages, ${PAGES.length} other pages, ${COMMUNITY_PAGES.length} community pages, ${COLLECTIONS.length} topic/region/city pages (${linkable(COLLECTIONS).length} in the sitemap), sitemap with ${urls.length} addresses, calendar feed with ${feedEvents.length} events`);
