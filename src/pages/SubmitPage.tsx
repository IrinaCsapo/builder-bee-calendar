import { useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SUBMIT_FORM_URL, SUBMISSIONS_URL, TALLY_FORM_ID } from '../lib/site';
import './ContentPage.css';

export function SubmitPage() {
  useDocumentTitle('Submit an event');

  // Tally's script resizes the form to fit its questions, so there's no inner scrollbar
  useEffect(() => {
    if (!TALLY_FORM_ID) return;
    const w = window as unknown as { Tally?: { loadEmbeds: () => void } };
    if (w.Tally) { w.Tally.loadEmbeds(); return; }
    if (document.querySelector('script[src="https://tally.so/widgets/embed.js"]')) return;  // already loading
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    script.onload = () => w.Tally?.loadEmbeds();
    document.body.appendChild(script);
  }, []);

  // When the form is sent, Tally tells this page (a 'Tally.FormSubmitted' message). We then swap the form
  // for our own thank-you, so Tally's free-plan "make your own form" screen doesn't stay on screen.
  const [sent, setSent] = useState(false);
  const thanks = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://tally.so' || typeof e.data !== 'string' || !e.data.includes('Tally.FormSubmitted')) return;
      setSent(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  useEffect(() => {
    if (!sent || !thanks.current) return;
    thanks.current.scrollIntoView({ block: 'center' });
    thanks.current.focus();
  }, [sent]);

  return (
    <div className="container content-page">
      <h1>Submit an event</h1>
      <p className="content-page__lede">
        Know a hackathon, meetup or workshop that welcomes women and non-binary builders? Add it to the calendar.
      </p>

      {TALLY_FORM_ID && sent ? (
        <div ref={thanks} className="submit-thanks" tabIndex={-1} role="status">
          <p className="submit-thanks__icon" aria-hidden="true">🐝</p>
          <h2>Thank you, it’s on its way to the hive!</h2>
          <p>
            We’ll check your event and add it to the calendar, usually within a day or two. If you left your email,
            we’ll let you know when it’s live.
          </p>
          <div className="submit-thanks__actions">
            <a className="cta hive-hover" href="#/">Browse events</a>
            <button type="button" className="submit-thanks__again" onClick={() => setSent(false)}>
              Submit another event
            </button>
          </div>
        </div>
      ) : TALLY_FORM_ID ? (
        <>
          <iframe
            className="submit-form"
            data-tally-src={`https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
            src={`https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
            width="100%"
            height="2400"
            title="Submit an event form"
          />
          <p className="content-page__small">
            <strong>We don’t sell your data to anybody.</strong> See our <a href="#/privacy">privacy policy</a>.
          </p>
          <p className="content-page__small">
            No account needed. Prefer GitHub?{' '}
            <a href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer">
              Use the GitHub form<span className="visually-hidden"> (opens in a new tab)</span>
            </a>.
          </p>
        </>
      ) : (
        <>
          <a className="cta hive-hover" href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer">
            Open the submission form
            <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> (opens GitHub in a new tab)</span>
          </a>
          <p className="content-page__small">The form is on GitHub. You’ll need a free GitHub account to send it.</p>
        </>
      )}

      <p className="content-page__small">
        Wondering what happens next? See <a href="#/how-it-works">how it works</a>.
      </p>

      <h2>What we list</h2>
      <ul>
        <li>Hackathons, buildathons, meetups, conferences, workshops, bootcamps and pitch nights</li>
        <li>Online, in person or hybrid, anywhere in the world</li>
        <li>Events open to women and non-binary builders, whether women-only or explicitly inclusive</li>
        <li>Free and paid events. We show the cost clearly.</li>
      </ul>

      <h2>Already submitted?</h2>
      <p>
        {TALLY_FORM_ID && 'If you left your email, we’ll let you know when your event is live. '}
        Submissions made on GitHub are all{' '}
        <a href={SUBMISSIONS_URL} target="_blank" rel="noopener noreferrer">listed there
        <span className="visually-hidden"> (opens in a new tab)</span></a>, including whether each has been added.
      </p>
    </div>
  );
}
