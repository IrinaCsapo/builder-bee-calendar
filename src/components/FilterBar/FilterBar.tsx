import { EVENT_TYPES, FORMATS, REGIONS, THEMES } from '../../types/event';
import type { EventType, Region, Theme } from '../../types/event';
import type { Filters } from '../../lib/filters';
import { hasActiveFilters, toggleInList } from '../../lib/filters';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import { Select } from '../Select/Select';
import { ResultCount } from '../ResultCount/ResultCount';
import './FilterBar.css';

interface FilterBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  resultCount: number;
  /** Countries that have upcoming events, keyed by region, for the country dropdown */
  countriesByRegion: Record<string, string[]>;
}

export function FilterBar({ filters, onChange, onClear, resultCount, countriesByRegion }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  // Country list narrows to the chosen region.
  const countries = filters.region
    ? countriesByRegion[filters.region] ?? []
    : [...new Set(Object.values(countriesByRegion).flat())].sort();

  const setRegion = (region: string) => {
    const keepCountry = !region || (countriesByRegion[region] ?? []).includes(filters.country);
    set({ region: region as Region | '', country: keepCountry ? filters.country : '' });
  };

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

      <div className="filter-bar__selects">
        <Select id="filter-type" label="Type" allLabel="All types" options={EVENT_TYPES}
          value={filters.type} onChange={(v) => set({ type: v as EventType | '' })} />
        <Select id="filter-region" label="Region" allLabel="All regions" options={REGIONS}
          value={filters.region} onChange={setRegion} />
        <Select id="filter-country" label="Country" allLabel="All countries" options={countries}
          value={filters.country} onChange={(v) => set({ country: v })} />
        <Select id="filter-theme" label="Theme" allLabel="All themes" options={THEMES}
          value={filters.theme} onChange={(v) => set({ theme: v as Theme | '' })} />
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
