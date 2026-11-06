import { useMemo, useState } from 'react';
import { Hero } from '../components/Hero/Hero';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { EventList } from '../components/EventList/EventList';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { applyFilters, EMPTY_FILTERS, type Filters } from '../lib/filters';

const upcoming = getUpcoming(allEvents);

export function HomePage() {
  // Moves into the URL query string in step 4b.
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
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
        <FilterBar filters={filters} onChange={setFilters} onClear={clear} resultCount={results.length} />
        {results.length > 0 ? <EventList events={results} /> : <EmptyState onClear={clear} />}
      </div>
    </>
  );
}
