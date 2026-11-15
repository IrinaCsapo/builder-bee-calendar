import { useId, useState } from 'react';
import { EnvelopeIcon } from '@heroicons/react/20/solid';
import { NEWSLETTER_FORM_URL } from '../../lib/site';
import './NewsletterSignup.css';

/**
 * Email box for the weekly round-up. It sends the address straight to our Brevo signup form
 * (double opt-in: Brevo emails a confirmation link), so BuilderBee itself never stores it.
 * Renders nothing until NEWSLETTER_FORM_URL is set.
 */
export function NewsletterSignup({ heading = 'Get new events every Monday', compact = false }: { heading?: string; compact?: boolean }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
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
    <section className={`newsletter${compact ? ' newsletter--compact' : ''}`} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="newsletter__heading">
        <EnvelopeIcon className="icon" aria-hidden="true" /> {heading}
      </h2>
      <p className="newsletter__intro">
        A short email with the latest hackathons, workshops and meetups for women, non-binary people and allies in
        tech. Unsubscribe any time. We never sell your data.
      </p>
      {state === 'done' ? (
        <p className="newsletter__done" role="status">
          Nearly there! Check your inbox for a confirmation email from BuilderBee and click the link in it.
        </p>
      ) : (
        <form className="newsletter__form" onSubmit={submit}>
          <label className="visually-hidden" htmlFor={`${id}-email`}>Email address</label>
          <input
            id={`${id}-email`} className="newsletter__input" type="email" name="EMAIL" required autoComplete="email"
            placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="newsletter__button hive-hover" disabled={state === 'sending'}>
            {state === 'sending' ? 'Signing up…' : 'Sign me up'}
          </button>
          {state === 'error' && (
            <p className="newsletter__error" role="alert">Something went wrong. Please try again in a moment.</p>
          )}
        </form>
      )}
      <p className="newsletter__small">
        See our <a href="/privacy">privacy policy</a>. Prefer your calendar? <a href="/subscribe#calendar">Subscribe there</a>.
      </p>
    </section>
  );
}
