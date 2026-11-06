import { FORMATS } from '../../types/event';
import type { Filters } from '../../lib/filters';
import { hasActiveFilters, toggleInList } from '../../lib/filters';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import { ResultCount } from '../ResultCount/ResultCount';
import './FilterBar.css';

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, onClear, resultCount }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <section className="filter-bar" aria-labelledby="filter-heading">
      <h2 id="filter-heading" className="visually-hidden">Filter events</h2>

      <div className="filter-bar__rows">
        <fieldset className="filter-bar__group">
          <legend className="filter-bar__legend">Format</legend>
          <div className="filter-bar__chips">
            {FORMATS.map((format) => (
              <ToggleButton
                key={format}
                pressed={filters.formats.includes(format)}
                onToggle={() => set({ formats: toggleInList(filters.formats, format) })}
              >
                {format}
              </ToggleButton>
            ))}
          </div>
        </fieldset>

        <fieldset className="filter-bar__group">
          <legend className="filter-bar__legend">Show only</legend>
          <div className="filter-bar__chips">
            <ToggleButton pressed={filters.freeOnly} onToggle={() => set({ freeOnly: !filters.freeOnly })}>
              Free
            </ToggleButton>
            <ToggleButton pressed={filters.beginnerOnly} onToggle={() => set({ beginnerOnly: !filters.beginnerOnly })}>
              Beginner friendly
            </ToggleButton>
          </div>
        </fieldset>
      </div>

      <div className="filter-bar__footer">
        <ResultCount count={resultCount} />
        {hasActiveFilters(filters) && (
          <button type="button" className="link-button" onClick={onClear}>Clear all</button>
        )}
      </div>
    </section>
  );
}
