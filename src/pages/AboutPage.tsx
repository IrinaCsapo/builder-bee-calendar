import { useDocumentTitle } from '../lib/useDocumentTitle';
import { REPO_URL, SHOW_NAME, SHOW_URL } from '../lib/site';
import './ContentPage.css';

export function AboutPage() {
  useDocumentTitle('About');
  const showIsExternal = SHOW_URL.startsWith('http');

  return (
    <div className="container content-page">
      <h1>About Builder Bee Calendar</h1>
      <p className="content-page__lede">
        One place to find hackathons and tech events for women and non-binary builders, so you can find something to
        join this month in under 30 seconds.
      </p>

      <h2>Why we built it</h2>
      <p>
        We met at the Lovable SheBuilds hackathon. It was one of those weekends where you leave with a project, a few new
        friends and a strong urge to do it again. The hard part was finding the next one.
      </p>
      <p>
        Events for women and non-binary builders are out there, but they’re scattered across university sites, Meetup
        pages, newsletters and group chats. So we built the calendar we wished we’d had: every event in one list,
        filterable by format, place, theme and cost.
      </p>

      <h2>Built live</h2>
      <p>
        We built this site live on{' '}
        {showIsExternal ? (
          <a href={SHOW_URL} target="_blank" rel="noopener noreferrer">
            {SHOW_NAME}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        ) : (
          SHOW_NAME
        )}
        , in about three hours, one small step at a time.
      </p>

      <h2>Help it grow</h2>
      <p>
        The calendar is only as good as the events in it. If you know one we’re missing,{' '}
        <a href="#/submit">submit it</a>. The code is open on{' '}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        .
      </p>

      <a className="cta" href="#/">
        Find an event
      </a>
    </div>
  );
}
