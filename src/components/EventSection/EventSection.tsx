import type { ReactNode } from 'react';
import type { CalendarEvent } from '../../types/event';
import { EventCard } from '../EventCard/EventCard';
import '../EventList/EventList.css';
import './EventSection.css';

interface EventSectionProps {
  id: string;
  title: string;
  /** Line under the label, e.g. where "close to you" is measured from */
  intro?: ReactNode;
  events: CalendarEvent[];
  now: number;
  empty: ReactNode;
}

/** A labelled row of event cards, e.g. "Close to you" or "Online". */
export function EventSection({ id, title, intro, events, now, empty }: EventSectionProps) {
  return (
    <section className="event-section" aria-labelledby={`${id}-title`}>
      <div className="event-section__head">
        <h2 id={`${id}-title`} className="event-section__label">{title}</h2>
        {intro && <div className="event-section__intro">{intro}</div>}
      </div>
      {events.length ? (
        <ul className="event-grid">
          {events.map((e) => <li key={e.id}><EventCard event={e} now={now} /></li>)}
        </ul>
      ) : (
        <p className="event-section__empty">{empty}</p>
      )}
    </section>
  );
}
