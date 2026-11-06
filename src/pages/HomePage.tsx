import { useEffect, useMemo, useState } from 'react';
import { Hero } from '../components/Hero/Hero';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { EventList } from '../components/EventList/EventList';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { applyFilters, EMPTY_FILTERS, filtersFromQuery, filtersToQuery, type Filters } from '../lib/filters';
import { parseHash, replaceHashQuery } from '../lib/useHashRoute';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const upcoming = getUpcoming(allEvents);

const countriesByRegion: Record<string, string[]> = {};
for (const e of upcoming) {
  if (!e.country) continue;
  const list = (countriesByRegion[e.region] ??= []);
  if (!list.includes(e.country)) list.push(e.country);
}
Object.values(countriesByRegion).forEach((list) => list.sort());

export function HomePage() {
  useDocumentTitle();
  // Filters live in the URL (#/?format=Online&region=Europe) so a filtered view can be shared.
  const [filters, setFilters] = useState<Filters>(() => filtersFromQuery(parseHash().query));
  useEffect(() => replaceHashQuery(filtersToQuery(filters)), [filters]);

  // Someone pastes a new filtered link into the same tab
  useEffect(() => {
    const onHash = () => {
      const route = parseHash();
      if (route.path === '/') setFilters(filtersFromQuery(route.query));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const results = useMemo(() => applyFilters(upcoming, filters), [filters]);
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    // The button that was clicked disappears once filters are cleared,
    // so put keyboard focus somewhere sensible: the first filter.
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.filter-bar button')?.focus());
  };

  return (
    <>
      <Hero />
      <div className="container">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={clear}
          resultCount={results.length}
          countriesByRegion={countriesByRegion}
        />
        {results.length > 0 ? <EventList events={results} /> : <EmptyState onClear={clear} />}
      </div>
    </>
  );
}
