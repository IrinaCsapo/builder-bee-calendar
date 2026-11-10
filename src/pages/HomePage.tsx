import { useEffect, useMemo, useState } from 'react';
import { Hero } from '../components/Hero/Hero';
import { SearchBox } from '../components/SearchBox/SearchBox';
import { FilterBar } from '../components/FilterBar/FilterBar';
import { EventList } from '../components/EventList/EventList';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { FeaturedCarousel } from '../components/FeaturedCarousel/FeaturedCarousel';
import { allEvents } from '../lib/events';
import { getUpcoming, groupByType } from '../lib/dates';
import { applyFilters, EMPTY_FILTERS, filtersFromQuery, filtersToQuery, hasActiveFilters, type Filters } from '../lib/filters';
import { parseHash, replaceHashQuery } from '../lib/useHashRoute';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useNow } from '../lib/timeLeft';
import { eventsCloseTo, getDeviceLocation, getRemembered, guessFromTimezone, NEARBY_KM, remember, type Origin } from '../lib/location';

const upcoming = getUpcoming(allEvents);

// Featured in the hero: every event anyone can join from anywhere.
// All online events first (soonest first), then hybrid ones.
const featured = [
  ...upcoming.filter((e) => e.format === 'Online'),
  ...upcoming.filter((e) => e.format === 'Hybrid'),
];
const featuredIds = new Set(featured.map((e) => e.id));

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

  // "Close to you": a rough guess from the timezone (no prompt), or the exact location if the visitor asks
  const [origin, setOrigin] = useState<Origin | null>(() => getRemembered()?.origin ?? guessFromTimezone());
  const [locating, setLocating] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle');
  const locate = () => {
    setLocating('locating');
    getDeviceLocation()
      .then((o) => { setOrigin(o); remember(o, true); setLocating('idle'); })
      .catch((err: Error) => setLocating(err.message === 'denied' ? 'denied' : 'unavailable'));
  };
  const closeToYou = useMemo(() => (origin ? eventsCloseTo(upcoming, origin) : []), [origin]);

  const now = useNow();
  const results = useMemo(() => applyFilters(upcoming, filters), [filters]);
  // Each event appears once on the page: events already featured in the hero
  // aren't repeated below, unless the visitor is searching or filtering.
  const listed = useMemo(
    () => (hasActiveFilters(filters) ? results : results.filter((e) => !featuredIds.has(e.id))),
    [filters, results],
  );
  // One row per type; inside each, the registration that ends soonest comes first
  const groups = useMemo(() => {
    const byType = groupByType(listed, now);
    // Only on the unfiltered page: when searching or filtering, the results are what matter
    if (hasActiveFilters(filters) || !closeToYou.length) return byType;
    return [{ key: 'close', label: 'Close to you', events: closeToYou }, ...byType];
  }, [listed, now, filters, closeToYou]);

  const unit = (() => { try { return ['US', 'GB'].includes(new Intl.Locale(navigator.language).maximize().region ?? '') ? 'miles' : 'km'; } catch { return 'km'; } })();
  const area = unit === 'miles' ? `${Math.round(NEARBY_KM * 0.621371 / 10) * 10} miles` : `${NEARBY_KM} km`;
  const closeNote = origin && (
    <>
      <p role="status">
        {locating === 'locating' && 'Finding your location…'}
        {locating === 'denied' && 'Location access is blocked, so we’re still using your timezone. You can allow it in your browser’s site settings.'}
        {locating === 'unavailable' && 'We couldn’t get your location, so we’re still using your timezone.'}
        {locating === 'idle' && (origin.source === 'device'
          ? `In-person and hybrid events within ${area} of you, nearest first.`
          : origin.country
            ? `In-person and hybrid events in ${/^(United|Netherlands|Philippines)/.test(origin.country) ? 'the ' : ''}${origin.country} or within ${area} of ${origin.label}, nearest first. A rough guess from your device’s timezone.`
            : `In-person and hybrid events within ${area} of ${origin.label}, nearest first. A rough guess from your device’s timezone.`)}
      </p>
      {origin.source !== 'device' && (
        <button type="button" className="event-row__locate hive-hover hive-hover--on-light" onClick={locate} disabled={locating === 'locating'}>
          <span aria-hidden="true">📍</span> Use my exact location
        </button>
      )}
    </>
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
        onBrowse={() => {
          const events = document.getElementById('events');
          jumpTo(events, events);
        }}
        featured={<FeaturedCarousel events={featured} />}
      />
      <section className="container browse" id="events" tabIndex={-1} aria-labelledby="browse-title">
        <h2 id="browse-title" className="visually-hidden">Browse events</h2>
        <div className="browse__search">
          <SearchBox
            value={filters.query}
            onChange={(query) => setFilters((f) => ({ ...f, query }))}
            onSubmit={() => {
              // Jump to the first category and read out the count
              const count = document.getElementById('result-count');
              jumpTo(document.querySelector<HTMLElement>('.event-list'), count);
            }}
          />
        </div>
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onClear={clear}
          resultCount={listed.length}
          countriesByRegion={countriesByRegion}
        />
        {listed.length > 0 ? <EventList groups={groups} now={now} notes={{ close: closeNote }} /> : <EmptyState onClear={clear} />}
      </section>
    </>
  );
}
