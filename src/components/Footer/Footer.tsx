import { FOUNDERS } from '../../lib/site';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          BuilderBee Club. Made by builders{' '}
          {FOUNDERS.map((f, i) => (
            <span key={f.name}>
              {i > 0 && ' and '}
              <a href={f.linkedin} target="_blank" rel="noopener noreferrer">
                {f.name}<span className="visually-hidden"> on LinkedIn (opens in a new tab)</span>
              </a>
            </span>
          ))}
          , for builders.
        </p>
        <p>
          Know an event? <a href="/submit">Submit it</a>. Never miss one: <a href="/subscribe">subscribe to the calendar</a>.
        </p>
        <p className="footer__legal">
          <a href="/privacy">Privacy policy</a> · <a href="/cookies">Cookie policy</a>
        </p>
      </div>
    </footer>
  );
}
