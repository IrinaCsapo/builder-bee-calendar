import type { CalendarEvent } from '../../types/event';
import { Chip } from '../Chip/Chip';
import { Badge } from '../Badge/Badge';
import { DateBlock } from '../DateBlock/DateBlock';
import { EventImage } from '../EventImage/EventImage';
import './EventCard.css';

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  const isFree = event.cost === 'Free';
  const isBeginner = event.level === 'Beginner friendly';

  return (
    <article className="event-card">
      <EventImage src={event.image_url} type={event.event_type} />
      <div className="event-card__content">
      <DateBlock start={event.start_date} end={event.end_date} />
      <div className="event-card__body">
        <h3 className="event-card__title">
          {/* The link covers the whole card (see ::after in CSS) */}
          <a className="event-card__link" href={`#/event/${event.id}`}>{event.title}</a>
        </h3>
        <p className="event-card__organiser">
          <span className="visually-hidden">Organised by </span>{event.organiser}
        </p>
        <ul className="event-card__tags" aria-label="Details">
          <li><Chip label="Format">{event.format}</Chip></li>
          <li><Chip label="Type">{event.event_type}</Chip></li>
          {event.city && <li><Chip label="City">{event.city}</Chip></li>}
          {isFree && <li><Badge>Free</Badge></li>}
          {isBeginner && <li><Badge variant="plum">Beginner friendly</Badge></li>}
        </ul>
      </div>
      </div>
    </article>
  );
}
