// Tells Bing, Yandex, Seznam, Naver and others (via IndexNow, https://www.indexnow.org) which pages just
// changed, so new events show up in Bing (and so in ChatGPT and Copilot search) within hours, not weeks.
// Run by .github/workflows/deploy.yml after each deploy:
//
//   tsx scripts/indexnow.ts <old-commit>   pages whose events were added or changed since that commit
//   tsx scripts/indexnow.ts all            every page in the live sitemap (first run, or after big changes)
//
// The key below is public by design: IndexNow checks it at https://builderbee.club/<key>.txt.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import type { CalendarEvent } from '../src/types/event';
import { allCollections, MIN_EVENTS } from '../src/lib/collections';

const SITE = 'https://builderbee.club';
const HOST = 'builderbee.club';
const KEY = '6a2e3d5edd19b9201fbd57db011fbb62';
const arg = process.argv[2];

const events = JSON.parse(readFileSync(new URL('../src/data/events.json', import.meta.url), 'utf8')) as CalendarEvent[];

async function urlsToSend(): Promise<string[]> {
  if (!arg || arg === 'all') {
    const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  }
  let before: CalendarEvent[] = [];
  try {
    before = JSON.parse(execFileSync('git', ['show', `${arg}:src/data/events.json`], { encoding: 'utf8' }));
  } catch {
    console.log(`indexnow: can't read events at ${arg}; nothing sent`);
    return [];
  }
  const old = new Map(before.map((e) => [e.id, JSON.stringify(e)]));
  const changed = events.filter((e) => old.get(e.id) !== JSON.stringify(e));
  if (!changed.length) return [];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.end_date >= today);
  // The new or changed events, the home page, and every landing page that lists one of them
  const pages = allCollections(events).filter(
    (c) => changed.some(c.match) && upcoming.filter(c.match).length >= MIN_EVENTS,
  );
  return [`${SITE}/`, ...changed.map((e) => `${SITE}/event/${e.id}`), ...pages.map((c) => SITE + c.path), `${SITE}/llms.txt`];
}

const urlList = await urlsToSend();
if (!urlList.length) {
  console.log('indexnow: no event changes, nothing to send');
} else {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urlList.slice(0, 10000) }),
  });
  // 200 and 202 both mean accepted
  console.log(`indexnow: sent ${urlList.length} addresses, answer ${res.status} ${res.statusText}`);
  if (res.status >= 400) {
    console.log(await res.text());
    process.exitCode = 1;
  }
}
