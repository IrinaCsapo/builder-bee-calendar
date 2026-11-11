import type { ReactNode } from 'react';
import { HivePattern, WakeHivePattern } from '../HivePattern/HivePattern';
import { FlyingBees } from '../FlyingBee/FlyingBee';
import heroBg from '../../assets/hero-bg.jpg';
import { WordRotator } from './WordRotator';
import './Hero.css';

// The headline's last word changes; it starts and ends on "hackathon"
const WORDS = ['hackathon', 'workshop', 'buildathon', 'meetup', 'bootcamp', 'conference', 'pitch night'];

interface HeroProps {
  onBrowse: () => void;
  /** The featured events card, which overlaps the bottom of the gradient. */
  featured: ReactNode;
  /** 'lab' is the test version at #/hero-lab: the honeycomb reacts to the pointer */
  variant?: 'live' | 'lab';
}

export function Hero({ onBrowse, featured, variant = 'live' }: HeroProps) {
  return (
    <section
      className={`hero${variant === 'lab' ? ' hero--lab' : ''}`}
      aria-labelledby="hero-title"
      // Decorative background. One full-size file (2000px, ~100 KB) for every screen: phones show the
      // hero tall, so a smaller file would be stretched and look soft.
      style={{ ['--hero-bg' as string]: `url(${heroBg})` }}
    >
      {/* Pixel honeycomb background. (The bee animations are in components/HeroBees, not used for now.) */}
      {variant === 'lab' ? <WakeHivePattern /> : <HivePattern />}
      <FlyingBees />
      <div className="hero__top">
        <div className="container hero__inner">
          <h1 id="hero-title" className="hero__title" data-bee-avoid>
            <span className="visually-hidden">Find your next hackathon, workshop, meetup or conference</span>
            <span aria-hidden="true">
              Find your next <WordRotator words={WORDS} />
            </span>
          </h1>
          <p className="hero__lede" data-bee-avoid>
            Hackathons, buildathons, meetups and workshops for women, non-binary individuals, and allies across
            the technology industry.
            {' '}Online and around the world.
          </p>
          <div className="hero__actions" data-bee-avoid>
            <button type="button" className="hero__button hero__button--browse hive-hover" onClick={onBrowse}>
              Browse events
            </button>
            <a className="hero__button hero__button--submit hive-hover" href="#/submit">Submit event</a>
          </div>
        </div>
      </div>

      <div className="container hero__featured" data-bee-avoid>{featured}</div>

    </section>
  );
}
