import { useId, useMemo, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { NEWSLETTER_FORM_URL } from '../../lib/site';
import { allEvents } from '../../lib/events';
import { getUpcoming } from '../../lib/dates';
import { DateBlock } from '../DateBlock/DateBlock';
import './NewsletterSignup.css';

/**
 * Email box for the weekly round-up. It sends the address straight to our Brevo signup form
 * (double opt-in: Brevo emails a confirmation link), so BuilderBee itself never stores it.
 * Renders nothing until NEWSLETTER_FORM_URL is set.
 */
export function NewsletterSignup({ heading = 'Get new events every Monday' }: { heading?: string }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  // A peek at what the email looks like: the next few events, as mini cards (decorative)
  const preview = useMemo(() => getUpcoming(allEvents).slice(0, 3), []);
  if (!NEWSLETTER_FORM_URL) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const body = new FormData();
    body.append('EMAIL', email.trim());
    body.append('email_address_check', '');   // Brevo's spam trap: must stay empty
    body.append('locale', 'en');
    try {
      // Brevo doesn't allow reading the reply from another site, so a sent request counts as success
      await fetch(NEWSLETTER_FORM_URL, { method: 'POST', body, mode: 'no-cors' });
      setState('done');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="newsletter-wrap">
    <section className="newsletter" aria-labelledby={`${id}-h`}>
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
            <span>Nearly there! Check your inbox for a confirmation email from BuilderBee and click the link in it.</span>
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
        <div className="newsletter__preview" aria-hidden="true">
          {preview.map((e) => (
            <div key={e.id} className="newsletter__mini">
              <DateBlock start={e.start_date} end={e.end_date} />
              <div>
                <p className="newsletter__mini-title">{e.title}</p>
                <p className="newsletter__mini-org">{e.organiser}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
    </div>
  );
}
