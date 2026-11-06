import type { CalendarEvent } from '../../types/event';
import { groupByMonth } from '../../lib/dates';
import { MonthHeader } from '../MonthHeader/MonthHeader';
import { EventCard } from '../EventCard/EventCard';
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
              <li key={event.id}><EventCard event={event} /></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
