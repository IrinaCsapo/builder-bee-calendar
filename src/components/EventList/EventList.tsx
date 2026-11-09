import type { EventGroup } from '../../lib/dates';
import { MonthHeader } from '../MonthHeader/MonthHeader';
import { PlaceHeader } from '../PlaceHeader/PlaceHeader';
import { EventCard } from '../EventCard/EventCard';
import './EventList.css';

interface EventListProps {
  groups: EventGroup[];
  now: number;
  /** "month" for date order, "place" for nearest-first */
  variant: 'month' | 'place';
}

export function EventList({ groups, variant, now }: EventListProps) {
  return (
    <div className="event-list">
      {groups.map((group) => {
        const headingId = `group-${group.key}`;
        return (
          <section key={group.key} className="event-list__month" aria-labelledby={headingId}>
            {variant === 'month' ? (
              <MonthHeader id={headingId} label={group.label} count={group.events.length} />
            ) : (
              <PlaceHeader id={headingId} label={group.label} detail={group.detail} count={group.events.length} />
            )}
            <ul className="event-list__items">
              {group.events.map((event) => (
                <li key={event.id}><EventCard event={event} now={now} headingLevel={4} /></li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
