import type { CalendarEvent } from '../../types/event';
import { formatRange, formatDay, formatShortMonth } from '../../lib/dates';
import { timeLeft } from '../../lib/timeLeft';
import { EventImage } from '../EventImage/EventImage';
import './EventCard.css';

interface EventCardProps {
  event: CalendarEvent;
  now: number;
  /** h3 in the Close to you / Online rows, h4 under a month or place heading */
  headingLevel?: 3 | 4;
}

const FORMAT_ICON = { Online: '🖥', 'In person': '👥', Hybrid: '🔀' } as const;

/** Short visible date ("14–15 Nov"); screen readers get the full range. */
function shortDate(e: CalendarEvent) {
  const sameMonth = e.start_date.slice(0, 7) === e.end_date.slice(0, 7);
  if (e.start_date === e.end_date) return `${formatDay(e.start_date)} ${formatShortMonth(e.start_date)}`;
  if (sameMonth) return `${formatDay(e.start_date)}–${formatDay(e.end_date)} ${formatShortMonth(e.start_date)}`;
  return `${formatDay(e.start_date)} ${formatShortMonth(e.start_date)} – ${formatDay(e.end_date)} ${formatShortMonth(e.end_date)}`;
}

export function EventCard({ event, now, headingLevel = 3 }: EventCardProps) {
  const Title = headingLevel === 4 ? 'h4' : 'h3';
  const left = timeLeft(event, now);
  // In-person and hybrid events get their own location chip
  const where = event.format === 'Online' ? '' : [event.city, event.country].filter(Boolean).join(', ');

  return (
    <article className="event-card">
      <EventImage id={event.id} title={event.title} src={event.image_url} />

      <ul className="event-card__badges" aria-label="Status">
        <li className={`event-card__badge event-card__badge--time${left.urgent ? ' is-urgent' : ''}`}>
          <span aria-hidden="true">⏳</span> {left.label}
        </li>
        <li className="event-card__badge">{event.level}</li>
        <li className="event-card__badge">{event.cost}</li>
      </ul>

      <Title className="event-card__title">
        {/* The link covers the whole card (see ::after in CSS) */}
        <a className="event-card__link" href={`#/event/${event.id}`}>{event.title}</a>
      </Title>

      <ul className="event-card__chips" aria-label="Details">
        <li className="event-card__chip">
          <span aria-hidden="true">📅</span>
          <span aria-hidden="true">{shortDate(event)}</span>
          <span className="visually-hidden">{formatRange(event.start_date, event.end_date)}</span>
        </li>
        <li className="event-card__chip">
          <span aria-hidden="true">{FORMAT_ICON[event.format]}</span>
          {event.format}
        </li>
        {where && (
          <li className="event-card__chip">
            <span aria-hidden="true">📍</span>
            {where}
          </li>
        )}
        <li className="event-card__chip">{event.event_type}</li>
      </ul>
    </article>
  );
}
