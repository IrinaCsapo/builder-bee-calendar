// Shared pieces of BuilderBee's emails (the weekly email and the welcome email): fonts, pills, buttons,
// and the event card with its black date tile. Tables and inline styles, so they hold up in Gmail,
// Outlook and Apple Mail.

import type { CalendarEvent } from '../src/types/event';

export const SITE = 'https://builderbee.club';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const day = (d: string) => Number(d.slice(8, 10));
export const mon = (d: string) => MONTHS[Number(d.slice(5, 7)) - 1];
export const short = (d: string) => `${day(d)} ${mon(d)}`;
export const where = (e: CalendarEvent) =>
  e.format === 'Online' ? 'Online' : [e.city, e.country].filter(Boolean).join(', ') + (e.format === 'Hybrid' ? ' + online' : '');

export const SANS = `'DM Sans',Helvetica,Arial,sans-serif`;
export const SERIF = `'Newsreader',Georgia,'Times New Roman',serif`;
export const pill = (text: string, bg: string, border = bg, color = '#000') =>
  `<span style="display:inline-block;margin:6px 6px 0 0;padding:3px 10px;border:1px solid ${border};border-radius:999px;background:${bg};color:${color};font:600 12px/1.4 ${SANS};white-space:nowrap">${esc(text)}</span>`;
export const button = (href: string, label: string, bg: string, color: string, border = bg) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-table;margin:0 8px 8px 0"><tr>
    <td bgcolor="${bg}" style="border-radius:999px;border:1.5px solid ${border}">
      <a href="${href}" style="display:inline-block;padding:12px 22px;font:700 15px/1 ${SANS};color:${color};text-decoration:none;border-radius:999px">${esc(label)}</a>
    </td></tr></table>`;

/** Black tile like the site's: day in white, month in mint */
/**
 * Black tile like the site's: day in white, month in mint. On phones the event's picture sits under the
 * tile (bb-mthumb, shown by the media query), so the title keeps the full width.
 */
export function dateTile(e: CalendarEvent): string {
  const sameMonth = e.start_date.slice(0, 7) === e.end_date.slice(0, 7);
  const days = e.start_date === e.end_date ? `${day(e.start_date)}` : sameMonth ? `${day(e.start_date)}–${day(e.end_date)}` : `${day(e.start_date)}`;
  const long = days.length > 3;
  const phonePic = e.image_url
    ? `<div class="bb-mthumb" style="display:none;max-height:0;overflow:hidden;mso-hide:all">
        <a href="${SITE}/event/${e.id}"><img src="${esc(e.image_url)}" width="56" alt="" style="display:block;width:56px;height:auto;margin-top:10px;border-radius:10px;border:0"></a>
      </div>`
    : '';
  return `<td class="bb-date" width="64" valign="top" style="padding:0 14px 0 0">
    <table role="presentation" class="bb-tile" width="64" cellspacing="0" cellpadding="0"><tr>
      <td bgcolor="#000000" align="center" style="border-radius:14px;padding:10px 4px">
        <div class="${long ? 'bb-day-long' : 'bb-day'}" style="font:800 ${long ? 17 : 24}px/1.1 ${SANS};color:#ffffff;white-space:nowrap">${days}</div>
        <div class="bb-mon" style="margin-top:4px;font:700 12px/1 ${SANS};letter-spacing:0.08em;text-transform:uppercase;color:#a3ffb8">${mon(e.start_date)}</div>
      </td></tr></table>
    ${phonePic}
  </td>`;
}

export function card(e: CalendarEvent, note = ''): string {
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


/** Phone tweaks for the event cards: goes in each email's <style> */
export const CARD_CSS = `
  @media (max-width: 480px) {
    .bb-pad { padding-left: 18px !important; padding-right: 18px !important; }
    .bb-thumb { display: none !important; }
    /* Phones: a slightly smaller date tile, with the event's picture under it */
    .bb-date { width: 56px !important; padding-right: 12px !important; }
    .bb-tile { width: 56px !important; }
    .bb-day { font-size: 20px !important; }
    .bb-day-long { font-size: 15px !important; }
    .bb-mon { font-size: 11px !important; }
    .bb-mthumb { display: block !important; max-height: none !important; overflow: visible !important; }
  }
`;
