import { ArrowLeftIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { allEvents } from '../lib/events';
import { formatFull, formatRange, todayISO } from '../lib/dates';
import { getListHash } from '../lib/useHashRoute';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { Badge } from '../components/Badge/Badge';
import { Chip } from '../components/Chip/Chip';
import { DateBlock } from '../components/DateBlock/DateBlock';
import { EventImage } from '../components/EventImage/EventImage';
import { DetailList } from '../components/DetailList/DetailList';
import { ShareLink } from '../components/ShareLink/ShareLink';
import { AddToCalendar } from '../components/AddToCalendar/AddToCalendar';
import { NotFoundPage } from './NotFoundPage';
import './EventPage.css';

export function EventPage({ id }: { id: string }) {
  const event = allEvents.find((e) => e.id === id);
  useDocumentTitle(event?.title ?? 'Event not found');
  if (!event) return <NotFoundPage message="We couldn't find that event. It may have been removed or renamed." />;

  const today = todayISO();
  const hasEnded = event.end_date < today;
  const deadlinePassed = !!event.deadline && event.deadline < today;
  const location =
    event.format === 'Online'
      ? 'Online'
      : [event.venue, event.city, event.country].filter(Boolean).join(', ');

  return (
    <article className="event-page container">
      <p className="event-page__back">
        <a href={getListHash()}><ArrowLeftIcon className="icon" aria-hidden="true" /> Back to all events</a>
      </p>

      {hasEnded && (
        <p className="event-page__notice" role="note">
          <strong>This event has ended.</strong> It stays here so shared links keep working.
        </p>
      )}

      <header className="event-page__header">
        <DateBlock start={event.start_date} end={event.end_date} />
        <div>
          <h1 className="event-page__title">{event.title}</h1>
          <p className="event-page__organiser">
            <span className="visually-hidden">Organised by </span>{event.organiser}
          </p>
          <ul className="event-page__tags" aria-label="Highlights">
            <li><Chip label="Format">{event.format}</Chip></li>
            <li><Chip label="Type">{event.event_type}</Chip></li>
            {event.cost === 'Free' && <li><Badge>Free</Badge></li>}
            {event.level === 'Beginner friendly' && <li><Badge variant="plum">Beginner friendly</Badge></li>}
          </ul>
        </div>
      </header>

      <div className="event-page__layout">
        {/* The event's own picture, shown whole at a size that stays sharp (beside the details on desktop) */}
        {event.image_url && (
          <div className="event-page__media">
            <EventImage id={event.id} title={event.title} src={event.image_url} />
          </div>
        )}
        <aside className="event-page__actions" aria-label="Register and share">
          <a
            className="event-page__register hive-hover"
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register
             <ArrowUpRightIcon className="icon" aria-hidden="true" />
            <span className="visually-hidden"> for {event.title} on the organiser’s site (opens in a new tab)</span>
          </a>
          <p className="event-page__register-note">
            Registration happens on the organiser’s site.
          </p>
          {!hasEnded && <AddToCalendar event={event} />}
          <ShareLink title={event.title} />
        </aside>

        <section aria-labelledby="details-heading" className="event-page__details">
          <h2 id="details-heading" className="event-page__h2">Event details</h2>
          <DetailList
            items={[
              { term: 'When', value: <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time> },
              { term: 'Timezone', value: event.timezone.replace(/_/g, ' ') },
              { term: 'Where', value: location },
              { term: 'Region', value: event.region },
              { term: 'Format', value: event.format },
              { term: 'Type', value: event.event_type },
              {
                term: 'Themes',
                value: event.themes.length ? (
                  <ul className="event-page__themes">
                    {event.themes.map((t) => <li key={t}><Chip>{t}</Chip></li>)}
                  </ul>
                ) : '',
              },
              { term: 'Who it’s for', value: <q className="event-page__audience">{event.audience}</q> },
              { term: 'Level', value: event.level },
              { term: 'Cost', value: event.cost },
              { term: 'Prize', value: event.prize },
              {
                term: 'Apply by',
                value: event.deadline && (
                  <>
                    <time dateTime={event.deadline}>{formatFull(event.deadline)}</time>
                    {deadlinePassed && ' (deadline passed)'}
                  </>
                ),
              },
              { term: 'Organiser', value: event.organiser },
              {
                term: 'Source',
                value: event.source === 'placeholder' ? 'Placeholder data, to be confirmed' : event.source,
              },
            ]}
          />
        </section>
      </div>
    </article>
  );
}
