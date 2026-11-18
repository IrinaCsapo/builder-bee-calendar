import { useState } from 'react';
import { ArrowRightIcon, CheckIcon, LinkIcon } from '@heroicons/react/20/solid';
import { CalendarDaysIcon, EnvelopeIcon, InboxArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { PixelBee } from '../components/PixelBee/PixelBee';
import './HowItWorksPage.css';
import './AboutPage.css';
import './SubscribedPage.css';

const SITE = 'https://builderbee.club';
const upcoming = getUpcoming(allEvents);

/** The next Monday after today, e.g. "Monday 23 November" */
function nextMonday(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() + (((8 - d.getDay()) % 7) || 7));
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

const WHAT: { colour: string; title: string; text: string }[] = [
  { colour: '#a3ffb8', title: 'New this week', text: 'Every event added to BuilderBee in the last seven days.' },
  { colour: '#ffe3cc', title: 'Closing soon', text: 'Events whose registration closes in the next two weeks, so you don’t miss the deadline.' },
  { colour: '#f3e9ff', title: 'Online', text: 'Events you can join from anywhere in the next two weeks.' },
];

/**
 * Where Brevo sends people after they click "confirm" in the confirmation email (set as the form's
 * redirect address in Brevo). Says clearly what they've signed up to and what happens next.
 */
export function SubscribedPage() {
  useDocumentTitle('You’re subscribed');
  const [copied, setCopied] = useState(false);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${SITE}/subscribe`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* clipboard blocked: the link is visible anyway */ }
  };

  return (
    <div className="container how subscribed">
      <header className="about__intro">
        <div>
          <p className="how__kicker">You’re in</p>
          <h1>You’re subscribed to the BuilderBee weekly email</h1>
          <p className="how__lede">
            Thanks for confirming! Every Monday morning you’ll get one short email with new hackathons, workshops and
            meetups for women, non-binary people and allies in tech. Your first one arrives on{' '}
            <strong>{nextMonday()}</strong>.
          </p>
        </div>
        <div className="about__bee-tile" aria-hidden="true">
          <PixelBee className="about__bee" />
        </div>
      </header>

      <section className="how__section" aria-labelledby="subscribed-what">
        <h2 id="subscribed-what">What’s in it</h2>
        <ul className="subscribed__what">
          {WHAT.map((w) => (
            <li key={w.title} style={{ ['--what' as string]: w.colour }}>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>
        <p className="subscribed__small">
          <EnvelopeIcon className="icon" aria-hidden="true" />
          <span>
            It comes from <strong>hello@builderbee.club</strong>. Add it to your contacts so it doesn’t land in spam.
            Every email has an unsubscribe link, and we never sell your data.
          </span>
        </p>
      </section>

      <section className="how__section" aria-labelledby="subscribed-next">
        <h2 id="subscribed-next">While you wait</h2>
        <ul className="subscribed__next">
          <li>
            <MagnifyingGlassIcon className="subscribed__icon" aria-hidden="true" />
            <h3>Browse what’s on now</h3>
            <p>{upcoming.length} upcoming events, online and around the world.</p>
            <a className="how__button how__button--dark hive-hover" href="/">
              Browse events <ArrowRightIcon className="icon" aria-hidden="true" />
            </a>
          </li>
          <li>
            <CalendarDaysIcon className="subscribed__icon" aria-hidden="true" />
            <h3>Put them in your calendar</h3>
            <p>Subscribe to the BuilderBee calendar in Google, Apple or Outlook too.</p>
            <a className="how__button how__button--light hive-hover hive-hover--on-light" href="/subscribe#calendar">
              Add the calendar
            </a>
          </li>
          <li>
            <InboxArrowDownIcon className="subscribed__icon" aria-hidden="true" />
            <h3>Tell a friend</h3>
            <p>Know someone who’d love this? Send them the signup link.</p>
            <button type="button" className="how__button how__button--light" onClick={share}>
              {copied ? <><CheckIcon className="icon" aria-hidden="true" /> Link copied</> : <><LinkIcon className="icon" aria-hidden="true" /> Copy the link</>}
            </button>
            <span className="visually-hidden" role="status">{copied ? 'Link copied' : ''}</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
