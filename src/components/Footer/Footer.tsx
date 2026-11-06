import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>Builder Bee Calendar. Made by builders, for builders.</p>
        <p>
          Know an event? <a href="#/submit">Submit it</a>.
        </p>
      </div>
    </footer>
  );
}
