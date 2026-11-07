import { useEffect, useMemo, useState } from 'react';
import { Hero } from '../components/Hero/Hero';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { EventList } from '../components/EventList/EventList';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { allEvents } from '../lib/events';
import { getUpcoming, groupByMonth, groupByPlace } from '../lib/dates';
import { getDeviceLocation, getRemembered, guessFromTimezone, remember, type Origin } from '../lib/location';
import { SortBar, type LocateStatus } from '../components/SortBar/SortBar';
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

  // Nearest-first: starts from a rough timezone guess (no prompt). "Use my exact
  // location" asks the browser. Location stays in memory only, never in the URL.
  const [origin, setOrigin] = useState<Origin | null>(() => getRemembered()?.origin ?? guessFromTimezone());
  const [sortByDate, setSortByDate] = useState(() => getRemembered()?.sortByDate ?? !origin);
  const [locateStatus, setLocateStatus] = useState<LocateStatus>('idle');
  useEffect(() => remember(origin, sortByDate), [origin, sortByDate]);

  const locate = async () => {
    setLocateStatus('locating');
    try {
      setOrigin(await getDeviceLocation());
      setSortByDate(false);
      setLocateStatus('idle');
    } catch (err) {
      setLocateStatus((err as Error).message === 'denied' ? 'denied' : 'unavailable');
    }
  };
  const sortNearest = () => {
    if (origin) { setSortByDate(false); setLocateStatus('idle'); }
    else locate();
  };
  const nearest = !sortByDate && !!origin;
  const groups = useMemo(
    () => (nearest ? groupByPlace(results, origin!) : groupByMonth(results)),
    [nearest, origin, results],
  );
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    // The button that was clicked disappears once filters are cleared,
    // so put keyboard focus somewhere sensible: the search box.
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#event-search')?.focus());
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
        <SortBar
          nearest={nearest}
          origin={origin}
          status={locateStatus}
          onSortByDate={() => { setSortByDate(true); setLocateStatus('idle'); }}
          onSortNearest={sortNearest}
          onLocate={locate}
        />
        {results.length > 0 ? (
          <EventList groups={groups} variant={nearest ? 'place' : 'month'} />
        ) : (
          <EmptyState onClear={clear} />
        )}
      </div>
    </>
  );
}
