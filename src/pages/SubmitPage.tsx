import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon } from '@heroicons/react/20/solid';
import { ClockIcon, GiftIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SUBMIT_FORM_URL, SUBMISSIONS_URL, TALLY_FORM_ID } from '../lib/site';
import { PixelBee } from '../components/PixelBee/PixelBee';
import './HowItWorksPage.css';
import './AboutPage.css';
import './SubmitPage.css';

const WE_LIST = [
  'Hackathons, buildathons, workshops, bootcamps, meetups, conferences and pitch nights',
  'Online, in person or hybrid, anywhere in the world',
  'For women and/or non-binary people in tech (allies welcome too)',
  'Free or paid: we show the cost clearly',
];

// What happens after sending, in the hero-lab colours
const NEXT = [
  { colour: '#7B00DA', title: 'We check it', text: 'That it’s real, upcoming, and the registration link works.' },
  { colour: '#FF6600', title: 'It goes live', text: 'Usually within a day or two. If you left your email, we’ll tell you.' },
  { colour: '#21B700', title: 'It’s in the weekly email', text: 'Every subscriber hears about it the next Monday.' },
];

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
    <div className="container how submit">
      <header className="how__intro">
        <p className="how__kicker">Submit an event</p>
        <h1>Know an event we’re missing?</h1>
        <p className="how__lede">
          Hackathons, workshops, meetups: if it’s for women and non-binary builders, we’d love to list it. Tell us
          about it and we’ll add it to the calendar.
        </p>
        <ul className="submit__promises" aria-label="Good to know">
          <li><ClockIcon aria-hidden="true" /> About 2 minutes</li>
          <li><UserIcon aria-hidden="true" /> No account needed</li>
          <li><GiftIcon aria-hidden="true" /> Free to list</li>
        </ul>
      </header>

      <div className="submit__layout">
        {/* ---- The form (or our thank-you once it's sent) ---- */}
        <section className="submit__form-card" aria-label="Submission form">
          {TALLY_FORM_ID && sent ? (
            <div ref={thanks} className="submit-thanks" tabIndex={-1} role="status">
              <div className="submit-thanks__bee" aria-hidden="true"><PixelBee className="about__bee" /></div>
              <h2>Thank you, it’s on its way to the hive!</h2>
              <p>
                We’ll check your event and add it to the calendar, usually within a day or two. If you left your
                email, we’ll let you know when it’s live.
              </p>
              <div className="how__actions">
                <a className="how__button how__button--dark hive-hover" href="/">Browse events</a>
                <button type="button" className="how__button how__button--light" onClick={() => setSent(false)}>
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
              <p className="submit__small">
                <LockClosedIcon className="icon" aria-hidden="true" />
                <span>
                  <strong>We never sell your data or give it to anyone else.</strong> See our{' '}
                  <a href="/privacy">privacy policy</a>. Prefer GitHub?{' '}
                  <a href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer">
                    Use the GitHub form<span className="visually-hidden"> (opens in a new tab)</span>
                  </a>.
                </span>
              </p>
            </>
          ) : (
            <div className="submit-thanks">
              <h2>Send it on GitHub</h2>
              <p>The form is on GitHub. You’ll need a free GitHub account to send it.</p>
              <div className="how__actions">
                <a className="how__button how__button--dark hive-hover" href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Open the submission form <ArrowUpRightIcon className="icon" aria-hidden="true" />
                  <span className="visually-hidden"> (opens GitHub in a new tab)</span>
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ---- What we list, what happens next ---- */}
        <aside className="submit__side" aria-label="About submitting">
          <section className="submit__panel" aria-labelledby="submit-list">
            <h2 id="submit-list">What we list</h2>
            <ul className="submit__checks">
              {WE_LIST.map((item) => (
                <li key={item}><CheckIcon className="icon" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
          </section>

          <section className="submit__panel" aria-labelledby="submit-next">
            <h2 id="submit-next">What happens next</h2>
            <ol className="submit__steps">
              {NEXT.map((s, i) => (
                <li key={s.title} style={{ ['--step' as string]: s.colour }}>
                  <span className="submit__num" aria-hidden="true">{i + 1}</span>
                  <span><strong>{s.title}</strong>{s.text}</span>
                </li>
              ))}
            </ol>
            <a className="submit__more" href="/how-it-works">
              How it works <ArrowRightIcon className="icon" aria-hidden="true" />
            </a>
          </section>

          <section className="submit__panel submit__panel--soft" aria-labelledby="submit-already">
            <h2 id="submit-already">Already sent one?</h2>
            <p>
              {TALLY_FORM_ID && 'If you left your email, we’ll let you know when it’s live. '}
              Submissions made on GitHub are{' '}
              <a href={SUBMISSIONS_URL} target="_blank" rel="noopener noreferrer">
                all listed there<span className="visually-hidden"> (opens in a new tab)</span>
              </a>, with whether each has been added.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
