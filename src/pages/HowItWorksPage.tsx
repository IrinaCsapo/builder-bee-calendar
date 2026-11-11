import { useDocumentTitle } from '../lib/useDocumentTitle';
import './ContentPage.css';

export function HowItWorksPage() {
  useDocumentTitle('How it works');
  return (
    <div className="container content-page">
      <h1>How it works</h1>
      <p className="content-page__lede">
        BuilderBee gathers hackathons, workshops, meetups and conferences for women, non-binary people and allies in
        tech into one calendar, online and around the world.
      </p>

      <h2>How events get on BuilderBee</h2>
      <ol className="steps">
        <li>
          <strong>We look every morning</strong>
          Our event scout checks the calendars of groups that run events for women and non-binary people, and searches
          for new events in every region.
        </li>
        <li>
          <strong>Or you tell us</strong>
          Know an event we’re missing? <a href="#/submit">Submit it</a>: name, dates, location, who it’s for and a
          registration link. It takes about two minutes, and you don’t need an account.
        </li>
        <li>
          <strong>We check it</strong>
          We make sure each event is real, upcoming, open to women and non-binary builders, and that its registration
          link works.
        </li>
        <li>
          <strong>It goes live</strong>
          We add it to the calendar and the site updates within a few minutes.
        </li>
      </ol>

      <h2>Finding your next event</h2>
      <ul>
        <li>Search by name, city or theme, and filter by online or in person, free, and beginner friendly or advanced.</li>
        <li>Online events are featured at the top, because anyone can join them from anywhere.</li>
        <li>Each event page shows the dates, cost, level and who it’s for. Add it to your calendar or share it in one tap.</li>
        <li>You register on the organiser’s own site. BuilderBee never asks for your details.</li>
      </ul>

      <h2>Find your people</h2>
      <p>
        Most events come from groups that run them all year round. Follow the ones you like on the{' '}
        <a href="#/communities">Communities</a> page so you hear about their next event first.
      </p>

      <div className="content-page__actions">
        <a className="cta hive-hover" href="#/">Browse events</a>
        <a className="cta cta--outline hive-hover hive-hover--on-light" href="#/submit">Submit an event</a>
      </div>
    </div>
  );
}
