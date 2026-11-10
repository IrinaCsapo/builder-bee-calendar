import { useState } from 'react';
import type { CalendarEvent } from '../../types/event';
import { downloadIcs } from '../../lib/ics';
import './AddToCalendar.css';

export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const [message, setMessage] = useState('');

  const add = () => {
    try {
      downloadIcs(event, window.location.href);
      setMessage(`Downloaded ${event.id}.ics. Open it to add the event to your calendar.`);
    } catch {
      setMessage('Sorry, the calendar file could not be created.');
    }
    window.setTimeout(() => setMessage(''), 6000);
  };

  return (
    <div className="add-to-calendar">
      <button type="button" className="add-to-calendar__button hive-hover" onClick={add} aria-describedby="add-to-calendar-hint">
        <span aria-hidden="true">📅</span> Add to calendar
      </button>
      <p id="add-to-calendar-hint" className="add-to-calendar__hint">
        Downloads a .ics file for Apple, Google or Outlook Calendar. Added as an all-day event.
      </p>
      <p className="add-to-calendar__status" role="status">{message}</p>
    </div>
  );
}
