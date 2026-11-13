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
import { countryName, eventsNear, getDeviceLocation, getRemembered, getRememberedPlace, guessFromTimezone, locationAllowed, NEARBY_KM, remember, rememberPlace, shortPlace, type Origin, type PlaceChoice } from '../lib/location';

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

/** heroVariant 'lab' = the test hero at #/hero-lab (not linked anywhere) */
export function HomePage({ heroVariant = 'live' }: { heroVariant?: 'live' | 'lab' } = {}) {
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

  // "Near you": a row at the top, worked out automatically from the timezone (no prompt), or the
  // exact location if the visitor has already allowed it. They can change it under More filters > Location.
  const [origin, setOrigin] = useState<Origin | null>(() => getRemembered()?.origin ?? guessFromTimezone());
  const [place, setPlace] = useState<PlaceChoice>(getRememberedPlace);
  const [locating, setLocating] = useState<'idle' | 'locating' | 'denied' | 'unavailable'>('idle');
  const locate = () => {
    setLocating('locating');
    getDeviceLocation()
      .then((o) => { setOrigin(o); remember(o, true); setLocating('idle'); })
      .catch((err: Error) => setLocating(err.message === 'denied' ? 'denied' : 'unavailable'));
  };
  useEffect(() => {
    if (origin?.source === 'device') return;
    locationAllowed().then((ok) => { if (ok) locate(); });   // already allowed: no prompt
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const choosePlace = (p: PlaceChoice) => {
    setPlace(p);
    rememberPlace(p);
    if (p === 'device' && origin?.source !== 'device') locate();
  };

  const nearYou = useMemo(() => {
    const physical = upcoming.filter((e) => e.format !== 'Online');
    if (place.startsWith('country:') || place.startsWith('region:')) {
      const [kind, name] = place.split(/:(.*)/) as ['country' | 'region', string];
      return { label: shortPlace(name), events: physical.filter((e) => e[kind] === name), scope: kind };
    }
    if (!origin || (place === 'device' && origin.source !== 'device')) return null;
    const { events, scope } = eventsNear(upcoming, origin);
    const label = scope === 'region' ? origin.region! : scope === 'country' ? shortPlace(origin.country!) : '';
    return { label, events, scope };
  }, [place, origin]);

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
    if (hasActiveFilters(filters) || !nearYou) return byType;
    return [{ key: 'near', label: nearYou.label ? `Near you · ${nearYou.label}` : 'Near you', events: nearYou.events }, ...byType];
  }, [listed, now, filters, nearYou]);

  const unit = (() => { try { return ['US', 'GB'].includes(new Intl.Locale(navigator.language).maximize().region ?? '') ? 'miles' : 'km'; } catch { return 'km'; } })();
  const area = unit === 'miles' ? `${Math.round(NEARBY_KM * 0.621371 / 10) * 10} miles` : `${NEARBY_KM} km`;
  const openMore = () => {
    const btn = document.querySelector<HTMLButtonElement>('.filter-bar__more');
    if (btn?.getAttribute('aria-expanded') === 'false') btn.click();
    requestAnimationFrame(() => {
      const sel = document.getElementById('filter-location');
      sel?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      sel?.focus({ preventScroll: true });
    });
  };
  const change = <> Change it under <button type="button" className="link-button near-note__link" onClick={openMore}><em>More filters</em></button>.</>;
  const nearNote = nearYou && (
    <p className="near-note">
      {nearYou.scope === 'country' || nearYou.scope === 'region'
        ? place
          ? 'You picked this place.'
          : origin?.source === 'device'
            ? nearYou.scope === 'region'
              ? `Nothing in ${origin.country ? countryName(origin.country) : 'your country'} yet, so here’s the rest of ${origin.region}. Based on your location.`
              : 'Based on your location.'
            : nearYou.scope === 'region'
              ? `Nothing in ${origin?.country ? countryName(origin.country) : 'your country'} yet, so here’s the rest of ${origin?.region}. Based on your time zone.`
              : 'Based on your time zone.'
        : nearYou.scope === 'area'
          ? `In-person and hybrid events within ${area} of you.`
          : 'No in-person events near you yet. Online events are open to everyone: see the top of the page.'}
      {change}
    </p>
  );

  // Under More filters > Location
  const locationStatus = (
    <p role="status">
      {locating === 'locating' && 'Finding your location…'}
      {locating === 'denied' && 'Location access is blocked in your browser, so we’re using your time zone.'}
      {locating === 'unavailable' && 'We couldn’t get your location, so we’re using your time zone.'}
      {locating === 'idle' && !place && (origin
        ? origin.source === 'device' ? 'Using your exact location.' : 'Detected from your device’s time zone. It never leaves your device.'
        : 'We couldn’t tell where you are from your time zone. Pick a place, or use your exact location.')}
    </p>
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
        variant={heroVariant}
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
          // The total includes the featured events in the hero, so it doesn't jump when a filter is turned on
          resultCount={results.length}
          countriesByRegion={countriesByRegion}
          location={{
            value: place,
            onChange: choosePlace,
            detected: origin ? (origin.source === 'device' ? 'My exact location' : origin.country ?? origin.region ?? origin.label) : '',
            status: locationStatus,
          }}
        />
        {listed.length > 0 ? <EventList groups={groups} now={now} notes={{ near: nearNote }} /> : <EmptyState onClear={clear} />}
      </section>
    </>
  );
}
