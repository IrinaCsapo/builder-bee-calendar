import { useEffect } from 'react';
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

  return (
    <div className="container content-page">
      <h1>Submit an event</h1>
      <p className="content-page__lede">
        Know a hackathon, meetup or workshop that welcomes women and non-binary builders? Add it to the calendar.
      </p>

      {TALLY_FORM_ID ? (
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

      <h2>How it works</h2>
      <ol className="steps">
        <li>
          <strong>Fill in the form</strong>
          Name, dates, location, who it’s for and a registration link. It takes about two minutes.
        </li>
        <li>
          <strong>We check it</strong>
          We make sure the event is real, upcoming and open to women and non-binary builders.
        </li>
        <li>
          <strong>It goes live</strong>
          We add it to the calendar and the site updates within a few minutes.
        </li>
      </ol>

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
