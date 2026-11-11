import { useEffect, useRef, useState } from 'react';
import { useHashRoute } from '../../lib/useHashRoute';
import logo from '../../assets/builderbee-logo.svg';
import './Header.css';

const NAV = [
  { href: '#/', path: '/', label: 'Events' },
  { href: '#/communities', path: '/communities', label: 'Communities' },
  { href: '#/how-it-works', path: '/how-it-works', label: 'How it works' },
  { href: '#/about', path: '/about', label: 'About' },
  // Last, shown as an outlined button
  { href: '#/submit', path: '/submit', label: 'Submit an event', button: true },
];

export function Header() {
  const { path } = useHashRoute();
  // Event detail pages count as part of "Events"
  const section = path.startsWith('/event/') ? '/' : path;

  // The header stays at the top of the screen. It slides away while you scroll down
  // (more room to read) and comes back as soon as you scroll up.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 80) setHidden(false);                 // always shown near the top
        else if (y > last + 6) setHidden(true);       // scrolling down
        else if (y < last - 6) setHidden(false);      // scrolling up
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Share the header's height (it wraps onto two lines on phones) so the hero can sit under it
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // Phones: the page links sit behind a Menu button
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  // New page: show the header again and close the menu
  useEffect(() => { setHidden(false); setMenuOpen(false); }, [path]);

  const links = NAV.filter((item) => !item.button);
  const submit = NAV.find((item) => item.button)!;

  return (
    <header ref={ref} className={`header${hidden ? ' is-hidden' : ''}`}>
      <div className="container header__inner">
        <a className="header__brand" href="#/">
          {/* The logo reads "BuilderBee", so that's its text alternative (plus where the link goes) */}
          <img className="header__logo" src={logo} alt="BuilderBee, home" width={1286} height={324} />
        </a>
        <nav aria-label="Main" className="header__navbar">
          <ul id="main-menu" className={`header__nav${menuOpen ? ' is-open' : ''}`}>
            {links.map((item) => (
              <li key={item.href}>
                <a className="header__link" href={item.href} aria-current={section === item.path ? 'page' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="header__link header__link--button hive-hover hive-hover--on-light"
            href={submit.href} aria-current={section === submit.path ? 'page' : undefined}>
            <span className="header__submit-long">{submit.label}</span>
            <span className="header__submit-short" aria-hidden="true">Submit</span>
          </a>
          <button
            type="button" className="header__menu" aria-expanded={menuOpen} aria-controls="main-menu"
            onClick={() => setMenuOpen((o) => !o)}>
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span> Menu
          </button>
        </nav>
      </div>
    </header>
  );
}
