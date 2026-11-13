import { ArrowRightIcon, ArrowUpIcon } from '@heroicons/react/20/solid';
import { useState, type ReactNode } from 'react';
import type { EventGroup } from '../../lib/dates';
import { EventCard } from '../EventCard/EventCard';
import './EventList.css';

interface EventListProps {
  groups: EventGroup[];
  now: number;
  /** Extra content under a row's heading, by group key */
  notes?: Record<string, ReactNode>;
}

const ROW = 4; // one row of four cards per category until "See all" is pressed

/** Category rows: four cards each, with "See all" to show the rest of that category. */
export function EventList({ groups, now, notes = {} }: EventListProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="event-list">
      {groups.map((group) => {
        const headingId = `group-${group.key}`;
        const listId = `group-list-${group.key}`;
        const expanded = !!open[group.key];
        const shown = expanded ? group.events : group.events.slice(0, ROW);
        const more = group.events.length > ROW;
        return (
          <section key={group.key} className="event-row" aria-labelledby={headingId}>
            <div className="event-row__head">
              <h3 id={headingId} className="event-row__title">
                {group.label}
                <span className="event-row__count">
                  <span className="visually-hidden">, </span>
                  {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                </span>
              </h3>
              {more && (
                <button
                  type="button"
                  className="event-row__toggle hive-hover hive-hover--on-light"
                  aria-expanded={expanded}
                  aria-controls={listId}
                  onClick={() => setOpen((o) => ({ ...o, [group.key]: !expanded }))}
                >
                  {expanded ? 'Show fewer' : `Show all ${group.events.length}`}
                  <span className="visually-hidden"> {group.label.toLowerCase()}</span>
                  {expanded ? <ArrowUpIcon className="icon" aria-hidden="true" /> : <ArrowRightIcon className="icon" aria-hidden="true" />}
                </button>
              )}
            </div>
            {notes[group.key] && <div className="event-row__note">{notes[group.key]}</div>}
            <ul id={listId} className={`event-row__items${expanded ? ' is-expanded' : ''}`}>
              {shown.map((event) => (
                <li key={event.id}><EventCard event={event} now={now} headingLevel={4} /></li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
