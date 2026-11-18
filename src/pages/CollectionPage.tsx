import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { useNow } from '../lib/timeLeft';
import type { Collection } from '../lib/collections';
import { EventCard } from '../components/EventCard/EventCard';
import { BrowseLinks } from '../components/BrowseLinks/BrowseLinks';
import { NewsletterSignup } from '../components/NewsletterSignup/NewsletterSignup';
import '../components/EventList/EventList.css';
import './EventPage.css';
import './CommunityPage.css';

const upcoming = getUpcoming(allEvents);

/** A landing page for one kind of event, region or city (/hackathons, /europe, /city/london) */
export function CollectionPage({ collection: c }: { collection: Collection }) {
  useDocumentTitle(c.title);
  const now = useNow();
  const events = upcoming.filter(c.match);

  return (
    <div className="container community-page collection-page">
      <p className="event-page__back">
        <a href="/"><ArrowLeftIcon className="icon" aria-hidden="true" /> All events</a>
      </p>
      <header className="community-page__head collection-page__head" style={{ ['--group' as string]: c.colour }}>
        <div>
          <p className="community-page__kicker">{c.kicker}</p>
          <h1>{c.heading}</h1>
          <p className="community-page__about">{c.intro}</p>
          <div className="community-page__meta">
            <span className="community-page__where">
              {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
            </span>
            {c.kind !== 'Topic' && (
              <a className="community-page__site" href="/online">
                Or join one online <ArrowRightIcon className="icon" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="collection-events">
        <div className="event-row__head">
          <h2 id="collection-events" className="event-row__title">Coming up</h2>
        </div>
        {events.length > 0 ? (
          <ul className="event-row__items is-expanded">
            {events.map((e) => (
              <li key={e.id}><EventCard event={e} now={now} headingLevel={3} /></li>
            ))}
          </ul>
        ) : (
          <p>
            Nothing coming up here right now. New events are added every morning, so check back soon, or{' '}
            <a href="/">see all events</a>.
          </p>
        )}
      </section>

      <section aria-label="Weekly email">
        <NewsletterSignup />
      </section>

      <BrowseLinks current={c.path} />
    </div>
  );
}
