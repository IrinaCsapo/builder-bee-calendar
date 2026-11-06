import { useEffect, useState } from 'react';

// Hash routing works on GitHub Pages without any server config.
// URLs look like:  #/            #/?format=Online&region=Europe
//                  #/event/femmehacks-2027      #/submit     #/about

export interface HashRoute {
  path: string;              // "/", "/event/femmehacks-2027", ...
  query: URLSearchParams;
}

export function parseHash(hash = window.location.hash): HashRoute {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(search) };
}

export function useHashRoute(): HashRoute {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/** Update the query part of the current hash without adding a history entry. */
export function replaceHashQuery(query: string) {
  const { path } = parseHash();
  const next = `#${path}${query ? `?${query}` : ''}`;
  if (next !== window.location.hash) history.replaceState(null, '', next);
}
