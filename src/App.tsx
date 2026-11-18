import { useEffect, useRef } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { HomePage } from './pages/HomePage';
import { EventPage } from './pages/EventPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SubmitPage } from './pages/SubmitPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CookiesPage } from './pages/CookiesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { SubscribePage } from './pages/SubscribePage';
import { CommunityPage } from './pages/CommunityPage';
import { CollectionPage } from './pages/CollectionPage';
import { useRoute } from './lib/router';
import { allEvents } from './lib/events';
import { allCollections } from './lib/collections';

const COLLECTIONS = allCollections(allEvents);

export function App() {
  const { path } = useRoute();
  const eventMatch = path.match(/^\/event\/([a-z0-9-]+)\/?$/);
  const communityMatch = path.match(/^\/community\/([a-z0-9-]+)\/?$/);
  const collection = COLLECTIONS.find((c) => c.path === path.replace(/\/$/, ''));

  let page;
  if (path === '/') page = <HomePage />;
  // The previous hero, kept for comparison (not in the nav). /hero-lab was the new one's test address.
  else if (path === '/hero-old') page = <HomePage heroVariant="live" />;
  else if (path === '/hero-lab') page = <HomePage />;
  else if (eventMatch) page = <EventPage id={eventMatch[1]} />;
  else if (path === '/submit') page = <SubmitPage />;
  else if (path === '/communities') page = <CommunitiesPage />;
  else if (communityMatch) page = <CommunityPage slug={communityMatch[1]} />;
  else if (path === '/how-it-works') page = <HowItWorksPage />;
  else if (path === '/about') page = <AboutPage />;
  else if (path === '/subscribe') page = <SubscribePage />;
  else if (path === '/privacy') page = <PrivacyPage />;
  else if (path === '/cookies') page = <CookiesPage />;
  else if (collection) page = <CollectionPage key={collection.path} collection={collection} />;
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

