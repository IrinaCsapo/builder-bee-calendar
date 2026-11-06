// Runs before every build. Any invalid event fails the build with a clear message.
import { readFileSync } from 'node:fs';
import { EVENT_TYPES, FORMATS, REGIONS, THEMES, LEVELS, COSTS } from '../src/types/event';

const FILE = new URL('../src/data/events.json', import.meta.url);
const data: unknown = JSON.parse(readFileSync(FILE, 'utf8'));
const errors: string[] = [];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_FIELDS = new Set([
  'id', 'title', 'organiser', 'event_type', 'format', 'start_date', 'end_date', 'timezone',
  'city', 'country', 'region', 'venue', 'lat', 'lng', 'themes', 'audience', 'level', 'cost',
  'registration_url', 'deadline', 'image_url', 'source',
]);

const isDate = (v: unknown) => typeof v === 'string' && ISO_DATE.test(v) && !Number.isNaN(Date.parse(v));
const isUrl = (v: unknown) => { try { return /^https?:$/.test(new URL(String(v)).protocol); } catch { return false; } };
const isTimezone = (v: unknown) => { try { new Intl.DateTimeFormat('en', { timeZone: String(v) }); return true; } catch { return false; } };

if (!Array.isArray(data)) {
  errors.push('events.json must be an array of events');
} else {
  const seen = new Set<string>();
  data.forEach((e: Record<string, unknown>, i) => {
    const where = `event #${i + 1} (${typeof e.id === 'string' ? e.id : 'no id'})`;
    const fail = (msg: string) => errors.push(`${where}: ${msg}`);
    const oneOf = (field: string, allowed: readonly string[]) => {
      if (!allowed.includes(e[field] as string)) fail(`${field} is "${e[field]}", must be one of: ${allowed.join(', ')}`);
    };
    const str = (field: string, required = true) => {
      if (e[field] === undefined && !required) return;
      if (typeof e[field] !== 'string') fail(`${field} must be a string`);
      else if (required && !(e[field] as string).trim()) fail(`${field} must not be empty`);
    };

    for (const key of Object.keys(e)) if (!KNOWN_FIELDS.has(key)) fail(`unknown field "${key}" (typo?)`);

    if (typeof e.id !== 'string' || !SLUG.test(e.id)) fail('id must be a lowercase slug like "femmehacks-2027"');
    else if (seen.has(e.id)) fail('duplicate id');
    else seen.add(e.id);

    str('title'); str('organiser'); str('audience'); str('source');
    str('venue', false); str('image_url', false);
    oneOf('event_type', EVENT_TYPES);
    oneOf('format', FORMATS);
    oneOf('region', REGIONS);
    oneOf('level', LEVELS);
    oneOf('cost', COSTS);

    if (!isDate(e.start_date)) fail('start_date must be an ISO date (YYYY-MM-DD)');
    if (!isDate(e.end_date)) fail('end_date must be an ISO date (YYYY-MM-DD)');
    if (isDate(e.start_date) && isDate(e.end_date) && (e.end_date as string) < (e.start_date as string)) fail('end_date is before start_date');
    if (e.deadline !== undefined && !isDate(e.deadline)) fail('deadline must be an ISO date (YYYY-MM-DD)');
    if (!isTimezone(e.timezone)) fail(`timezone "${e.timezone}" is not a valid IANA timezone (e.g. "Europe/London")`);

    if (typeof e.city !== 'string') fail('city must be a string (empty for online events)');
    if (typeof e.country !== 'string') fail('country must be a string');
    if (e.format === 'Online' && e.city) fail('city must be empty for online events');
    if (e.format !== 'Online' && !e.city) fail('city is required for in-person and hybrid events');

    if (!Array.isArray(e.themes)) fail('themes must be an array');
    else for (const t of e.themes) if (!THEMES.includes(t)) fail(`theme "${t}" must be one of: ${THEMES.join(', ')}`);

    if (!isUrl(e.registration_url)) fail('registration_url must be a full http(s) URL');
    if (e.image_url !== undefined && !isUrl(e.image_url)) fail('image_url must be a full http(s) URL');
    for (const k of ['lat', 'lng']) if (e[k] !== undefined && typeof e[k] !== 'number') fail(`${k} must be a number`);
  });
}

if (errors.length) {
  console.error(`\n✗ events.json has ${errors.length} problem(s):\n`);
  for (const err of errors) console.error(`  - ${err}`);
  console.error('');
  process.exit(1);
}
const n = (data as unknown[]).length;
console.log(`✓ events.json is valid (${n} ${n === 1 ? "event" : "events"})`);
