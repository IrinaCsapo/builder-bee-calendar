// The two emails Brevo sends when someone signs up for the weekly email, in BuilderBee's style
// (same header, hero picture and buttons as the weekly email):
//
//   1. "Confirm your subscription" (double opt-in): sent straight after signing up, with the confirm button
//   2. "Welcome": sent once they've confirmed (Brevo calls it the "final confirmation email")
//
//   npx tsx scripts/brevo-templates.ts --preview   writes confirm.html and welcome.html, sends nothing
//   npx tsx scripts/brevo-templates.ts             creates or updates both templates in Brevo
//
// Then, once, in Brevo: Contacts → Forms → the weekly email form → Settings, pick these two templates and
// set the address after confirmation to https://builderbee.club/subscribed (see README).
// Needs BREVO_API_KEY (the GitHub secret; run through .github/workflows/brevo-templates.yml).

import { writeFileSync } from 'node:fs';

const SITE = 'https://builderbee.club';
const SENDER = { name: 'BuilderBee', email: 'hello@builderbee.club' };
const SANS = `'DM Sans',Helvetica,Arial,sans-serif`;
const SERIF = `'Newsreader',Georgia,'Times New Roman',serif`;

const button = (href: string, label: string, bg: string, color: string, border = bg) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-table;margin:0 8px 8px 0"><tr>
    <td bgcolor="${bg}" style="border-radius:999px;border:1.5px solid ${border}">
      <a href="${href}" style="display:inline-block;padding:14px 24px;font:700 16px/1 ${SANS};color:${color};text-decoration:none;border-radius:999px">${label}</a>
    </td></tr></table>`;

function layout(title: string, preheader: string, hero: number, body: string, footer: string) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Newsreader:opsz@6..72&display=swap" rel="stylesheet">
<style>@media (max-width: 480px) { .bb-pad { padding-left: 18px !important; padding-right: 18px !important; } }</style>
</head>
<body style="margin:0;padding:0;background:#f4f1f7">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f4f1f7">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f4f1f7"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">
  <tr><td class="bb-pad" style="padding:14px 32px 14px 22px;border-bottom:1px solid #e4e4e7">
    <a href="${SITE}/"><img src="${SITE}/email/logo-badge.png" width="140" alt="BuilderBee" style="display:block;width:140px;height:auto;border:0"></a>
  </td></tr>
  <tr><td style="padding:0;line-height:0;font-size:0">
    <img src="${SITE}/email/hero-${hero}.gif" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0">
  </td></tr>
  ${body}
  <tr><td class="bb-pad" style="padding:0 32px 32px;font:400 12px/1.6 ${SANS};color:#55555e">${footer}</td></tr>
</table></td></tr></table>
</body></html>`;
}

const p = (text: string, extra = '') => `<p style="margin:0 0 16px;font:400 17px/1.55 ${SANS};color:#000;${extra}">${text}</p>`;
const h1 = (text: string) => `<h1 style="margin:0 0 14px;font:400 34px/1.15 ${SERIF};color:#000">${text}</h1>`;

// ---- 1. Confirm (double opt-in). Brevo replaces {{ doubleoptin }} with the confirm link. ----
const CONFIRM = {
  name: 'BuilderBee: confirm the weekly email',
  subject: 'Confirm your BuilderBee weekly email',
  html: layout(
    'Confirm your BuilderBee weekly email',
    'One click and you’re in: new hackathons, workshops and meetups every Monday.',
    0,
    `<tr><td class="bb-pad" style="padding:8px 32px 12px">
      ${h1('One click and you’re in')}
      ${p('You asked to get the <strong>BuilderBee weekly email</strong>: new hackathons, workshops and meetups for women, non-binary people and allies in tech, every Monday morning.')}
      ${p('Please confirm it’s really you:')}
      ${button('{{ doubleoptin }}', 'Yes, send me the weekly email', '#7B00DA', '#ffffff')}
    </td></tr>
    <tr><td class="bb-pad" style="padding:8px 32px 28px">
      ${p('Didn’t sign up? Just ignore this email and you won’t hear from us.', 'font-size:15px;color:#3d3d44')}
    </td></tr>`,
    `You’re getting this because someone entered this address at <a href="${SITE}/" style="color:#55555e">builderbee.club</a>. We never sell your data or give it to anyone else. <a href="${SITE}/privacy" style="color:#55555e">Privacy policy</a>`,
  ),
};

// ---- 2. Welcome (after confirming) ----
const what = (colour: string, title: string, text: string) =>
  `<tr><td style="padding:0 0 10px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
    <td bgcolor="${colour}" style="border-radius:16px;padding:14px 18px">
      <p style="margin:0;font:700 16px/1.3 ${SANS};color:#000">${title}</p>
      <p style="margin:4px 0 0;font:400 15px/1.45 ${SANS};color:#000">${text}</p>
    </td></tr></table></td></tr>`;

const WELCOME = {
  name: 'BuilderBee: welcome to the weekly email',
  subject: 'Welcome to BuilderBee 🐝',
  html: layout(
    'Welcome to BuilderBee',
    'You’re subscribed. Here’s what lands in your inbox every Monday.',
    0,   // "Find your next hackathon"
    `<tr><td class="bb-pad" style="padding:8px 32px 8px">
      ${h1('You’re subscribed!')}
      ${p('Thanks for joining the <strong>BuilderBee weekly email</strong>. Every Monday morning you’ll get one short email with:')}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${what('#a3ffb8', 'New this week', 'Every event added to BuilderBee in the last seven days.')}
        ${what('#ffe3cc', 'Closing soon', 'Events whose registration closes in the next two weeks.')}
        ${what('#f3e9ff', 'Online', 'Events you can join from anywhere in the next two weeks.')}
      </table>
    </td></tr>
    <tr><td class="bb-pad" style="padding:14px 32px 8px">
      ${p('Can’t wait until Monday? Everything’s on the site already:')}
      ${button(`${SITE}/`, 'Browse events', '#000000', '#ffffff')}${button(`${SITE}/subscribe#calendar`, 'Add the calendar', '#ffffff', '#000000', '#000000')}
    </td></tr>
    <tr><td class="bb-pad" style="padding:20px 32px 28px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
        <td bgcolor="#a3ffb8" style="border-radius:20px;padding:22px">
          <h2 style="margin:0 0 6px;font:400 24px/1.2 ${SERIF};color:#000">Know an event we’re missing?</h2>
          <p style="margin:0 0 16px;font:400 15px/1.5 ${SANS};color:#000">If it welcomes women and non-binary builders, we’d love to list it. And if a friend would like this email, send them to builderbee.club/subscribe.</p>
          ${button(`${SITE}/submit`, 'Submit an event', '#000000', '#ffffff')}
        </td></tr></table>
    </td></tr>`,
    `Made by builders Irina and Tracey, for builders. Add hello@builderbee.club to your contacts so we don’t land in spam, and reply any time: we read every email. Every weekly email has an unsubscribe link. <a href="${SITE}/privacy" style="color:#55555e">Privacy policy</a>`,
  ),
};

const TEMPLATES = [{ ...CONFIRM, tag: 'optin' }, { ...WELCOME, tag: 'welcome' }];

if (process.argv.includes('--preview')) {
  writeFileSync('confirm.html', CONFIRM.html);
  writeFileSync('welcome.html', WELCOME.html);
  console.log('Wrote confirm.html and welcome.html');
  process.exit(0);
}

const key = process.env.BREVO_API_KEY;
if (!key) {
  console.error('BREVO_API_KEY must be set.');
  process.exit(1);
}

async function brevo(method: string, path: string, body?: unknown) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    headers: { 'api-key': key!, 'content-type': 'application/json', accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Brevo ${method} ${path} failed (${res.status}): ${text}`);
  return text ? JSON.parse(text) : {};
}

// Update the template with the same name if it exists, otherwise create it
const existing: { id: number; name: string }[] = (await brevo('GET', '/smtp/templates?limit=1000')).templates ?? [];
for (const t of TEMPLATES) {
  const body = { templateName: t.name, subject: t.subject, htmlContent: t.html, sender: SENDER, replyTo: SENDER.email, isActive: true, tag: t.tag };
  const found = existing.find((e) => e.name === t.name);
  if (found) {
    await brevo('PUT', `/smtp/templates/${found.id}`, body);
    console.log(`Updated "${t.name}" (template ${found.id})`);
  } else {
    const made = await brevo('POST', '/smtp/templates', body);
    console.log(`Created "${t.name}" (template ${made.id})`);
  }
}
