import type { Region } from '../types/event';

// "Events near me". Everything here runs in the visitor's browser: their location
// is never sent anywhere, never stored, and never put in the URL.

export interface Origin {
  lat: number;
  lng: number;
  label: string;                 // "London" or "your location"
  source: 'timezone' | 'device'; // rough guess vs. browser location
  country?: string;              // known from the timezone; not from the browser location
  region?: Region;               // also from the timezone
}

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// IANA timezones are named after a city. Coordinates for the most common ones let us
// make a rough guess with no permission prompt. Unlisted zones fall back to date order.
const TZ_COORDS: Record<string, [number, number]> = {
  'Europe/London': [51.51, -0.13], 'Europe/Dublin': [53.35, -6.26], 'Europe/Lisbon': [38.72, -9.14],
  'Europe/Madrid': [40.42, -3.70], 'Europe/Paris': [48.86, 2.35], 'Europe/Brussels': [50.85, 4.35],
  'Europe/Amsterdam': [52.37, 4.90], 'Europe/Berlin': [52.52, 13.40], 'Europe/Zurich': [47.38, 8.54],
  'Europe/Rome': [41.90, 12.50], 'Europe/Vienna': [48.21, 16.37], 'Europe/Prague': [50.08, 14.44],
  'Europe/Warsaw': [52.23, 21.01], 'Europe/Copenhagen': [55.68, 12.57], 'Europe/Stockholm': [59.33, 18.07],
  'Europe/Oslo': [59.91, 10.75], 'Europe/Helsinki': [60.17, 24.94], 'Europe/Athens': [37.98, 23.73],
  'Europe/Bucharest': [44.43, 26.10], 'Europe/Budapest': [47.50, 19.04], 'Europe/Kyiv': [50.45, 30.52],
  'Europe/Kiev': [50.45, 30.52], 'Europe/Istanbul': [41.01, 28.98],
  'America/New_York': [40.71, -74.01], 'America/Toronto': [43.65, -79.38], 'America/Chicago': [41.88, -87.63],
  'America/Denver': [39.74, -104.99], 'America/Phoenix': [33.45, -112.07], 'America/Los_Angeles': [34.05, -118.24],
  'America/Vancouver': [49.28, -123.12], 'America/Anchorage': [61.22, -149.90], 'Pacific/Honolulu': [21.31, -157.86],
  'America/Halifax': [44.65, -63.57], 'America/Detroit': [42.33, -83.05], 'America/Indiana/Indianapolis': [39.77, -86.16],
  'America/Mexico_City': [19.43, -99.13], 'America/Bogota': [4.71, -74.07], 'America/Lima': [-12.05, -77.04],
  'America/Santiago': [-33.45, -70.67], 'America/Argentina/Buenos_Aires': [-34.60, -58.38], 'America/Sao_Paulo': [-23.55, -46.63],
  'Africa/Lagos': [6.52, 3.38], 'Africa/Accra': [5.60, -0.19], 'Africa/Nairobi': [-1.29, 36.82],
  'Africa/Johannesburg': [-26.20, 28.05], 'Africa/Cairo': [30.04, 31.24], 'Africa/Casablanca': [33.57, -7.59],
  'Africa/Kigali': [-1.95, 30.06], 'Asia/Dubai': [25.20, 55.27], 'Asia/Kolkata': [22.57, 88.36], 'Asia/Calcutta': [22.57, 88.36],
  'Asia/Karachi': [24.86, 67.01], 'Asia/Dhaka': [23.81, 90.41], 'Asia/Bangkok': [13.76, 100.50],
  'Asia/Jakarta': [-6.21, 106.85], 'Asia/Singapore': [1.35, 103.82], 'Asia/Kuala_Lumpur': [3.14, 101.69],
  'Asia/Manila': [14.60, 120.98], 'Asia/Hong_Kong': [22.32, 114.17], 'Asia/Shanghai': [31.23, 121.47],
  'Asia/Taipei': [25.03, 121.57], 'Asia/Seoul': [37.57, 126.98], 'Asia/Tokyo': [35.68, 139.69],
  'Australia/Perth': [-31.95, 115.86], 'Australia/Adelaide': [-34.93, 138.60], 'Australia/Melbourne': [-37.81, 144.96],
  'Australia/Sydney': [-33.87, 151.21], 'Australia/Brisbane': [-27.47, 153.03], 'Pacific/Auckland': [-36.85, 174.76],
};

// Which country each of those timezones is in, using the same country names as events.json.
const COUNTRY_TZS: Record<string, string[]> = {
  'United Kingdom': ['Europe/London'],
  'Ireland': ['Europe/Dublin'],
  'Portugal': ['Europe/Lisbon'],
  'Spain': ['Europe/Madrid'],
  'France': ['Europe/Paris'],
  'Belgium': ['Europe/Brussels'],
  'Netherlands': ['Europe/Amsterdam'],
  'Germany': ['Europe/Berlin'],
  'Switzerland': ['Europe/Zurich'],
  'Italy': ['Europe/Rome'],
  'Austria': ['Europe/Vienna'],
  'Czechia': ['Europe/Prague'],
  'Poland': ['Europe/Warsaw'],
  'Denmark': ['Europe/Copenhagen'],
  'Sweden': ['Europe/Stockholm'],
  'Norway': ['Europe/Oslo'],
  'Finland': ['Europe/Helsinki'],
  'Greece': ['Europe/Athens'],
  'Romania': ['Europe/Bucharest'],
  'Hungary': ['Europe/Budapest'],
  'Ukraine': ['Europe/Kyiv', 'Europe/Kiev'],
  'Turkey': ['Europe/Istanbul'],
  'United States': ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu', 'America/Detroit', 'America/Indiana/Indianapolis'],
  'Canada': ['America/Toronto', 'America/Vancouver', 'America/Halifax'],
  'Mexico': ['America/Mexico_City'],
  'Colombia': ['America/Bogota'],
  'Peru': ['America/Lima'],
  'Chile': ['America/Santiago'],
  'Argentina': ['America/Argentina/Buenos_Aires'],
  'Brazil': ['America/Sao_Paulo'],
  'Nigeria': ['Africa/Lagos'],
  'Ghana': ['Africa/Accra'],
  'Kenya': ['Africa/Nairobi'],
  'South Africa': ['Africa/Johannesburg'],
  'Egypt': ['Africa/Cairo'],
  'Morocco': ['Africa/Casablanca'],
  'Rwanda': ['Africa/Kigali'],
  'United Arab Emirates': ['Asia/Dubai'],
  'India': ['Asia/Kolkata', 'Asia/Calcutta'],
  'Pakistan': ['Asia/Karachi'],
  'Bangladesh': ['Asia/Dhaka'],
  'Thailand': ['Asia/Bangkok'],
  'Indonesia': ['Asia/Jakarta'],
  'Singapore': ['Asia/Singapore'],
  'Malaysia': ['Asia/Kuala_Lumpur'],
  'Philippines': ['Asia/Manila'],
  'Hong Kong': ['Asia/Hong_Kong'],
  'China': ['Asia/Shanghai'],
  'Taiwan': ['Asia/Taipei'],
  'South Korea': ['Asia/Seoul'],
  'Japan': ['Asia/Tokyo'],
  'Australia': ['Australia/Perth', 'Australia/Adelaide', 'Australia/Melbourne', 'Australia/Sydney', 'Australia/Brisbane'],
  'New Zealand': ['Pacific/Auckland'],
};
const TZ_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_TZS).flatMap(([country, zones]) => zones.map((tz) => [tz, country])),
);

/** A rough location from the device's timezone setting. No prompt, no network. */
export function guessFromTimezone(): Origin | null {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
  const coords = TZ_COORDS[tz];
  if (!coords) return null;
  const label = tz.split('/').pop()!.replace(/_/g, ' ');
  const country = TZ_COUNTRY[tz];
  return { lat: coords[0], lng: coords[1], label, source: 'timezone', country, region: regionOf(tz, country) };
}

/** The site's region for a timezone, e.g. Europe/Berlin -> Europe, America/Bogota -> LatAm. */
function regionOf(tz: string, country?: string): Region | undefined {
  const area = tz.split('/')[0];
  if (area === 'Europe') return 'Europe';
  if (area === 'Africa') return 'Africa';
  if (area === 'Asia') return 'Asia';
  if (area === 'Australia' || tz === 'Pacific/Auckland') return 'Oceania';
  if (area === 'America' || tz === 'Pacific/Honolulu') {
    return country === 'United States' || country === 'Canada' ? 'North America' : country ? 'LatAm' : undefined;
  }
  return undefined;
}

/** Asks the browser for the visitor's location. The browser shows its own permission prompt. */
export function getDeviceLocation(): Promise<Origin> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject(new Error('unsupported')); return; }
    navigator.geolocation.getCurrentPosition(
      // Country and region still come from the timezone (the browser only gives coordinates)
      (pos) => {
        const tz = guessFromTimezone();
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'your location', source: 'device', country: tz?.country, region: tz?.region });
      },
      (err) => reject(new Error(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

// Miles for the US, UK, Liberia and Myanmar; km everywhere else.
const MILES_REGIONS = new Set(['US', 'GB', 'LR', 'MM']);
const useMiles = (() => {
  try { return MILES_REGIONS.has(new Intl.Locale(navigator.language).maximize().region ?? ''); } catch { return false; }
})();

/** "12 km away", "about 260 mi from London" */
export function formatDistance(km: number, origin: Origin): string {
  const value = useMiles ? km * 0.621371 : km;
  const unit = useMiles ? 'mi' : 'km';
  const rounded = value < 10 ? Math.max(1, Math.round(value)) : value < 1000 ? Math.round(value / 10) * 10 : Math.round(value / 100) * 100;
  const n = rounded.toLocaleString();
  if (km < 25) return origin.source === 'device' ? 'Near you' : `Near ${origin.label}`;
  return origin.source === 'device' ? `${n} ${unit} away` : `about ${n} ${unit} from ${origin.label}`;
}

// Remembered for this visit only (in memory), so it survives moving between pages
// but is gone when the tab is closed or reloaded.
let remembered: { origin: Origin | null; sortByDate: boolean } | null = null;
export const getRemembered = () => remembered;
export const remember = (origin: Origin | null, sortByDate: boolean) => { remembered = { origin, sortByDate }; };

/** How far counts as "in your area" */
export const NEARBY_KM = 300;

/**
 * Events you could get to: in person or hybrid, and in your country (when we know it)
 * or within NEARBY_KM of you. Nearest first.
 */
export function eventsCloseTo<T extends { format: string; country: string; lat?: number; lng?: number }>(
  events: T[],
  origin: Origin,
): T[] {
  return events
    .filter((e) => e.format !== 'Online' && e.lat !== undefined && e.lng !== undefined)
    .map((e) => ({ e, km: distanceKm(origin, { lat: e.lat!, lng: e.lng! }) }))
    .filter(({ e, km }) => km <= NEARBY_KM || (!!origin.country && e.country === origin.country))
    .sort((a, b) => a.km - b.km)
    .map(({ e }) => e);
}

/** "the United Kingdom", "Germany" */
export const countryName = (c: string) => (/^(United|Netherlands|Philippines)/.test(c) ? `the ${c}` : c);

/** True when the visitor has already allowed location for this site, so asking won't show a prompt. */
export async function locationAllowed(): Promise<boolean> {
  try { return (await navigator.permissions.query({ name: 'geolocation' })).state === 'granted'; } catch { return false; }
}

export type NearScope = 'area' | 'country' | 'region' | 'none';

/**
 * The "Near me" location filter: in-person and hybrid events in your country (or close by,
 * with an exact location). If there are none, the rest of your region.
 */
export function eventsNear<T extends { format: string; country: string; region: string; lat?: number; lng?: number }>(
  events: T[],
  origin: Origin,
): { events: T[]; scope: NearScope } {
  const physical = events.filter((e) => e.format !== 'Online');
  const close = physical.filter((e) =>
    (!!origin.country && e.country === origin.country) ||
    (origin.source === 'device' && e.lat !== undefined && e.lng !== undefined && distanceKm(origin, { lat: e.lat, lng: e.lng }) <= NEARBY_KM));
  if (close.length) return { events: close, scope: origin.country ? 'country' : 'area' };
  const region = origin.region ? physical.filter((e) => e.region === origin.region) : [];
  return region.length ? { events: region, scope: 'region' } : { events: [], scope: 'none' };
}
