import { useState } from 'react';
import { EVENT_TYPES, FORMATS, REGIONS, THEMES } from '../../types/event';
import type { EventType, Region, Theme } from '../../types/event';
import type { Filters } from '../../lib/filters';
import { hasActiveFilters, toggleInList } from '../../lib/filters';
import { ToggleButton } from '../ToggleButton/ToggleButton';
import { Select } from '../Select/Select';
import { SearchBox } from '../SearchBox/SearchBox';
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

  // On phones, "Show only" and the dropdowns fold away behind "More filters".
  // On wider screens the toggle button is hidden and everything is always shown.
  const moreActive = [filters.freeOnly, filters.beginnerOnly, filters.type, filters.region, filters.country, filters.theme]
    .filter(Boolean).length;
  // Start open if a shared link already uses one of the folded-away filters
  const [moreOpen, setMoreOpen] = useState(() => moreActive > 0);

  return (
    <section className="filter-bar" aria-labelledby="filter-heading">
      <h2 id="filter-heading" className="visually-hidden">Filter events</h2>

      <div className="filter-bar__search">
        <SearchBox value={filters.query} onChange={(query) => set({ query })} />
      </div>

      <fieldset className="filter-bar__group filter-bar__format">
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

      <button
        type="button"
        className="filter-bar__more"
        aria-expanded={moreOpen}
        aria-controls="more-filters"
        onClick={() => setMoreOpen(!moreOpen)}
      >
        <span aria-hidden="true" className="filter-bar__more-icon">{moreOpen ? '−' : '+'}</span>
        {moreOpen ? 'Fewer filters' : 'More filters'}
        {moreActive > 0 && <span className="filter-bar__more-count">{moreActive} on</span>}
      </button>

      <div id="more-filters" className={`filter-bar__more-panel${moreOpen ? ' is-open' : ''}`}>
        <fieldset className="filter-bar__group filter-bar__show-only">
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
