import { useDocumentTitle } from '../lib/useDocumentTitle';
import './ContentPage.css';

const UPDATED = '12 November 2026';

export function CookiesPage() {
  useDocumentTitle('Cookie policy');
  return (
    <div className="container content-page">
      <h1>Cookie policy</h1>
      <p className="content-page__lede">
        BuilderBee doesn’t set any cookies, and there’s no advertising or tracking across sites. That’s why you
        don’t see a cookie banner.
      </p>
      <p className="content-page__small">Last updated {UPDATED}.</p>

      <h2>On the calendar</h2>
      <p>
        Browsing events, searching and filtering use no cookies or similar storage. Your filters live in the page
        address, and your location (if you share it) stays on your device.
      </p>

      <h2>Visit counts</h2>
      <p>
        We use <a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer">Umami<span
        className="visually-hidden"> (privacy policy, opens in a new tab)</span></a> to count visits anonymously. It
        doesn’t use cookies or store anything on your device, and it doesn’t follow you to other sites.
      </p>

      <h2>On the Submit page</h2>
      <p>
        The submission form is provided by Tally and loads from tally.so. Tally may use cookies or similar storage
        that are needed for the form to work, such as keeping your answers while you fill it in. Tally explains
        this in its <a href="https://tally.so/help/privacy-policy" target="_blank" rel="noopener noreferrer">privacy
        policy<span className="visually-hidden"> (opens in a new tab)</span></a>. If you’d rather avoid it, you can
        submit through GitHub instead.
      </p>

      <h2>Fonts</h2>
      <p>
        The site’s fonts come from Google Fonts. Your browser downloads them from Google; this doesn’t set cookies
        on BuilderBee.
      </p>

      <h2>Questions</h2>
      <p>
        See our <a href="#/privacy">privacy policy</a>, or get in touch through the <a href="#/about">About</a> page.
      </p>
    </div>
  );
}
