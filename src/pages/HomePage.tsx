import { Hero } from '../components/Hero/Hero';
import { EventList } from '../components/EventList/EventList';
import { allEvents } from '../lib/events';
import { getUpcoming } from '../lib/dates';

export function HomePage() {
  const upcoming = getUpcoming(allEvents);
  return (
    <>
      <Hero />
      <div className="container">
        <EventList events={upcoming} />
      </div>
    </>
  );
}
