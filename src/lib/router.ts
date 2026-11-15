import { useEffect, useState } from 'react';

// Normal page addresses:   /    /?format=Online&region=Europe    /event/femmehacks-2027    /submit    /about
// GitHub Pages serves a real HTML file for each of them (made at build time by scripts/prerender.ts),
// then this router takes over in the browser. Older #/ links are redirected (see redirectOldHashLinks).

export interface Route {
  path: string;              // "/", "/event/femmehacks-2027", ...
  query: URLSearchParams;
}

const CHANGE = 'routechange';

/** "/about/" and "/about.html" both mean "/about" */
const clean = (path: string) => path.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/+$/, '$1') || '/';

export function parseLocation(): Route {
  return { path: clean(window.location.pathname), query: new URLSearchParams(window.location.search) };
}

export function useRoute(): Route {
  const [route, setRoute] = useState(parseLocation);
  useEffect(() => {
    const onChange = () => setRoute(parseLocation());
    window.addEventListener('popstate', onChange);
    window.addEventListener(CHANGE, onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener(CHANGE, onChange);
    };
  }, []);
  return route;
}

/** Go to another page of the site without reloading. */
export function navigate(href: string) {
  const url = new URL(href, window.location.href);
  if (url.pathname + url.search === window.location.pathname + window.location.search) return;
  history.pushState(null, '', url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(CHANGE));
}

/** Update the query string of the current page without adding a history entry. */
export function replaceQuery(query: string) {
  const { pathname } = window.location;
  const next = `${pathname}${query ? `?${query}` : ''}`;
  if (next !== pathname + window.location.search) history.replaceState(null, '', next);
  if (clean(pathname) === '/') rememberListHref();
}

/**
 * Clicks on links to other pages of the site are handled here, so moving around doesn't reload
 * the whole page. New-tab clicks, downloads, other sites and #anchors are left to the browser.
 */
export function interceptLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:')) return;
    const url = new URL(a.href);
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });
}

/** Links shared before the switch (builderbee.club/#/event/…) still work: they become /event/… */
export function redirectOldHashLinks() {
  const fix = () => {
    const { hash } = window.location;
    if (!hash.startsWith('#/')) return false;
    history.replaceState(null, '', hash.slice(1));
    return true;
  };
  fix();
  window.addEventListener('hashchange', () => { if (fix()) window.dispatchEvent(new Event(CHANGE)); });
}

// Remembers the last filtered list address, so "Back to all events" on a detail
// page returns to the same filters even if the visitor arrived some other way.
let lastListHref = '/';
export const rememberListHref = () => { lastListHref = window.location.pathname === '/' ? '/' + window.location.search : '/'; };
export const getListHref = () => lastListHref;
