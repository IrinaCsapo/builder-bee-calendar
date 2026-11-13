import { useNow } from '../../lib/timeLeft';
import './Today.css';

/** Today's date and the time where the visitor is, so deadlines are easy to work out. */
export function Today() {
  const now = new Date(useNow(15_000));
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  // In the visitor's own 12/24-hour habit
  const time = `${now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} your time`;
  return (
    <p className="today">
      <span className="visually-hidden">Today is </span>
      <time dateTime={now.toISOString()}>{date}<span aria-hidden="true"> · </span><span className="visually-hidden">, </span>{time}</time>
    </p>
  );
}
