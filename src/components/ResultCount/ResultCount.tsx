import './ResultCount.css';

interface ResultCountProps {
  id?: string;
  count: number;
}

/** role="status" is a polite live region: screen readers announce each new count. */
export function ResultCount({ id, count }: ResultCountProps) {
  return (
    <p id={id} className="result-count" role="status" tabIndex={-1}>
      <strong>{count}</strong> {count === 1 ? 'event' : 'events'}
    </p>
  );
}
