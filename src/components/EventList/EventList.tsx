import type { CalendarEvent } from '../../types/event';
import { groupByMonth, formatRange } from '../../lib/dates';
import { MonthHeader } from '../MonthHeader/MonthHeader';
import './EventList.css';

interface EventListProps {
  events: CalendarEvent[];
}

export function EventList({ events }: EventListProps) {
  const groups = groupByMonth(events);
  return (
    <div className="event-list">
      {groups.map((group) => (
        <section key={group.key} className="event-list__month" aria-labelledby={`month-${group.key}`}>
          <MonthHeader id={`month-${group.key}`} label={group.label} count={group.events.length} />
          <ul className="event-list__items">
            {group.events.map((event) => (
              // Temporary row. Replaced by <EventCard> in step 3.
              <li key={event.id} className="event-list__row">
                <h3>{event.title}</h3>
                <p>
                  <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time>
                  {' · '}
                  {event.format === 'Online' ? 'Online' : `${event.city}, ${event.country}`}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
