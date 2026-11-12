import { useDocumentTitle } from '../lib/useDocumentTitle';
import './ContentPage.css';

const UPDATED = '12 November 2026';

export function PrivacyPage() {
  useDocumentTitle('Privacy policy');
  return (
    <div className="container content-page">
      <h1>Privacy policy</h1>
      <p className="content-page__lede">
        BuilderBee is a free calendar of events. We collect as little as we can, and we don’t sell your data to
        anybody.
      </p>
      <p className="content-page__small">Last updated {UPDATED}.</p>

      <h2>Browsing the calendar</h2>
      <ul>
        <li>You don’t need an account, and there are no advertising trackers.</li>
        <li>
          We count visits with <a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer">Umami<span
          className="visually-hidden"> (privacy policy, opens in a new tab)</span></a>, a privacy-friendly analytics
          tool. It doesn’t use cookies or collect personal data. It records things like which pages are viewed, the
          referring site, and your browser, device type and country, all anonymously, so we can see what’s useful.
        </li>
        <li>
          To show events near you first, the site guesses your area from your device’s time zone. If you choose
          “Use my exact location”, your browser asks for permission first. Either way, your location stays on your
          device: it is never sent to us, stored, or put in the page address.
        </li>
        <li>Filters and searches are kept in the page address so you can share them. We don’t record them.</li>
      </ul>

      <h2>Submitting an event</h2>
      <ul>
        <li>
          The form on the Submit page is run by <a href="https://tally.so/help/privacy-policy" target="_blank"
          rel="noopener noreferrer">Tally<span className="visually-hidden"> (privacy policy, opens in a new tab)</span></a>,
          which stores the answers for us.
        </li>
        <li>
          The event details you send (name, dates, place, link, organiser and so on) are published on the calendar
          if we list the event.
        </li>
        <li>
          Your email is optional. We only use it to tell you when your event is live, never for marketing, and we
          delete it once we’ve done that.
        </li>
        <li>
          If you submit through GitHub instead, your submission is a public GitHub issue under your GitHub username.
        </li>
      </ul>

      <h2>Services we use</h2>
      <ul>
        <li>
          <strong>GitHub Pages</strong> hosts the site. Like any web host, it logs technical details such as IP
          addresses to keep the service running and secure. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank" rel="noopener noreferrer">GitHub’s privacy statement<span className="visually-hidden"> (opens in a new tab)</span></a>.
        </li>
        <li>
          <strong>Google Fonts</strong> serves the site’s fonts, so your browser connects to Google to download them.
          See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy
          policy<span className="visually-hidden"> (opens in a new tab)</span></a>.
        </li>
        <li><strong>Umami</strong> gives us anonymous visit counts (see above).</li>
        <li><strong>Tally</strong> runs the submission form (see above).</li>
        <li>
          Event pages link to organisers’ own sites. When you register, you do it there, under their privacy policy.
          BuilderBee never asks for your details to sign you up.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        BuilderBee itself doesn’t set any cookies. See the <a href="#/cookies">cookie policy</a> for the details.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us what we hold about you, or ask us to correct or delete it, for example your email from a
        submission. Get in touch with the team through the links on the <a href="#/about">About</a> page and we’ll
        sort it out.
      </p>

      <h2>Changes</h2>
      <p>If we change how we handle data, we’ll update this page and the date at the top.</p>
    </div>
  );
}
