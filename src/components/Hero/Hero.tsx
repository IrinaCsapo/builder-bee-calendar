import type { ReactNode } from 'react';
import { SearchBox } from '../SearchBox/SearchBox';
import heroBg from '../../assets/hero-bg.jpg';
import heroBgSmall from '../../assets/hero-bg-small.jpg';
import './Hero.css';

interface HeroProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onBrowse: () => void;
  /** The featured events card, which overlaps the bottom of the gradient. */
  featured: ReactNode;
}

export function Hero({ query, onQueryChange, onSearch, onBrowse, featured }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div
        className="hero__top"
        // Decorative background; the small file is used on phones (see Hero.css)
        style={{ ['--hero-bg' as string]: `url(${heroBg})`, ['--hero-bg-small' as string]: `url(${heroBgSmall})` }}
      >
        <div className="container hero__inner">
          <h1 id="hero-title" className="hero__title">Find your next hackathon</h1>
          <p className="hero__lede">
            Hackathons, buildathons, meetups and workshops for women and non-binary builders.
            <br className="hero__break" /> Online and around the world.
          </p>
          <div className="hero__actions">
            <button type="button" className="hero__button hero__button--browse" onClick={onBrowse}>
              Browse events
            </button>
            <a className="hero__button hero__button--submit" href="#/submit">Submit event</a>
          </div>
        </div>
      </div>

      <div className="container hero__featured">{featured}</div>

      <div className="container hero__search">
        <SearchBox value={query} onChange={onQueryChange} onSubmit={onSearch} />
      </div>
    </section>
  );
}
