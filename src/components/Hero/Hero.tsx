import './Hero.css';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <h1 id="hero-title" className="hero__title">
          Find your next hackathon, <span className="hero__highlight">this month</span>.
        </h1>
        <p className="hero__lede">
          Hackathons, buildathons, meetups and workshops for women and non-binary builders. Online and around the world.
        </p>
      </div>
    </section>
  );
}
