import { useState } from 'react';
import { CalendarDaysIcon, LinkIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { NEWSLETTER_FORM_URL } from '../lib/site';
import { NewsletterSignup } from '../components/NewsletterSignup/NewsletterSignup';
import './ContentPage.css';
import './SubscribePage.css';

// Made at build time by scripts/prerender.ts and refreshed every time the site is built (at least daily).
const FEED = 'https://builderbee.club/calendar.ics';
const WEBCAL = FEED.replace(/^https:/, 'webcal:');

const APPS = [
  { name: 'Google Calendar', href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(WEBCAL)}` },
  { name: 'Apple Calendar', href: WEBCAL, note: 'iPhone, iPad and Mac' },
  { name: 'Outlook', href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(FEED)}&name=BuilderBee` },
];

export function SubscribePage() {
  useDocumentTitle('Subscribe');
  const [copied, setCopied] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FEED);
      setCopied('Link copied.');
    } catch {
      setCopied('Couldn’t copy. Select the link above and copy it instead.');
    }
    window.setTimeout(() => setCopied(''), 5000);
  };

  return (
    <div className="container content-page">
      <h1>Never miss an event</h1>
      <p className="content-page__lede">
        {NEWSLETTER_FORM_URL
          ? 'Get the latest events in your inbox every Monday, or have them appear in your own calendar.'
          : 'Subscribe once and BuilderBee’s events show up in your own calendar, next to everything else. New events appear on their own.'}
      </p>

      <NewsletterSignup heading="The weekly email" />

      <h2 id="calendar">{NEWSLETTER_FORM_URL ? 'Or add every event to your calendar' : 'Add every event to your calendar'}</h2>
      <p>New events appear on their own. Choose your calendar:</p>
      <ul className="subscribe__apps">
        {APPS.map((app) => (
          <li key={app.name}>
            {/* webcal: links open the calendar app itself, so no new tab for those */}
            <a className="subscribe__app hive-hover hive-hover--on-light" href={app.href}
              {...(app.href.startsWith('webcal:') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
              <CalendarDaysIcon className="icon" aria-hidden="true" />
              <span>
                <strong>{app.name}</strong>
                {app.note && <span className="subscribe__note">{app.note}</span>}
              </span>
              {!app.href.startsWith('webcal:') && <span className="visually-hidden"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
      </ul>

      <h2>Another calendar app?</h2>
      <p>Most calendar apps can subscribe to a link (look for “Add calendar”, “From URL” or “Subscribe”). Use this one:</p>
      <div className="subscribe__link">
        <code>{FEED}</code>
        <button type="button" className="subscribe__copy hive-hover hive-hover--on-light" onClick={copy}>
          <LinkIcon className="icon" aria-hidden="true" /> Copy link
        </button>
      </div>
      <p className="content-page__small" role="status">{copied}</p>

      <h2>Good to know</h2>
      <ul>
        <li>Events are added as all-day events and don’t mark you as busy.</li>
        <li>Each one links to the organiser’s page, where you register.</li>
        <li>
          Calendar apps check for new events every few hours. Google Calendar can take up to a day to show new
          ones.
        </li>
        <li>To stop, remove or unsubscribe from the “BuilderBee” calendar in your app.</li>
        <li>Subscribing doesn’t tell us who you are: we don’t get your name, email or calendar.</li>
      </ul>
    </div>
  );
}
