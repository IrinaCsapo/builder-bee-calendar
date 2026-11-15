// Runs after `vite build`. GitHub Pages only serves files, so for search engines and link
// previews (LinkedIn, WhatsApp, Slack…) every page gets its own HTML file with its own title,
// description, preview image and address:
//   dist/event/<id>.html   → builderbee.club/event/<id>   (plus Google "Event" structured data)
//   dist/about.html        → builderbee.club/about        (and the other pages)
//   dist/404.html          → anything else; the app shows its own "not found" page
//   dist/sitemap.xml, dist/robots.txt, dist/calendar.ics (the subscribable calendar)
// Each file is the normal app; the browser takes over as usual once it loads.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import type { CalendarEvent } from '../src/types/event';
import { buildFeed } from '../src/lib/ics';

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
  if (m.jsonLd) extra.push(`<script type="application/ld+json">${JSON.stringify(m.jsonLd).replace(/</g, '\\u003c')}</script>`);
  set(/<\/head>/, `    ${extra.join('\n    ')}\n  </head>`);
  return html;
}

function write(file: string, html: string) {
  const target = new URL(file, DIST);
  mkdirSync(new URL('.', target), { recursive: true });
  writeFileSync(target, html);
}

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
  }));
}

// ---- Other pages ------------------------------------------------------------

const PAGES: Meta[] = [
  { path: '/about', title: 'About · BuilderBee', description: 'One place to find hackathons and tech events for women and non-binary builders, so you can find something to join this month in under 30 seconds.' },
  { path: '/communities', title: 'Communities · BuilderBee', description: 'Groups and organisations that run events for women, non-binary people and allies in tech. Follow the ones you like so you hear about their next event first.' },
  { path: '/how-it-works', title: 'How it works · BuilderBee', description: 'How BuilderBee finds, checks and lists hackathons, workshops, meetups and conferences for women, non-binary people and allies in tech.' },
  { path: '/submit', title: 'Submit an event · BuilderBee', description: 'Know a hackathon, meetup or workshop that welcomes women and non-binary builders? Add it to the BuilderBee calendar. No account needed.' },
  { path: '/subscribe', title: 'Subscribe to the calendar · BuilderBee', description: 'Get every BuilderBee event in Google Calendar, Apple Calendar or Outlook. New events appear on their own.' },
  { path: '/privacy', title: 'Privacy policy · BuilderBee', description: 'What BuilderBee collects (as little as possible) and why. We never sell your data or give it to anyone else.' },
  { path: '/cookies', title: 'Cookie policy · BuilderBee', description: 'BuilderBee doesn’t set any cookies, and there’s no advertising or tracking across sites.' },
];
for (const p of PAGES) write(`${p.path.slice(1)}.html`, render(p));

// The home page gets its canonical address too; anything unknown falls back to the app
const home = template.replace('</head>', `    <link rel="canonical" href="${SITE}/" />\n  </head>`);
write('index.html', home);
write('404.html', home.replace(/\s*<link rel="canonical"[^>]*>/, ''));

// ---- Calendar feed: upcoming events plus the last month, so recent ones don't vanish mid-event ----

const monthAgo = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 10);
const feedEvents = events.filter((e) => e.end_date >= monthAgo).sort((a, b) => a.start_date.localeCompare(b.start_date));
write('calendar.ics', buildFeed(feedEvents, SITE));

// ---- Sitemap and robots.txt ---------------------------------------------------

const today = new Date().toISOString().slice(0, 10);
const upcoming = events.filter((e) => e.end_date >= today);
const urls = [
  { loc: `${SITE}/`, changefreq: 'daily', priority: '1.0' },
  ...PAGES.map((p) => ({ loc: SITE + p.path, changefreq: 'monthly', priority: '0.5' })),
  ...upcoming.map((e) => ({ loc: `${SITE}/event/${e.id}`, changefreq: 'weekly', priority: '0.8' })),
];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /hero-lab\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`prerender: ${events.length} event pages, ${PAGES.length} other pages, sitemap with ${urls.length} addresses, calendar feed with ${feedEvents.length} events`);
