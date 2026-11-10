import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { applyFilters, EMPTY_FILTERS, filtersToQuery } from '../lib/filters';
import { COMMUNITY_GROUPS } from '../data/communities';
import './ContentPage.css';
import './CommunitiesPage.css';

const upcoming = getUpcoming(allEvents);

/** How many upcoming events on BuilderBee match a group's search, and the link to them */
function eventsFor(search: string) {
  const filters = { ...EMPTY_FILTERS, query: search };
  return { count: applyFilters(upcoming, filters).length, href: `#/?${filtersToQuery(filters)}` };
}

const total = COMMUNITY_GROUPS.reduce((n, g) => n + g.communities.length, 0);

export function CommunitiesPage() {
  useDocumentTitle('Communities');

  return (
    <div className="container content-page communities">
      <h1>Find your people</h1>
      <p className="content-page__lede">
        {total} groups and organisations that run events for women, non-binary people and allies in tech. Follow the
        ones you like so you hear about their next event first.
      </p>

      {COMMUNITY_GROUPS.map((group) => {
        const headingId = `group-${group.title.toLowerCase().replace(/[^a-z]+/g, '-')}`;
        return (
          <section key={group.title} aria-labelledby={headingId}>
            <h2 id={headingId}>{group.title}</h2>
            <ul className="communities__list">
              {group.communities.map((c) => {
                const events = c.search ? eventsFor(c.search) : null;
                return (
                  <li key={c.url} className="community-card">
                    <h3 className="community-card__name">
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {c.name}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </h3>
                    <p className="community-card__where">{c.where}</p>
                    <p className="community-card__about">{c.about}</p>
                    {events && events.count > 0 && (
                      <a className="community-card__events" href={events.href}>
                        {events.count} upcoming {events.count === 1 ? 'event' : 'events'}
                        <span className="visually-hidden"> by {c.name} on BuilderBee</span>
                        <span aria-hidden="true"> →</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <h2>Know a group we’re missing?</h2>
      <p>
        Submit one of their events and we’ll add them here too. Our daily event scout also checks many of these groups
        every morning.
      </p>
      <a className="cta hive-hover" href="#/submit">
        Submit an event
      </a>
    </div>
  );
}
