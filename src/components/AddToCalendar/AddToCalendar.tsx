import { useState } from 'react';
import type { CalendarEvent } from '../../types/event';
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from '../../lib/ics';
import './AddToCalendar.css';

/**
 * Add one event to your calendar. Google and Outlook open their own "new event" screen already filled
 * in (one click on Save, no file). Apple Calendar has no such link, so it gets the .ics file, which on an
 * iPhone or Mac opens straight into the Calendar app.
 */
export function AddToCalendar({ event }: { event: CalendarEvent }) {
  const [message, setMessage] = useState('');
  const pageUrl = window.location.origin + window.location.pathname;

  const download = () => {
    try {
      downloadIcs(event, pageUrl);
      setMessage('Opening it in your calendar app. If nothing happens, open the downloaded file.');
    } catch {
      setMessage('Sorry, the calendar file could not be created.');
    }
    window.setTimeout(() => setMessage(''), 6000);
  };

  const opens = <span className="visually-hidden"> (opens in a new tab)</span>;
  return (
    <div className="add-to-calendar">
      <p className="add-to-calendar__label" id="add-to-calendar-label">Add to your calendar</p>
      <ul className="add-to-calendar__options" aria-labelledby="add-to-calendar-label">
        <li>
          <a className="add-to-calendar__option" href={googleCalendarUrl(event, pageUrl)} target="_blank" rel="noopener noreferrer">
            Google{opens}
          </a>
        </li>
        <li>
          <a className="add-to-calendar__option" href={outlookCalendarUrl(event, pageUrl)} target="_blank" rel="noopener noreferrer">
            Outlook{opens}
          </a>
        </li>
        <li>
          <button type="button" className="add-to-calendar__option" onClick={download}>
            Apple
          </button>
        </li>
        <li>
          <a className="add-to-calendar__option" href={outlookCalendarUrl(event, pageUrl, true)} target="_blank" rel="noopener noreferrer">
            Microsoft 365<span className="visually-hidden"> (work or school Outlook, opens in a new tab)</span>
          </a>
        </li>
      </ul>
      <p className="add-to-calendar__hint">
        Added as an all-day event. Other apps: use Apple, it downloads a calendar file.
        Want every event? <a href="/subscribe#calendar">Subscribe to the calendar</a>.
      </p>
      <p className="add-to-calendar__status" role="status">{message}</p>
    </div>
  );
}
