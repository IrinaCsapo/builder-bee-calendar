import '../MonthHeader/MonthHeader.css';
import './PlaceHeader.css';

interface PlaceHeaderProps {
  id: string;
  label: string;   // "Manchester, United Kingdom" or "Online"
  detail?: string; // "about 260 km from London"
  count: number;
}

export function PlaceHeader({ id, label, detail, count }: PlaceHeaderProps) {
  return (
    <div className="month-header place-header">
      <h2 id={id} className="place-header__title">
        {label}
        {detail && (
          <span className="place-header__detail">
            <span className="visually-hidden">, </span>
            {detail}
          </span>
        )}
      </h2>
      <span className="month-header__count">
        {count} {count === 1 ? 'event' : 'events'}
      </span>
    </div>
  );
}
