import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from './site';

type Umami = { track: (payload: (props: Record<string, unknown>) => Record<string, unknown>) => void };

/**
 * Loads Umami (cookieless, anonymous visit counts) on the live site only.
 * The site's pages live after the "#" (#/event/…), which Umami doesn't follow on its own,
 * so we switch off its auto-tracking and send each page view ourselves, with the page as a
 * normal path: #/event/herhack-2026 is counted as /event/herhack-2026.
 */
export function startAnalytics() {
  if (!UMAMI_WEBSITE_ID || import.meta.env.DEV || location.hostname === 'localhost') return;

  const path = () => location.hash.replace(/^#/, '') || '/';
  const send = () => (window as unknown as { umami?: Umami }).umami?.track((props) => ({ ...props, url: path() }));

  const script = document.createElement('script');
  script.defer = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.autoTrack = 'false';
  script.onload = send;
  document.head.appendChild(script);
  window.addEventListener('hashchange', send);
}
