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
// Looks like the website: logo, the hero's pink gradient, black date tiles, pill tags, the orange and
// purple buttons. Built with tables and inline styles so it holds up in Gmail, Outlook and Apple Mail.
// Pictures live on the site (public/email/), so they load like any web image.

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (d: string) => Number(d.slice(8, 10));
const mon = (d: string) => MONTHS[Number(d.slice(5, 7)) - 1];
const short = (d: string) => `${day(d)} ${mon(d)}`;
const where = (e: CalendarEvent) =>
  e.format === 'Online' ? 'Online' : [e.city, e.country].filter(Boolean).join(', ') + (e.format === 'Hybrid' ? ' + online' : '');

const SANS = `'DM Sans',Helvetica,Arial,sans-serif`;
const SERIF = `'Newsreader',Georgia,'Times New Roman',serif`;
const pill = (text: string, bg: string, border = bg, color = '#000') =>
  `<span style="display:inline-block;margin:6px 6px 0 0;padding:3px 10px;border:1px solid ${border};border-radius:999px;background:${bg};color:${color};font:600 12px/1.4 ${SANS};white-space:nowrap">${esc(text)}</span>`;
const button = (href: string, label: string, bg: string, color: string, border = bg) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-table;margin:0 8px 8px 0"><tr>
    <td bgcolor="${bg}" style="border-radius:999px;border:1.5px solid ${border}">
      <a href="${href}" style="display:inline-block;padding:12px 22px;font:700 15px/1 ${SANS};color:${color};text-decoration:none;border-radius:999px">${esc(label)}</a>
    </td></tr></table>`;

/** Black tile like the site's: day in white, month in mint */
function dateTile(e: CalendarEvent): string {
  const sameMonth = e.start_date.slice(0, 7) === e.end_date.slice(0, 7);
  const days = e.start_date === e.end_date ? `${day(e.start_date)}` : sameMonth ? `${day(e.start_date)}–${day(e.end_date)}` : `${day(e.start_date)}`;
  const size = days.length > 3 ? 17 : 24;
  return `<td width="64" valign="top" style="padding:0 14px 0 0">
    <table role="presentation" width="64" cellspacing="0" cellpadding="0"><tr>
      <td bgcolor="#000000" align="center" style="border-radius:14px;padding:10px 4px">
        <div style="font:800 ${size}px/1.1 ${SANS};color:#ffffff;white-space:nowrap">${days}</div>
        <div style="margin-top:4px;font:700 12px/1 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:#a3ffb8">${mon(e.start_date)}</div>
      </td></tr></table>
  </td>`;
}

function card(e: CalendarEvent, note = ''): string {
  const url = `${SITE}/event/${e.id}`;
  const tags = [
    note ? pill(note, '#ffe3cc', '#ffe3cc') : '',
    pill(e.format, '#ffffff', '#e4e4e7'),
    e.cost === 'Free' ? pill('Free', '#a3ffb8') : '',
    pill(e.event_type, '#f3e9ff', '#f3e9ff'),
  ].join('');
  const thumb = e.image_url
    ? `<td class="bb-thumb" width="104" valign="top" style="padding:0 0 0 14px">
        <a href="${url}"><img src="${esc(e.image_url)}" width="104" alt="" style="display:block;width:104px;max-width:104px;height:auto;border-radius:10px;border:0"></a>
      </td>`
    : '';
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;border:1px solid #e4e4e7;border-radius:16px;background:#ffffff">
    <tr><td style="padding:16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
        ${dateTile(e)}
        <td valign="top">
          <a href="${url}" style="font:700 17px/1.3 ${SANS};color:#000;text-decoration:none">${esc(e.title)}</a>
          <div style="margin-top:4px;font:400 14px/1.4 ${SANS};color:#3d3d44">by ${esc(e.organiser)} · ${esc(where(e))}</div>
          <div>${tags}</div>
        </td>
        ${thumb}
      </tr></table>
    </td></tr>
  </table>`;
}

function section(kicker: string, kickerBg: string, title: string, list: CalendarEvent[], note?: (e: CalendarEvent) => string): string {
  if (!list.length) return '';
  const more = list.length > MAX_PER_SECTION
    ? `<p style="margin:4px 0 0">${button(`${SITE}/`, `See ${list.length - MAX_PER_SECTION} more on BuilderBee →`, '#ffffff', '#000000', '#000000')}</p>`
    : '';
  return `
  <tr><td class="bb-pad" style="padding:36px 32px 0">
    <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${kickerBg};font:700 12px/1.4 ${SANS};letter-spacing:0.06em;text-transform:uppercase;color:#000">${esc(kicker)}</span>
    <h2 style="margin:10px 0 16px;font:400 28px/1.15 ${SERIF};color:#000">${esc(title)}</h2>
    ${list.slice(0, MAX_PER_SECTION).map((e) => card(e, note?.(e))).join('')}
    ${more}
  </td></tr>`;
}

const total = fresh.length + closing.length + online.length;
const subject = fresh.length
  ? `${fresh.length} new ${fresh.length === 1 ? 'event' : 'events'} for women and non-binary builders this week`
  : closing.length
    ? `Registration closing soon: ${closing[0].title}${closing.length > 1 ? ` and ${closing.length - 1} more` : ''}`
    : 'Online events coming up this fortnight';
// The headline's highlight takes one of the hero lab's word colours, a different one each week
const LAB_COLORS = ['#7B00DA', '#FF6600', '#0006FA', '#FE06E5', '#21B700', '#009BE9'];
const accent = LAB_COLORS[Math.floor(Date.now() / (7 * 864e5)) % LAB_COLORS.length];
const mark = (t: string) => `<span style="color:${accent};border-bottom:4px solid ${accent}">${t}</span>`;
const headline = fresh.length
  ? `${mark(`${fresh.length} new`)} ${fresh.length === 1 ? 'event' : 'events'} this week`
  : `Your week in ${mark('tech events')}`;
// Shown as the grey preview line in inbox lists
const preheader = [...fresh, ...closing, ...online].slice(0, 3).map((e) => e.title).join(', ') + (total > 3 ? ' and more' : '');
const weekOf = `Week of ${day(today)} ${mon(today)} ${today.slice(0, 4)}`;

const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Newsreader:opsz@6..72&display=swap" rel="stylesheet">
<style>
  @media (max-width: 480px) {
    .bb-pad { padding-left: 18px !important; padding-right: 18px !important; }
    .bb-thumb { display: none !important; }
    .bb-hero h1 { font-size: 34px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f1f7">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f1f7">${esc(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f1f7"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">

  <tr><td class="bb-pad" style="padding:20px 32px;border-bottom:1px solid #e4e4e7">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td><a href="${SITE}/"><img src="${SITE}/email/logo.png" width="160" alt="BuilderBee" style="display:block;width:160px;height:auto;border:0"></a></td>
      <td align="right" style="font:600 13px/1.3 ${SANS};color:#3d3d44">${esc(weekOf)}</td>
    </tr></table>
  </td></tr>

  <!-- Hero, like the site's hero lab: white, a grey honeycomb, a coloured highlight, black and white buttons, pixel bees -->
  <tr><td class="bb-hero" bgcolor="#ffffff" background="${SITE}/email/hive.png"
      style="padding:0;background:#ffffff url('${SITE}/email/hive.png') top center / 600px auto no-repeat">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="right" style="padding:14px 28px 0;line-height:0">
        <img src="${SITE}/email/bee-2.gif" width="66" alt="" style="display:inline-block;width:66px;height:auto;border:0">
      </td></tr>
      <tr><td class="bb-pad" align="center" style="padding:0 32px">
        <h1 style="margin:0;font:400 44px/1.1 ${SERIF};letter-spacing:-0.01em;color:#000">${headline}</h1>
        <p style="margin:18px auto 26px;max-width:460px;font:400 17px/1.5 ${SANS};color:#000">Hackathons, buildathons, meetups and workshops for women, non-binary people and allies in tech. Online and around the world.</p>
        ${button(`${SITE}/`, 'Browse events', '#000000', '#ffffff')}${button(`${SITE}/submit`, 'Submit an event', '#ffffff', '#000000', '#000000')}
      </td></tr>
      <tr><td align="left" style="padding:6px 0 18px 26px;line-height:0">
        <img src="${SITE}/email/bee-1.gif" width="84" alt="" style="display:inline-block;width:84px;height:auto;border:0">
      </td></tr>
    </table>
  </td></tr>

  ${section('New this week', '#a3ffb8', 'Just added to the calendar', fresh)}
  ${section('Closing soon', '#ffe3cc', 'Last chance to register', closing, (e) => `Register by ${short(e.deadline!)}`)}
  ${section('Online', '#f3e9ff', 'Join from anywhere in the next two weeks', online)}

  <tr><td class="bb-pad" style="padding:36px 32px 32px">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
      <td bgcolor="#a3ffb8" style="border-radius:20px;padding:24px">
        <h2 style="margin:0 0 6px;font:400 24px/1.2 ${SERIF};color:#000">Know an event we’re missing?</h2>
        <p style="margin:0 0 16px;font:400 15px/1.5 ${SANS};color:#000">Hackathons, workshops, meetups: if it welcomes women and non-binary builders, we’d love to list it.</p>
        ${button(`${SITE}/submit`, 'Submit an event', '#000000', '#ffffff')}
      </td></tr></table>
  </td></tr>

  <tr><td class="bb-pad" style="padding:0 32px 32px;font:400 12px/1.6 ${SANS};color:#55555e">
    You’re getting this because you signed up at <a href="${SITE}/" style="color:#55555e">builderbee.club</a>. We never sell your data or give it to anyone else.
    Prefer your calendar? <a href="${SITE}/subscribe#calendar" style="color:#55555e">Subscribe there</a>.<br>
    <a href="{{ unsubscribe }}" style="color:#55555e">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:#55555e">Privacy policy</a> · Questions? Just reply.
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
const listId = Number((process.env.BREVO_LIST_ID ?? '').replace(/\D/g, ''));   // "#2" or "2"
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
