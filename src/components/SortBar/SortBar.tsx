import { MapPinIcon } from '@heroicons/react/20/solid';
import type { Origin } from '../../lib/location';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import './SortBar.css';

export type LocateStatus = 'idle' | 'locating' | 'denied' | 'unavailable';

interface SortBarProps {
  nearest: boolean;
  origin: Origin | null;
  status: LocateStatus;
  onSortByDate: () => void;
  onSortNearest: () => void;
  onLocate: () => void;
}

export function SortBar({ nearest, origin, status, onSortByDate, onSortNearest, onLocate }: SortBarProps) {
  let message = '';
  if (status === 'locating') message = 'Finding your location…';
  else if (status === 'denied')
    message = 'Location access is blocked, so we can’t sort by exact distance. You can allow it in your browser’s site settings.';
  else if (status === 'unavailable') message = 'We couldn’t get your location. Try again, or sort by date.';
  else if (nearest && origin?.source === 'device') message = 'Showing the events nearest to you first.';
  else if (nearest && origin) message = `Showing events nearest to ${origin.label} first. This is a rough guess from your device’s timezone.`;

  return (
    <div className="sort-bar">
      <div className="sort-bar__row">
        <div className="sort-bar__toggles" role="group" aria-labelledby="sort-label">
          <span id="sort-label" className="sort-bar__label">Sort</span>
          <ToggleButton pressed={!nearest} onToggle={onSortByDate}>By date</ToggleButton>
          <ToggleButton pressed={nearest} onToggle={onSortNearest}>Nearest first</ToggleButton>
        </div>
        {origin?.source !== 'device' && (
          <button type="button" className="sort-bar__locate" onClick={onLocate} disabled={status === 'locating'}>
            <MapPinIcon className="icon" aria-hidden="true" /> Use my exact location
          </button>
        )}
      </div>
      <p className="sort-bar__status" role="status">{message}</p>
    </div>
  );
}
