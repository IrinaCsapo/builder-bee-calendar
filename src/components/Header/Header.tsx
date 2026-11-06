import './Header.css';

const NAV = [
  { href: '#/', label: 'Events' },
  { href: '#/submit', label: 'Submit an event' },
  { href: '#/about', label: 'About' },
];

export function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="header__brand" href="#/">
          <span className="header__mark" aria-hidden="true">🐝</span>
          Builder Bee Calendar
        </a>
        <nav aria-label="Main">
          <ul className="header__nav">
            {NAV.map((item) => (
              <li key={item.href}>
                <a className="header__link" href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
