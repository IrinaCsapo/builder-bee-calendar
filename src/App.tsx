import { useEffect, useRef } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { HomePage } from './pages/HomePage';
import { EventPage } from './pages/EventPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SubmitPage } from './pages/SubmitPage';
import { AboutPage } from './pages/AboutPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { useHashRoute } from './lib/useHashRoute';

export function App() {
  const { path } = useHashRoute();
  const eventMatch = path.match(/^\/event\/([a-z0-9-]+)\/?$/);

  let page;
  if (path === '/') page = <HomePage />;
  else if (eventMatch) page = <EventPage id={eventMatch[1]} />;
  else if (path === '/submit') page = <SubmitPage />;
  else if (path === '/communities') page = <CommunitiesPage />;
  else if (path === '/about') page = <AboutPage />;
  else page = <NotFoundPage />;

  // On page change (not on filter changes): scroll to top and move focus to
  // the page's h1, so screen reader users hear where they've landed.
  const previousPath = useRef(path);
  useEffect(() => {
    if (previousPath.current === path) return; // first load or same page
    previousPath.current = path;
    window.scrollTo(0, 0);
    const h1 = document.querySelector<HTMLElement>('main h1');
    if (h1) { h1.tabIndex = -1; h1.focus({ preventScroll: true }); }
  }, [path]);

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {page}
      </main>
      <Footer />
    </>
  );
}

