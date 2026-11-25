import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';
import { useNow } from '../lib/timeLeft';
import { allCollections } from '../lib/collections';
import { inlineParts, type Guide } from '../data/guides';
import { EventCard } from '../components/EventCard/EventCard';
import { BrowseLinks } from '../components/BrowseLinks/BrowseLinks';
import { NewsletterSignup } from '../components/NewsletterSignup/NewsletterSignup';
import { NotFoundPage } from './NotFoundPage';
import { guideBySlug } from '../data/guides';
import '../components/EventList/EventList.css';
import './EventPage.css';
import './GuidePage.css';

const upcoming = getUpcoming(allEvents);
const COLLECTIONS = allCollections(allEvents);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

/** Text with [links](/path) turned into real links */
export function Inline({ text }: { text: string }) {
  return <>{inlineParts(text).map((p, i) => (p.href ? <a key={i} href={p.href}>{p.text}</a> : p.text))}</>;
}

/** Up to 6 events for a guide; if none match (the day is months away), the next events on the calendar */
export function guideEvents(g: Guide) {
  const matching = upcoming.filter(g.events);
  return matching.length ? { heading: g.eventsHeading, list: matching.slice(0, 6) } : { heading: 'Coming up on BuilderBee', list: upcoming.slice(0, 6) };
}

export function GuidePage({ slug }: { slug: string }) {
  const g = guideBySlug(slug);
  useDocumentTitle(g?.title);
  const now = useNow();
  if (!g) return <NotFoundPage />;
  const { heading, list } = guideEvents(g);
  const related = g.related.map((p) => COLLECTIONS.find((c) => c.path === p)).filter((c) => c !== undefined);

  return (
    <div className="container guide-page">
      <p className="event-page__back">
        <a href="/guides"><ArrowLeftIcon className="icon" aria-hidden="true" /> All guides</a>
      </p>
      <article className="guide-page__article" style={{ ['--group' as string]: g.colour }}>
        <header className="guide-page__head">
          <p className="guide-page__kicker">{g.kicker}</p>
          <h1>{g.title}</h1>
          <p className="guide-page__lede">{g.description}</p>
          <p className="guide-page__meta">By the BuilderBee team · Updated {longDate(g.updated)}</p>
        </header>
        {g.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.blocks.map((b, i) =>
              typeof b === 'string'
                ? <p key={i}><Inline text={b} /></p>
                : <ul key={i}>{b.map((item) => <li key={item}><Inline text={item} /></li>)}</ul>,
            )}
          </section>
        ))}
        {related.length > 0 && (
          <p className="guide-page__related">
            Browse:{' '}
            {related.map((c, i) => (
              <span key={c.path}>{i > 0 && ' · '}<a href={c.path}>{c.title}</a></span>
            ))}
          </p>
        )}
      </article>

      <section aria-labelledby="guide-events">
        <div className="event-row__head">
          <h2 id="guide-events" className="event-row__title">{heading}</h2>
        </div>
        <ul className="event-row__items is-expanded">
          {list.map((e) => (
            <li key={e.id}><EventCard event={e} now={now} headingLevel={3} /></li>
          ))}
        </ul>
      </section>

      <section aria-label="Weekly email">
        <NewsletterSignup />
      </section>

      <BrowseLinks />
    </div>
  );
}

/** /guides: the list of guides */
export function GuidesPage({ guides }: { guides: Guide[] }) {
  useDocumentTitle('Guides');
  return (
    <div className="container guide-page">
      <header className="guide-page__head">
        <p className="guide-page__kicker">Guides</p>
        <h1>Guides for women and non-binary builders</h1>
        <p className="guide-page__lede">
          Short, practical guides: what to expect at your first hackathon, and the days in the year that celebrate
          women in tech, with the events that go with them.
        </p>
      </header>
      <ul className="guide-list">
        {guides.map((g) => (
          <li key={g.slug} style={{ ['--group' as string]: g.colour }}>
            <p className="guide-page__kicker">{g.kicker}</p>
            <h2><a href={`/guides/${g.slug}`}>{g.title}</a></h2>
            <p>{g.description}</p>
          </li>
        ))}
      </ul>
      <BrowseLinks />
    </div>
  );
}
