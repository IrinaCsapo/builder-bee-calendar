import { useHashRoute } from '../../lib/useHashRoute';
import './Header.css';

const NAV = [
  { href: '#/', path: '/', label: 'Events' },
  { href: '#/submit', path: '/submit', label: 'Submit an event' },
  { href: '#/about', path: '/about', label: 'About' },
];

export function Header() {
  const { path } = useHashRoute();
  // Event detail pages count as part of "Events"
  const section = path.startsWith('/event/') ? '/' : path;
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
                <a className="header__link" href={item.href} aria-current={section === item.path ? 'page' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
