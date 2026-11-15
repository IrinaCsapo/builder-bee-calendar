// The weekly BuilderBee email: new events from the last 7 days, registrations closing soon,
// and online events coming up. Sent through Brevo by .github/workflows/weekly-digest.yml.
//
//   npx tsx scripts/weekly-digest.ts --preview digest.html   writes the email to a file, sends nothing
//   npx tsx scripts/weekly-digest.ts --test                  sends it only to BREVO_TEST_EMAILS
//   npx tsx scripts/weekly-digest.ts                         sends it to the whole list
//
// Needs (GitHub secrets / variables): BREVO_API_KEY, BREVO_LIST_ID, and for --test BREVO_TEST_EMAILS
// (comma-separated). "New this week" compares events.json with its version from 7 days ago in git,
// so the checkout needs history (fetch-depth: 0).

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import type { CalendarEvent } from '../src/types/event';

const SITE = 'https://builderbee.club';
const SENDER = { name: 'BuilderBee', email: 'hello@builderbee.club' };
const MAX_PER_SECTION = 8;

const args = process.argv.slice(2);
const previewFile = args.includes('--preview') ? args[args.indexOf('--preview') + 1] || 'digest.html' : '';
const testOnly = args.includes('--test');

// ---- Which events ----------------------------------------------------------------

const events = JSON.parse(readFileSync(new URL('../src/data/events.json', import.meta.url), 'utf8')) as CalendarEvent[];

/** events.json as it was 7 days ago (empty if git has no history that far back) */
function idsWeekAgo(): Set<string> | null {
  try {
    const sha = execSync('git rev-list -1 --before="7 days ago" HEAD', { encoding: 'utf8' }).trim();
    if (!sha) return null;
    const old = JSON.parse(execSync(`git show ${sha}:src/data/events.json`, { encoding: 'utf8', maxBuffer: 50e6 })) as CalendarEvent[];
    return new Set(old.map((e) => e.id));
  } catch {
    return null;
  }
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const today = iso(new Date());
const inDays = (n: number) => iso(new Date(Date.now() + n * 864e5));
const upcoming = events.filter((e) => e.end_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));

const before = idsWeekAgo();
const fresh = before ? upcoming.filter((e) => !before.has(e.id)) : [];
const shown = new Set(fresh.map((e) => e.id));
const closing = upcoming
  .filter((e) => e.deadline && e.deadline >= today && e.deadline <= inDays(14) && !shown.has(e.id))
  .sort((a, b) => a.deadline!.localeCompare(b.deadline!));
closing.forEach((e) => shown.add(e.id));
const online = upcoming.filter((e) => e.format === 'Online' && e.start_date <= inDays(14) && !shown.has(e.id));

// ---- The email --------------------------------------------------------------------

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (d: string) => `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}`;
const dates = (e: CalendarEvent) => (e.start_date === e.end_date ? short(e.start_date) : `${short(e.start_date)} – ${short(e.end_date)}`);
const where = (e: CalendarEvent) =>
  e.format === 'Online' ? 'Online' : [e.city, e.country].filter(Boolean).join(', ') + (e.format === 'Hybrid' ? ' + online' : '');

function item(e: CalendarEvent, note = ''): string {
  const meta = [dates(e), where(e), e.event_type, e.cost === 'Free' ? 'Free' : ''].filter(Boolean).join(' · ');
  return `
    <tr><td style="padding:14px 0;border-bottom:1px solid #ececf0">
      <a href="${SITE}/event/${e.id}" style="color:#000;font-size:17px;font-weight:700;text-decoration:underline">${esc(e.title)}</a>
      <div style="margin-top:4px;color:#3d3d44;font-size:14px">${esc(meta)}</div>
      <div style="margin-top:2px;color:#3d3d44;font-size:14px">by ${esc(e.organiser)}${note ? ` · <strong style="color:#000">${esc(note)}</strong>` : ''}</div>
    </td></tr>`;
}

function section(title: string, intro: string, list: CalendarEvent[], note?: (e: CalendarEvent) => string): string {
  if (!list.length) return '';
  const more = list.length > MAX_PER_SECTION
    ? `<tr><td style="padding:12px 0"><a href="${SITE}/" style="color:#000;font-weight:700">See ${list.length - MAX_PER_SECTION} more on BuilderBee →</a></td></tr>`
    : '';
  return `
    <h2 style="margin:32px 0 4px;font-family:Georgia,serif;font-weight:400;font-size:24px;color:#000">${esc(title)}</h2>
    <p style="margin:0 0 4px;color:#3d3d44;font-size:14px">${esc(intro)}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${list.slice(0, MAX_PER_SECTION).map((e) => item(e, note?.(e))).join('')}${more}</table>`;
}

const total = fresh.length + closing.length + online.length;
const subject = fresh.length
  ? `${fresh.length} new ${fresh.length === 1 ? 'event' : 'events'} for women and non-binary builders this week`
  : closing.length
    ? `Registration closing soon: ${closing[0].title}${closing.length > 1 ? ` and ${closing.length - 1} more` : ''}`
    : 'Online events coming up this fortnight';

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f6f8">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f8"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px">
<tr><td style="padding:28px 28px 8px;font-family:Helvetica,Arial,sans-serif;color:#000">
  <a href="${SITE}/" style="color:#000;text-decoration:none;font-family:Georgia,serif;font-size:26px">🐝 BuilderBee</a>
  <p style="margin:12px 0 0;font-size:16px;line-height:1.5">Your weekly round-up of hackathons, workshops and meetups for women, non-binary people and allies in tech.</p>
  ${section('New this week', 'Just added to the calendar.', fresh)}
  ${section('Registration closing soon', 'Last chance to sign up.', closing, (e) => `Register by ${short(e.deadline!)}`)}
  ${section('Online in the next two weeks', 'Join from anywhere.', online)}
  <p style="margin:32px 0 0">
    <a href="${SITE}/" style="display:inline-block;padding:12px 22px;border-radius:999px;background:#000;color:#fff;font-weight:700;text-decoration:none">Browse all events</a>
  </p>
  <p style="margin:24px 0 0;font-size:14px;color:#3d3d44;line-height:1.5">Know an event we’re missing? <a href="${SITE}/submit" style="color:#000">Submit it</a>.</p>
</td></tr>
<tr><td style="padding:20px 28px 28px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#55555e;border-top:1px solid #ececf0">
  You’re getting this because you signed up at <a href="${SITE}/" style="color:#55555e">builderbee.club</a>. We never sell your data or give it to anyone else.<br>
  <a href="{{ unsubscribe }}" style="color:#55555e">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:#55555e">Privacy policy</a> · Questions? Reply to this email.
</td></tr>
</table></td></tr></table>
</body></html>`;

console.log(`digest: ${fresh.length} new, ${closing.length} closing soon, ${online.length} online soon${before ? '' : ' (no git history from a week ago, so nothing counts as new)'}`);
console.log(`subject: ${subject}`);

if (previewFile) {
  writeFileSync(previewFile, html);
  console.log(`preview written to ${previewFile}`);
  process.exit(0);
}

if (total === 0) {
  console.log('Nothing to send this week.');
  process.exit(0);
}

// ---- Send through Brevo ---------------------------------------------------------------

const key = process.env.BREVO_API_KEY;
const listId = Number(process.env.BREVO_LIST_ID);
if (!key || !listId) {
  console.error('BREVO_API_KEY and BREVO_LIST_ID must be set.');
  process.exit(1);
}

async function brevo(path: string, body: unknown) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'POST',
    headers: { 'api-key': key!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Brevo ${path} failed (${res.status}): ${text}`);
  return text ? JSON.parse(text) : {};
}

const campaign = await brevo('/emailCampaigns', {
  name: `Weekly digest ${today}${testOnly ? ' (test)' : ''}`,
  subject,
  sender: SENDER,
  replyTo: SENDER.email,
  htmlContent: html,
  recipients: { listIds: [listId] },
});

if (testOnly) {
  const emailTo = (process.env.BREVO_TEST_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  await brevo(`/emailCampaigns/${campaign.id}/sendTest`, emailTo.length ? { emailTo } : {});
  console.log(`Test sent (campaign ${campaign.id}) to ${emailTo.join(', ') || 'the Brevo test list'}.`);
} else {
  await brevo(`/emailCampaigns/${campaign.id}/sendNow`, {});
  console.log(`Sent to list ${listId} (campaign ${campaign.id}).`);
}
