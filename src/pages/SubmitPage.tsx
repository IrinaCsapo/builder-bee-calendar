import { useDocumentTitle } from '../lib/useDocumentTitle';
import { SUBMIT_FORM_URL, SUBMISSIONS_URL } from '../lib/site';
import './ContentPage.css';

export function SubmitPage() {
  useDocumentTitle('Submit an event');
  return (
    <div className="container content-page">
      <h1>Submit an event</h1>
      <p className="content-page__lede">
        Know a hackathon, meetup or workshop that welcomes women and non-binary builders? Add it to the calendar.
      </p>

      <a className="cta" href={SUBMIT_FORM_URL} target="_blank" rel="noopener noreferrer">
        Open the submission form
        <span aria-hidden="true">↗</span>
        <span className="visually-hidden"> (opens GitHub in a new tab)</span>
      </a>
      <p className="content-page__small">The form is on GitHub. You’ll need a free GitHub account to send it.</p>

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
          We add it to the calendar and the site updates within a few minutes. We’ll comment on your submission when it’s up.
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
        You can <a href={SUBMISSIONS_URL} target="_blank" rel="noopener noreferrer">see all submissions on GitHub
        <span className="visually-hidden"> (opens in a new tab)</span></a>, including whether yours has been added.
      </p>
    </div>
  );
}
