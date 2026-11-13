import { CalendarDaysIcon, ListBulletIcon } from '@heroicons/react/20/solid';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import './ViewSwitch.css';

export type View = 'list' | 'calendar';

interface ViewSwitchProps {
  view: View;
  onChange: (view: View) => void;
}

export function ViewSwitch({ view, onChange }: ViewSwitchProps) {
  return (
    <div className="view-switch" role="group" aria-labelledby="view-label">
      <span id="view-label" className="view-switch__label">View</span>
      <ToggleButton pressed={view === 'list'} onToggle={() => onChange('list')}>
        <ListBulletIcon className="icon" aria-hidden="true" /> List
      </ToggleButton>
      <ToggleButton pressed={view === 'calendar'} onToggle={() => onChange('calendar')}>
        <CalendarDaysIcon className="icon" aria-hidden="true" /> Calendar
      </ToggleButton>
    </div>
  );
}
