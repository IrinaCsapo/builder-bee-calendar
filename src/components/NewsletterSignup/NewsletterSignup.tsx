import { useId, useMemo } from 'react';
import { ArrowsRightLeftIcon, CheckCircleIcon, ComputerDesktopIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/20/solid';
import { CONFIRM_MESSAGE, useNewsletterSignup } from '../../lib/newsletter';
import { allEvents } from '../../lib/events';
import { getUpcoming } from '../../lib/dates';
import { DateBlock } from '../DateBlock/DateBlock';
import heroBg from '../../assets/hero-bg.jpg';
import './NewsletterSignup.css';

const FORMAT_ICON = { Online: ComputerDesktopIcon, 'In person': UserGroupIcon, Hybrid: ArrowsRightLeftIcon } as const;

/**
 * Email box for the weekly round-up. It sends the address straight to our Brevo signup form
 * (double opt-in: Brevo emails a confirmation link), so BuilderBee itself never stores it.
 * Renders nothing until NEWSLETTER_FORM_URL is set.
 */
export function NewsletterSignup({ heading = 'Get new events every Monday' }: { heading?: string }) {
  const id = useId();
  const { email, setEmail, state, submit, enabled } = useNewsletterSignup();
  const preview = useMemo(() => getUpcoming(allEvents).slice(0, 3), []);
  if (!enabled) return null;

  return (
    <div className="newsletter-wrap">
    <section className="newsletter" aria-labelledby={`${id}-h`} style={{ ['--newsletter-bg' as string]: `url(${heroBg})` }}>
      <div className="newsletter__main">
        <p className="newsletter__kicker">The weekly email</p>
        <h2 id={`${id}-h`} className="newsletter__heading">{heading}</h2>
        <p className="newsletter__intro">
          The latest hackathons, workshops and meetups for women, non-binary people and allies in tech, in one short
          email. Unsubscribe any time. We never sell your data.
        </p>

        {state === 'done' ? (
          <p className="newsletter__done" role="status">
            <CheckCircleIcon className="icon" aria-hidden="true" />
            <span>{CONFIRM_MESSAGE}</span>
          </p>
        ) : (
          <form className="newsletter__form" onSubmit={submit}>
            <label className="visually-hidden" htmlFor={`${id}-email`}>Email address</label>
            <div className="newsletter__field">
              <input
                id={`${id}-email`} className="newsletter__input" type="email" name="EMAIL" required autoComplete="email"
                data-1p-ignore data-lpignore="true"
                placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter__button hive-hover" disabled={state === 'sending'}>
                {state === 'sending' ? 'Signing up…' : 'Sign me up'}
              </button>
            </div>
            {state === 'error' && (
              <p className="newsletter__error" role="alert">Something went wrong. Please try again in a moment.</p>
            )}
          </form>
        )}
        <p className="newsletter__small">
          See our <a href="/privacy">privacy policy</a>. Prefer your calendar? <a href="/subscribe#calendar">Subscribe there</a>.
        </p>
      </div>

      {preview.length > 0 && (
        <div className="newsletter__preview" aria-label="Coming up next">
          {preview.map((e) => (
            <a key={e.id} className="newsletter__mini" href={`/event/${e.id}`}>
              <DateBlock start={e.start_date} end={e.end_date} />
              <div>
                <p className="newsletter__mini-title">{e.title}</p>
                <p className="newsletter__mini-org">{e.organiser}</p>
                <p className="newsletter__mini-tags">
                  {(() => { const Icon = FORMAT_ICON[e.format]; return <span className="newsletter__mini-tag"><Icon className="icon" aria-hidden="true" />{e.format}</span>; })()}
                  {e.format !== 'Online' && (e.city || e.country) && (
                    <span className="newsletter__mini-tag">
                      <MapPinIcon className="icon" aria-hidden="true" />
                      {[e.city, e.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
    </div>
  );
}
