import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>BuilderBee. Made by builders, for builders.</p>
        <p>
          Know an event? <a href="#/submit">Submit it</a>.
        </p>
        <p className="footer__legal">
          <a href="#/privacy">Privacy policy</a> · <a href="#/cookies">Cookie policy</a>
        </p>
      </div>
    </footer>
  );
}
