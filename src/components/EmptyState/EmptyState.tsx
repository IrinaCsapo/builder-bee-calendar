import './EmptyState.css';

interface EmptyStateProps {
  onClear?: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <p className="empty-state__icon" aria-hidden="true">🐝</p>
      <h2 className="empty-state__title">No events match.</h2>
      <p>
        Try{' '}
        {onClear ? (
          <button type="button" className="link-button" onClick={onClear}>clearing a filter</button>
        ) : (
          'clearing a filter'
        )}
        , or <a href="#/submit">submit one you know about</a>.
      </p>
    </div>
  );
}
