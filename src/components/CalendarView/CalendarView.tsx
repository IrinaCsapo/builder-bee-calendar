import type { CalendarEvent } from '../../types/event';
import { addMonths, buildMonth, countInMonth } from '../../lib/calendar';
import { formatFull, formatMonth, todayISO } from '../../lib/dates';
import './CalendarView.css';

interface CalendarViewProps {
  month: string;                 // "2026-11"
  minMonth: string;
  maxMonth: string;
  events: CalendarEvent[];       // already filtered
  onMonthChange: (month: string) => void;
}

const WEEKDAYS = [
  ['Mon', 'Monday'], ['Tue', 'Tuesday'], ['Wed', 'Wednesday'], ['Thu', 'Thursday'],
  ['Fri', 'Friday'], ['Sat', 'Saturday'], ['Sun', 'Sunday'],
] as const;

export function CalendarView({ month, minMonth, maxMonth, events, onMonthChange }: CalendarViewProps) {
  const weeks = buildMonth(month, events);
  const label = formatMonth(`${month}-01`);
  const count = countInMonth(month, events);
  const today = todayISO();
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const daysWithEvents = weeks.flat().filter((d) => d && d.events.length) as NonNullable<(typeof weeks)[0][0]>[];

  return (
    <section className="calendar" aria-labelledby="calendar-title">
      <div className="calendar__nav">
        <button
          type="button"
          className="calendar__arrow"
          onClick={() => onMonthChange(prev)}
          disabled={month <= minMonth}
        >
          <span aria-hidden="true">←</span>
          <span className="visually-hidden">Previous month, {formatMonth(`${prev}-01`)}</span>
        </button>
        <h2 id="calendar-title" className="calendar__title" aria-live="polite">
          {label}
          <span className="calendar__count">
            <span className="visually-hidden">, </span>
            {count} {count === 1 ? 'event' : 'events'}
          </span>
        </h2>
        <button
          type="button"
          className="calendar__arrow"
          onClick={() => onMonthChange(next)}
          disabled={month >= maxMonth}
        >
          <span aria-hidden="true">→</span>
          <span className="visually-hidden">Next month, {formatMonth(`${next}-01`)}</span>
        </button>
      </div>

      {/* Tablet and up: a real table, so screen readers announce day and date per cell */}
      <table className="calendar__grid">
        <caption className="visually-hidden">{label}. Events by day, weeks start on Monday.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map(([short, full]) => (
              <th key={short} scope="col"><abbr title={full}>{short}</abbr></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((day, j) =>
                day ? (
                  <td key={day.iso} className={`calendar__day${day.iso === today ? ' is-today' : ''}${day.iso < today ? ' is-past' : ''}`}>
                    <span className="calendar__date">
                      <span aria-hidden="true">{day.day}</span>
                      <span className="visually-hidden">{formatFull(day.iso)}</span>
                      {day.iso === today && <span className="calendar__today">Today</span>}
                    </span>
                    {day.events.length > 0 && (
                      <ul className="calendar__events">
                        {day.events.map((e) => (
                          <li key={e.id}>
                            <a className="calendar__event" href={`#/event/${e.id}`} title={e.title}>{e.title}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                ) : (
                  <td key={`empty-${j}`} className="calendar__day is-empty" aria-hidden="true" />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones: the same month as a list of days that have events */}
      <div className="calendar__agenda">
        {daysWithEvents.length === 0 ? (
          <p className="calendar__none">No events this month. Try the next month, or clear a filter.</p>
        ) : (
          <ol className="calendar__agenda-days">
            {daysWithEvents.map((day) => (
              <li key={day.iso} className={`calendar__agenda-day${day.iso === today ? ' is-today' : ''}`}>
                <h3 className="calendar__agenda-date">
                  {formatFull(day.iso)}
                  {day.iso === today && <span className="calendar__today">Today</span>}
                </h3>
                <ul className="calendar__agenda-events">
                  {day.events.map((e) => (
                    <li key={e.id}>
                      <a href={`#/event/${e.id}`}>{e.title}</a>
                      <span className="calendar__agenda-meta">
                        {e.event_type} · {e.format === 'Online' ? 'Online' : e.city}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
