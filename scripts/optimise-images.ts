// Runs before `vite build`: makes a small, web-ready copy of every event's picture, so the site never
// loads an organiser's full-size original (some are several megabytes).
//
//   public/img/events/<id>-480.webp   for cards on phones
//   public/img/events/<id>-960.webp   for cards on big screens and the event page
//
// Downloads are cached in .image-cache/ (by picture address), so each picture is only fetched and resized
// once; the deploy workflow keeps that folder between builds. Both folders are git-ignored.
// If a picture can't be fetched, the site falls back to the original address (see EventImage).

import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import type { CalendarEvent } from '../src/types/event';

const ROOT = new URL('../', import.meta.url);
const CACHE = new URL('.image-cache/', ROOT);
const OUT = new URL('public/img/events/', ROOT);
export const SIZES = [480, 960] as const;
const QUALITY = 78;

const events = JSON.parse(readFileSync(new URL('src/data/events.json', ROOT), 'utf8')) as CalendarEvent[];
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const key = (url: string) => createHash('sha1').update(url).digest('hex').slice(0, 16);
const cached = (url: string, w: number) => new URL(`${key(url)}-${w}.webp`, CACHE);

async function make(url: string): Promise<{ before: number; after: number } | 'cached' | null> {
  if (SIZES.every((w) => existsSync(cached(url, w)))) return 'cached';
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BuilderBee image resizer; +https://builderbee.club)' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const input = Buffer.from(await res.arrayBuffer());
    let after = 0;
    for (const w of SIZES) {
      const out = await sharp(input, { animated: false })
        .rotate()                                            // respect the photo's orientation
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toBuffer();
      writeFileSync(cached(url, w), out);
      after = out.length;
    }
    return { before: input.length, after };
  } catch (err) {
    console.warn(`  ! ${url.slice(0, 90)}: ${(err as Error).message}`);
    return null;
  }
}

// A few at a time, so a big batch of new events doesn't hammer anyone's server
const todo = events.filter((e) => e.image_url);
let fresh = 0, fromCache = 0, failed = 0, bytesBefore = 0, bytesAfter = 0;
for (let i = 0; i < todo.length; i += 6) {
  await Promise.all(todo.slice(i, i + 6).map(async (e) => {
    const r = await make(e.image_url!);
    if (r === null) { failed++; return; }
    if (r === 'cached') fromCache++;
    else { fresh++; bytesBefore += r.before; bytesAfter += r.after; }
    for (const w of SIZES) copyFileSync(cached(e.image_url!, w), new URL(`${e.id}-${w}.webp`, OUT));
  }));
}

const kb = (n: number) => `${Math.round(n / 1024)} KB`;
const total = todo.filter((e) => existsSync(new URL(`${e.id}-960.webp`, OUT)))
  .reduce((sum, e) => sum + statSync(new URL(`${e.id}-960.webp`, OUT)).size, 0);
console.log(
  `images: ${todo.length - failed} of ${todo.length} pictures ready (${fresh} new, ${fromCache} from cache, ${failed} failed)` +
  (fresh ? `; new ones went from ${kb(bytesBefore)} to ${kb(bytesAfter)}` : '') +
  `; all large copies together: ${kb(total)}`,
);
