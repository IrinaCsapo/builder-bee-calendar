import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from './site';

type Umami = { track: (payload: (props: Record<string, unknown>) => Record<string, unknown>) => void };

/**
 * Loads Umami (cookieless, anonymous visit counts) on the live site only.
 * We send each page view ourselves (auto-tracking is off) so that changing filters,
 * which rewrites the address, isn't counted as a new page view. Only the path is sent.
 */
export function startAnalytics() {
  if (!UMAMI_WEBSITE_ID || import.meta.env.DEV || location.hostname === 'localhost') return;

  let last = '';
  const send = () => {
    const url = location.pathname.replace(/(.)\/$/, '$1');
    if (url === last) return;
    last = url;
    (window as unknown as { umami?: Umami }).umami?.track((props) => ({ ...props, url }));
  };

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.autoTrack = 'false';
  script.onload = send;
  document.head.appendChild(script);
  window.addEventListener('routechange', send);
  window.addEventListener('popstate', send);
}
