// Converts a CSV of events into src/data/events.json, then validates it.
//
//   npm run import-csv -- path/to/events.csv            replace events.json
//   npm run import-csv -- path/to/events.csv --merge    add/update by id, keep the rest
//
// Column headers match the field names in src/types/event.ts (case and spaces
// don't matter: "Start date" works for start_date). See scripts/events-template.csv.
// - themes: separate with ";" or "|", e.g. "AI; Climate"
// - id: optional, generated from title + start year if empty
// - empty optional columns are left out; source defaults to "CSV import"
// - if any row is invalid, events.json is left unchanged
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error('Usage: npm run import-csv -- path/to/events.csv [--merge]');
  process.exit(1);
}
const merge = flags.includes('--merge');
const OUT = new URL('../src/data/events.json', import.meta.url);

/** Minimal RFC 4180 CSV parser: quoted fields, "" escapes, commas and newlines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQuotes = false;
  text = text.replace(/^﻿/, ''); // Excel/Sheets byte-order mark
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim()));
}

const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const ORDER = [
  'id', 'title', 'organiser', 'event_type', 'format', 'start_date', 'end_date', 'timezone',
  'city', 'country', 'region', 'venue', 'lat', 'lng', 'themes', 'audience', 'level', 'cost',
  'registration_url', 'deadline', 'image_url', 'source',
];
const ALWAYS_PRESENT = new Set(['city', 'country', 'themes']); // required by the type even when empty

const [header, ...lines] = parseCsv(readFileSync(file, 'utf8'));
const columns = header.map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/^organizer$/, 'organiser'));
const unknown = columns.filter((c) => c && !ORDER.includes(c));
if (unknown.length) console.warn(`⚠ Ignoring unknown column(s): ${unknown.join(', ')}`);

const imported = lines.map((cells) => {
  const raw: Record<string, string> = {};
  columns.forEach((col, i) => { if (ORDER.includes(col)) raw[col] = (cells[i] ?? '').trim(); });

  if (!raw.end_date) raw.end_date = raw.start_date;              // one-day events
  if (!raw.id) raw.id = slugify(`${raw.title} ${raw.start_date?.slice(0, 4) ?? ''}`);
  if (raw.format === 'Online' && !raw.region) raw.region = 'Global';
  if (!raw.source) raw.source = 'CSV import';

  const event: Record<string, unknown> = {};
  for (const key of ORDER) {
    const value = raw[key] ?? '';
    if (key === 'themes') event.themes = value ? value.split(/[;|]/).map((t) => t.trim()).filter(Boolean) : [];
    else if (key === 'lat' || key === 'lng') { if (value) event[key] = Number(value); }
    else if (value || ALWAYS_PRESENT.has(key)) event[key] = value;
  }
  return event;
});

let events = imported;
if (merge) {
  const existing = JSON.parse(readFileSync(OUT, 'utf8')) as Record<string, unknown>[];
  const byId = new Map(existing.map((e) => [e.id, e]));
  for (const e of imported) byId.set(e.id, e);
  events = [...byId.values()];
}
events.sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)) || String(a.title).localeCompare(String(b.title)));

const previous = readFileSync(OUT, 'utf8');
writeFileSync(OUT, JSON.stringify(events, null, 2) + '\n');

// Same check the build runs. If it fails, put the old file back so nothing breaks.
try {
  execSync('npx tsx scripts/validate-events.ts', { stdio: 'inherit' });
  console.log(`Wrote ${events.length} events to src/data/events.json (${imported.length} from CSV${merge ? ', merged' : ''})`);
} catch {
  writeFileSync(OUT, previous);
  console.error('events.json was left unchanged. Fix the rows above in the CSV and run the import again.');
  process.exit(1);
}
