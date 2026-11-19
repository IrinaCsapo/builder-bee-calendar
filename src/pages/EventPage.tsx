import type { ComponentType, ReactNode, SVGProps } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, TicketIcon } from '@heroicons/react/20/solid';
import {
  AcademicCapIcon, CalendarIcon, ClockIcon as ClockOutline, GlobeAltIcon, MapPinIcon as MapPinOutline,
  SparklesIcon, TicketIcon as TicketOutline, TrophyIcon, UserGroupIcon,
} from '@heroicons/react/24/outline';
import { allEvents } from '../lib/events';
import { formatFull, formatRange, todayISO } from '../lib/dates';
import { getListHref } from '../lib/router';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { timeLeft, useNow } from '../lib/timeLeft';
import { similarEvents } from '../lib/similar';
import { EventImage } from '../components/EventImage/EventImage';
import { EventCard } from '../components/EventCard/EventCard';
import { ShareLink } from '../components/ShareLink/ShareLink';
import { AddToCalendar } from '../components/AddToCalendar/AddToCalendar';
import { NewsletterSignup } from '../components/NewsletterSignup/NewsletterSignup';
import { NotFoundPage } from './NotFoundPage';
import '../components/EventList/EventList.css';
import './EventPage.css';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

// One hero-lab colour per type of event, for the header's top edge and the "Good to know" icons
const TYPE_COLOURS: Record<string, string> = {
  Hackathon: '#7B00DA', Buildathon: '#0006FA', Workshop: '#FF6600', Bootcamp: '#21B700',
  Meetup: '#FE06E5', Conference: '#009BE9', 'Pitch night': '#7B00DA',
};

/** One "Good to know" card. Rendered only when it has something to say. */
function Fact({ icon: Icon, term, children }: { icon: Icon; term: string; children: ReactNode }) {
  if (children === undefined || children === null || children === '' || children === false) return null;
  return (
    <div className="event-fact">
      <Icon className="event-fact__icon" aria-hidden="true" />
      <dt>{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function EventPage({ id }: { id: string }) {
  const event = allEvents.find((e) => e.id === id);
  useDocumentTitle(event?.title ?? 'Event not found');
  const now = useNow();
  if (!event) return <NotFoundPage message="We couldn't find that event. It may have been removed or renamed." />;

  const today = todayISO();
  const hasEnded = event.end_date < today;
  const deadlinePassed = !!event.deadline && event.deadline < today;
  const left = timeLeft(event, now);
  const open = left.label.startsWith('Registration ends');
  const place = event.format === 'Online'
    ? 'Online'
    : [event.city, event.country].filter(Boolean).join(', ') + (event.format === 'Hybrid' ? ' and online' : '');
  // "Where": the venue's name on its own line (not the whole street address), then the city and country
  const venueName = event.venue?.split(',')[0].trim();
  const cityCountry = [event.city, event.country].filter(Boolean).join(', ');
  const venueLine = event.format === 'Online' ? 'Online' : venueName || cityCountry;
  const whereSub = event.format === 'Online'
    ? 'Join from anywhere'
    : [venueName ? cityCountry : '', event.format === 'Hybrid' ? 'In person and online' : 'In person'].filter(Boolean).join(' · ');
  const colour = TYPE_COLOURS[event.event_type] ?? '#7B00DA';
  const similar = similarEvents(event, allEvents);

  return (
    <article className="event-page container" style={{ ['--event' as string]: colour }}>
      <p className="event-page__back">
        <a href={getListHref()}><ArrowLeftIcon className="icon" aria-hidden="true" /> Back to all events</a>
      </p>

      {hasEnded && (
        <p className="event-page__notice" role="note">
          <strong>This event has ended.</strong> It stays here so shared links keep working.{' '}
          {similar.length > 0 && <a href="#more-like-this">See similar events coming up</a>}
        </p>
      )}

      {/* ---- Header: what, when, where, and the Register button ---- */}
      <header className="event-hero">
        <div className="event-hero__text">
          <ul className="event-hero__tags" aria-label="Highlights">
            <li className="event-hero__tag event-hero__tag--type">{event.event_type}</li>
            <li className="event-hero__tag">{event.format}</li>
            <li className={`event-hero__tag event-hero__tag--${event.cost === 'Free' ? 'free' : 'paid'}`}>{event.cost}</li>
            {event.level === 'Beginner friendly' && <li className="event-hero__tag">Beginner friendly</li>}
          </ul>
          <h1 className="event-hero__title">{event.title}</h1>
          <p className="event-hero__organiser"><span className="visually-hidden">Organised by </span>by {event.organiser}</p>

          <ul className="event-hero__facts" aria-label="Key facts">
            <li>
              <CalendarDaysIcon className="icon" aria-hidden="true" />
              <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time>
            </li>
            <li><MapPinIcon className="icon" aria-hidden="true" />{place}</li>
            <li><TicketIcon className="icon" aria-hidden="true" />{event.cost}</li>
          </ul>

          <div className="event-hero__cta">
            <a className="event-hero__register hive-hover" href={event.registration_url} target="_blank" rel="noopener noreferrer">
              {hasEnded ? 'See the organiser’s page' : 'Register'}
              <ArrowUpRightIcon className="icon" aria-hidden="true" />
              <span className="visually-hidden"> for {event.title} on the organiser’s site (opens in a new tab)</span>
            </a>
            {!hasEnded && (
              <p className={`event-hero__countdown${left.urgent ? ' is-urgent' : ''}${open ? '' : ' is-closed'}`}>
                <ClockIcon className="icon" aria-hidden="true" />{left.label}
              </p>
            )}
          </div>
          <p className="event-hero__note">You register on the organiser’s site. BuilderBee is free and never asks for your details.</p>
        </div>

        <div className="event-hero__media">
          <EventImage id={event.id} title={event.title} src={event.image_url} />
        </div>
      </header>

      {/* ---- Details and the side panel ---- */}
      <div className="event-page__layout">
        <section aria-labelledby="details-heading" className="event-page__details">
          <h2 id="details-heading" className="event-page__h2">Good to know</h2>
          <figure className="event-page__for">
            <UserGroupIcon className="event-fact__icon" aria-hidden="true" />
            <figcaption>Who it’s for</figcaption>
            <blockquote><p>“{event.audience}”</p></blockquote>
          </figure>
          <dl className="event-facts">
            <Fact icon={CalendarIcon} term="When">
              <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time>
              <span className="event-fact__sub">{event.timezone.replace(/_/g, ' ')} time</span>
            </Fact>
            <Fact icon={MapPinOutline} term="Where">
              {venueLine}
              <span className="event-fact__sub">{whereSub}</span>
            </Fact>
            <Fact icon={ClockOutline} term="Apply by">
              {event.deadline && (
                <>
                  <time dateTime={event.deadline}>{formatFull(event.deadline)}</time>
                  {deadlinePassed && <span className="event-fact__sub">Deadline passed</span>}
                </>
              )}
            </Fact>
            <Fact icon={TicketOutline} term="Cost">{event.cost}</Fact>
            <Fact icon={AcademicCapIcon} term="Level">{event.level}</Fact>
            <Fact icon={TrophyIcon} term="Prize">{event.prize}</Fact>
            <Fact icon={SparklesIcon} term="Themes">{event.themes.length ? event.themes.join(', ') : ''}</Fact>
          </dl>
          {event.source !== 'placeholder' && (
            <p className="event-page__source">
              <GlobeAltIcon className="icon" aria-hidden="true" />
              <span>
                Details checked on{' '}
                <a href={event.source} target="_blank" rel="noopener noreferrer">
                  the organiser’s page<span className="visually-hidden"> (opens in a new tab)</span>
                </a>. Dates can change, so check there before you go.
              </span>
            </p>
          )}
        </section>

        <aside className="event-page__actions" aria-label="Save and share">
          <p className="event-page__actions-title">Save it for later</p>
          {!hasEnded && <AddToCalendar event={event} />}
          <ShareLink title={event.title} />
        </aside>
      </div>

      {/* ---- More like this ---- */}
      {similar.length > 0 && (
        <section className="event-page__more" aria-labelledby="more-like-this">
          <div className="event-row__head">
            <h2 id="more-like-this" className="event-row__title">More events like this</h2>
            <a className="event-page__more-all" href="/">
              All events <ArrowRightIcon className="icon" aria-hidden="true" />
            </a>
          </div>
          <ul className="event-row__items is-expanded">
            {similar.map((e) => (
              <li key={e.id}><EventCard event={e} now={now} headingLevel={3} /></li>
            ))}
          </ul>
        </section>
      )}

      <div className="newsletter-spot">
        <NewsletterSignup heading="Never miss an event like this" />
      </div>
    </article>
  );
}
