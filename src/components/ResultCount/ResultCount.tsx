import './ResultCount.css';

interface ResultCountProps {
  count: number;
}

/** role="status" is a polite live region: screen readers announce each new count. */
export function ResultCount({ count }: ResultCountProps) {
  return (
    <p className="result-count" role="status">
      <strong>{count}</strong> {count === 1 ? 'event' : 'events'}
    </p>
  );
}
