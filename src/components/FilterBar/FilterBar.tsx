import { useState, type ReactNode } from 'react';
import { EVENT_TYPES, FORMATS, REGIONS, THEMES } from '../../types/event';
import type { EventType, Region, Theme } from '../../types/event';
import type { Filters } from '../../lib/filters';
import { hasActiveFilters, LEVEL_FILTERS, toggleInList } from '../../lib/filters';
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
  /** Shown under the Location filter when "Near me" is on: which place we're using, and a way to be exact */
  locationNote?: ReactNode;
}

export function FilterBar({ filters, onChange, onClear, resultCount, countriesByRegion, locationNote }: FilterBarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  // Country list narrows to the chosen region.
  const countries = filters.region
    ? countriesByRegion[filters.region] ?? []
    : [...new Set(Object.values(countriesByRegion).flat())].sort();

  const setRegion = (region: string) => {
    const keepCountry = !region || (countriesByRegion[region] ?? []).includes(filters.country);
    set({ region: region as Region | '', country: keepCountry ? filters.country : '' });
  };

  // Only the most-used filters are always visible. Everything else is behind
  // "More filters", on every screen size, so the bar stays calm.
  const moreActive = [filters.near, filters.type, filters.region, filters.country, filters.theme].filter(Boolean).length;
  // Start open if a shared link already uses one of the folded-away filters
  const [moreOpen, setMoreOpen] = useState(() => moreActive > 0);
  // (On phones a shared link with only Format/Free/Level shows the count badge on the closed button.)

  // Format, Free and Level. Wide screens show them in the bar; phones keep them inside "More filters"
  // (the same buttons, rendered in both places; CSS shows one).
  const quick = (
    <>
      <fieldset className="filter-bar__group">
        <legend className="visually-hidden">Format</legend>
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
          <span className="filter-bar__divider" aria-hidden="true" />
          <ToggleButton pressed={filters.freeOnly} onToggle={() => set({ freeOnly: !filters.freeOnly })}>
            Free
          </ToggleButton>
        </div>
      </fieldset>

      <fieldset className="filter-bar__group">
        <legend className="visually-hidden">Level</legend>
        <div className="filter-bar__chips">
          <span className="filter-bar__divider" aria-hidden="true" />
          {LEVEL_FILTERS.map((level) => (
            <ToggleButton
              key={level}
              pressed={filters.levels.includes(level)}
              onToggle={() => set({ levels: toggleInList(filters.levels, level) })}
            >
              {level}
            </ToggleButton>
          ))}
        </div>
      </fieldset>
    </>
  );
  const quickActive = filters.formats.length + filters.levels.length + (filters.freeOnly ? 1 : 0);

  return (
    <section className="filter-bar" aria-labelledby="filter-heading">
      <h3 id="filter-heading" className="visually-hidden">Filter events</h3>

      <div className="filter-bar__main">
        <div className="filter-bar__quick filter-bar__quick--bar">{quick}</div>

        <button
          type="button"
          className="filter-bar__more"
          aria-expanded={moreOpen}
          aria-controls="more-filters"
          onClick={() => setMoreOpen(!moreOpen)}
        >
          More filters
          {moreActive > 0 && (
            <span className="filter-bar__more-count filter-bar__more-count--wide">
              {moreActive}<span className="visually-hidden"> on</span>
            </span>
          )}
          {moreActive + quickActive > 0 && (
            <span className="filter-bar__more-count filter-bar__more-count--phone">
              {moreActive + quickActive}<span className="visually-hidden"> on</span>
            </span>
          )}
          <span className="filter-bar__chevron" aria-hidden="true">▾</span>
        </button>

        <div className="filter-bar__summary">
          <ResultCount id="result-count" count={resultCount} />
          {hasActiveFilters(filters) && (
            <button type="button" className="link-button" onClick={onClear}>Clear all</button>
          )}
        </div>
      </div>

      <div id="more-filters" className="filter-bar__panel" hidden={!moreOpen}>
        <div className="filter-bar__quick filter-bar__quick--panel">{quick}</div>
        <div className="filter-bar__selects">
          <Select id="filter-location" label="Location" allLabel="Anywhere" options={['Near me']}
            value={filters.near ? 'Near me' : ''} onChange={(v) => set({ near: v === 'Near me' })} />
          {filters.near && locationNote && <div className="filter-bar__location">{locationNote}</div>}
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
    </section>
  );
}
