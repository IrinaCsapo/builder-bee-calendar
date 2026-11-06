import { formatDay, formatShortMonth, formatRange } from '../../lib/dates';
import './DateBlock.css';

interface DateBlockProps {
  start: string;
  end: string;
}

/**
 * Big day + short month on screen ("14–15 / NOV").
 * Screen readers get the full range instead ("14 November 2026 to 15 November 2026").
 */
export function DateBlock({ start, end }: DateBlockProps) {
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  const multiDay = start !== end;
  const day = multiDay && sameMonth ? `${formatDay(start)}–${formatDay(end)}` : formatDay(start);

  return (
    <time className="date-block" dateTime={start}>
      <span aria-hidden="true" className="date-block__day">{day}</span>
      <span aria-hidden="true" className="date-block__month">{formatShortMonth(start)}</span>
      <span className="visually-hidden">{formatRange(start, end)}</span>
    </time>
  );
}
