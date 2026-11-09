import './MonthHeader.css';

interface MonthHeaderProps {
  id: string;
  label: string;
  count: number;
}

export function MonthHeader({ id, label, count }: MonthHeaderProps) {
  return (
    <h3 id={id} className="month-header">
      {label}
      <span className="month-header__count">
        {count} {count === 1 ? 'event' : 'events'}
      </span>
    </h3>
  );
}
