import { ArrowLeftIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { communityEvents } from '../lib/communityEvents';
import { useNow } from '../lib/timeLeft';
import { ALL_COMMUNITIES, communitySlug } from '../data/communities';
import { EventCard } from '../components/EventCard/EventCard';
import { NotFoundPage } from './NotFoundPage';
import '../components/EventList/EventList.css';
import './EventPage.css';
import './CommunityPage.css';

/** One community and all its upcoming events (/community/<slug>) */
export function CommunityPage({ slug }: { slug: string }) {
  const community = ALL_COMMUNITIES.find((c) => communitySlug(c) === slug);
  useDocumentTitle(community ? `${community.name} events` : 'Community not found');
  const now = useNow();
  if (!community) return <NotFoundPage message="We couldn't find that community. It may have been renamed." />;

  const events = communityEvents(community, allEvents);

  return (
    <div className="container community-page">
      <p className="event-page__back">
        <a href="/communities"><ArrowLeftIcon className="icon" aria-hidden="true" /> All communities</a>
      </p>
      <h1>{community.name}</h1>
      <p className="community-page__where">{community.where}</p>
      <p className="community-page__about">{community.about}</p>
      <p>
        <a className="community-page__site" href={community.url} target="_blank" rel="noopener noreferrer">
          Visit {community.name}<span className="visually-hidden"> (opens in a new tab)</span>{' '}
          <ArrowUpRightIcon className="icon" aria-hidden="true" />
        </a>
      </p>

      <section aria-labelledby="community-events">
        <div className="event-row__head">
          <h2 id="community-events" className="event-row__title">
            Upcoming events
            <span className="event-row__count">
              <span className="visually-hidden">, </span>
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          </h2>
        </div>
        {events.length > 0 ? (
          <ul className="event-row__items is-expanded">
            {events.map((e) => (
              <li key={e.id}><EventCard event={e} now={now} headingLevel={3} /></li>
            ))}
          </ul>
        ) : (
          <p>
            No upcoming events from {community.name} on BuilderBee right now. Follow them on their site to hear about
            the next one.
          </p>
        )}
      </section>
    </div>
  );
}
