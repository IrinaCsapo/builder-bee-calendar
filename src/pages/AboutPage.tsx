import { ArrowRightIcon, ArrowUpRightIcon } from '@heroicons/react/20/solid';
import { CodeBracketIcon, LockClosedIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { FOUNDERS, REPO_URL } from '../lib/site';
import { PixelBee } from '../components/PixelBee/PixelBee';
import './HowItWorksPage.css';
import './AboutPage.css';

// Where events for women in tech usually hide, before BuilderBee
const SCATTERED = ['University sites', 'Meetup pages', 'Luma calendars', 'Newsletters', 'Group chats', 'LinkedIn posts'];
const FOUNDER_COLOURS = ['#7B00DA', '#FF6600'];

export function AboutPage() {
  useDocumentTitle('About');

  return (
    <div className="container how about">
      <header className="about__intro">
        <div>
          <p className="how__kicker">About</p>
          <h1>Welcome to the hive</h1>
          <p className="how__lede">
            One place to find hackathons and tech events for women and non-binary builders, so you can find something
            to join this month in under 30 seconds.
          </p>
        </div>
        <div className="about__bee-tile" aria-hidden="true">
          <PixelBee className="about__bee" />
        </div>
      </header>

      <section className="how__section about__story" aria-labelledby="about-why">
        <div>
          <h2 id="about-why">Why we built it</h2>
          <p>
            We’re two women who met at the Lovable SheBuilds hackathon. It was one of those weekends where you leave
            with a project, a few new friends and a strong urge to do it again.
          </p>
          <blockquote className="about__quote">The hard part was finding the next one.</blockquote>
        </div>
        <ul className="about__founders" aria-label="The founders">
          {FOUNDERS.map((f, i) => (
            <li key={f.name} className="about__founder">
              <span className="about__avatar" style={{ background: FOUNDER_COLOURS[i % FOUNDER_COLOURS.length] }} aria-hidden="true">
                {f.name[0]}
              </span>
              <span>
                <strong>{f.name}</strong>
                <span className="about__role">Co-founder</span>
              </span>
              {f.linkedin && (
                <a className="about__linkedin" href={f.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn <ArrowUpRightIcon className="icon" aria-hidden="true" />
                  <span className="visually-hidden"> ({f.name}, opens in a new tab)</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="how__section" aria-labelledby="about-problem">
        <h2 id="about-problem">Every event, one list</h2>
        <p className="about__text">
          Events for women and non-binary builders are out there, but they’re scattered. So we built the calendar we
          wished we’d had: every event in one list, filterable by format, place, theme and cost.
        </p>
        <div className="about__flow">
          <ul className="about__scattered" aria-label="Where events used to hide">
            {SCATTERED.map((s, i) => <li key={s} style={{ ['--tilt' as string]: `${[-3, 2, -1.5, 3, -2, 1.5][i]}deg` }}>{s}</li>)}
          </ul>
          <ArrowRightIcon className="about__arrow" aria-hidden="true" />
          <a className="about__one" href="/">
            <PixelBee className="about__one-bee" /> BuilderBee
          </a>
        </div>
      </section>

      <section className="how__section" aria-labelledby="about-values">
        <h2 id="about-values" className="visually-hidden">What we care about</h2>
        <ul className="about__values">
          <li style={{ ['--step' as string]: '#0006FA' }}>
            <span className="how__step-icon"><LockClosedIcon aria-hidden="true" /></span>
            <h3>Your privacy</h3>
            <p>
              We collect as little personal data about you as we can, to keep BuilderBee safe and secure for everyone.
              We never sell your data or give it to anyone else. <a href="/privacy">Privacy policy</a>
            </p>
          </li>
          <li style={{ ['--step' as string]: '#21B700' }}>
            <span className="how__step-icon"><PlusCircleIcon aria-hidden="true" /></span>
            <h3>Help it grow</h3>
            <p>
              The calendar is only as good as the events in it. Know one we’re missing? <a href="/submit">Submit it</a>.
            </p>
          </li>
          <li style={{ ['--step' as string]: '#FE06E5' }}>
            <span className="how__step-icon"><CodeBracketIcon aria-hidden="true" /></span>
            <h3>Built in the open</h3>
            <p>
              The code is open on{' '}
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub<span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              , so anyone can see how it works.
            </p>
          </li>
        </ul>
      </section>

      <section className="how__end" aria-labelledby="about-end">
        <h2 id="about-end">Find something to join this month</h2>
        <div className="how__actions">
          <a className="how__button how__button--dark hive-hover" href="/">Browse events</a>
          <a className="how__button how__button--light hive-hover hive-hover--on-light" href="/how-it-works">How it works</a>
        </div>
      </section>
    </div>
  );
}
