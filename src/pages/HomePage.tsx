import { useEffect, useMemo, useState } from 'react';
import { Hero } from '../components/Hero/Hero';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { EventList } from '../components/EventList/EventList';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { allEvents } from '../lib/events';
import { getUpcoming, groupByType } from '../lib/dates';
import { getDeviceLocation, getRemembered, guessFromTimezone, remember, type Origin } from '../lib/location';
import { SortBar, type LocateStatus } from '../components/SortBar/SortBar';
import { ViewSwitch, type View } from '../components/ViewSwitch/ViewSwitch';
import { CalendarView } from '../components/CalendarView/CalendarView';
import { FeaturedCarousel } from '../components/FeaturedCarousel/FeaturedCarousel';
import { isMonthKey } from '../lib/calendar';
import { todayISO } from '../lib/dates';
import { applyFilters, EMPTY_FILTERS, filtersFromQuery, filtersToQuery, hasActiveFilters, type Filters } from '../lib/filters';
import { parseHash, replaceHashQuery } from '../lib/useHashRoute';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useNow } from '../lib/timeLeft';

const upcoming = getUpcoming(allEvents);

// Featured in the hero: online (and hybrid) events only, soonest first
const featured = upcoming.filter((e) => e.format !== 'In person').slice(0, 6);
const featuredIds = new Set(featured.map((e) => e.id));

// Calendar view can go from this month to the month of the last upcoming event.
const MIN_MONTH = todayISO().slice(0, 7);
const MAX_MONTH = upcoming.reduce((max, e) => (e.end_date.slice(0, 7) > max ? e.end_date.slice(0, 7) : max), MIN_MONTH);
const clampMonth = (m: string | null) => (isMonthKey(m) ? (m < MIN_MONTH ? MIN_MONTH : m > MAX_MONTH ? MAX_MONTH : m) : MIN_MONTH);
const viewFromQuery = (q: URLSearchParams): View => (q.get('view') === 'calendar' ? 'calendar' : 'list');

const countriesByRegion: Record<string, string[]> = {};
for (const e of upcoming) {
  if (!e.country) continue;
  const list = (countriesByRegion[e.region] ??= []);
  if (!list.includes(e.country)) list.push(e.country);
}
Object.values(countriesByRegion).forEach((list) => list.sort());

/** Scroll to an element, then move keyboard focus there (focus first, so it doesn't cancel the smooth scroll). */
function jumpTo(target: HTMLElement | null, focusEl: HTMLElement | null) {
  if (!target) return;
  focusEl?.focus({ preventScroll: true });
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 16, behavior: smooth ? 'smooth' : 'auto' });
}

export function HomePage() {
  useDocumentTitle();
  // Filters live in the URL (#/?format=Online&region=Europe) so a filtered view can be shared.
  const [filters, setFilters] = useState<Filters>(() => filtersFromQuery(parseHash().query));
  const [view, setView] = useState<View>(() => viewFromQuery(parseHash().query));
  const [month, setMonth] = useState(() => clampMonth(parseHash().query.get('month')));
  useEffect(() => {
    const parts = [filtersToQuery(filters)];
    if (view === 'calendar') parts.push('view=calendar');
    if (view === 'calendar' && month !== MIN_MONTH) parts.push(`month=${month}`);
    replaceHashQuery(parts.filter(Boolean).join('&'));
  }, [filters, view, month]);

  // Someone pastes a new filtered link into the same tab
  useEffect(() => {
    const onHash = () => {
      const route = parseHash();
      if (route.path !== '/') return;
      setFilters(filtersFromQuery(route.query));
      setView(viewFromQuery(route.query));
      setMonth(clampMonth(route.query.get('month')));
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
  const now = useNow();

  // Each event appears once on the page: events already featured in the hero
  // aren't repeated below, unless the visitor is searching or filtering.
  const listed = useMemo(
    () => (hasActiveFilters(filters) ? results : results.filter((e) => !featuredIds.has(e.id))),
    [filters, results],
  );
  const groups = useMemo(
    () => groupByType(listed, nearest ? origin : null),
    [listed, nearest, origin],
  );
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    // The button that was clicked disappears once filters are cleared,
    // so put keyboard focus somewhere sensible: the first filter.
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.filter-bar button')?.focus());
  };

  return (
    <>
      <Hero
        query={filters.query}
        onQueryChange={(query) => setFilters((f) => ({ ...f, query }))}
        onSearch={() => {
          // Jump to the results and move focus to the count, so it's read out
          const count = document.getElementById('result-count');
          jumpTo(count?.closest('.filter-bar') as HTMLElement | null, count);
        }}
        onBrowse={() => {
          const events = document.getElementById('events');
          jumpTo(events, events);
        }}
        featured={<FeaturedCarousel events={featured} />}
      />
      <div className="container" id="events" tabIndex={-1} role="region" aria-label="Events">
        <h2 className="all-events__title" id="all-events">All events</h2>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={clear}
          resultCount={listed.length}
          countriesByRegion={countriesByRegion}
        />
        <div className="results-toolbar">
          <ViewSwitch view={view} onChange={setView} />
          {view === 'list' && (
            <SortBar
              nearest={nearest}
              origin={origin}
              status={locateStatus}
              onSortByDate={() => { setSortByDate(true); setLocateStatus('idle'); }}
              onSortNearest={sortNearest}
              onLocate={locate}
            />
          )}
        </div>
        {view === 'calendar' ? (
          <CalendarView month={month} minMonth={MIN_MONTH} maxMonth={MAX_MONTH} events={results} onMonthChange={setMonth} />
        ) : (
          listed.length > 0 ? (
            <EventList groups={groups} variant="month" now={now} />
          ) : (
            <EmptyState onClear={clear} />
          )
        )}
      </div>
    </>
  );
}
