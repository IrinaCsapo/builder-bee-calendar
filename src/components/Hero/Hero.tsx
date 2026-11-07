import { SearchBox } from '../SearchBox/SearchBox';
import './Hero.css';

interface HeroProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export function Hero({ query, onQueryChange, onSearch }: HeroProps) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <h1 id="hero-title" className="hero__title">
          Find your next hackathon, <span className="hero__highlight">this month</span>.
        </h1>
        <p className="hero__lede">
          Hackathons, buildathons, meetups and workshops for women and non-binary builders. Online and around the world.
        </p>
        <div className="hero__search">
          <SearchBox value={query} onChange={onQueryChange} onSubmit={onSearch} />
        </div>
      </div>
    </section>
  );
}
