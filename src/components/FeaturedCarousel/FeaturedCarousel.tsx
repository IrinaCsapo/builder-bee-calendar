import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../../types/event';
import { formatRange } from '../../lib/dates';
import './FeaturedCarousel.css';

const INTERVAL_MS = 6000;
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Rotating featured events, following the WAI-ARIA carousel pattern:
 * - a Pause/Play button (WCAG 2.2.2: anything moving on its own for >5s must be pausable)
 * - pauses while the mouse is over it or keyboard focus is inside it
 * - never auto-rotates for people who prefer reduced motion
 * - announces slide changes only when the visitor changes the slide themselves
 */
export function FeaturedCarousel({ events }: { events: CalendarEvent[] }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userChanged, setUserChanged] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  const count = events.length;
  const rotating = playing && !hovered && !focused && count > 1;

  useEffect(() => {
    if (!rotating) return;
    const t = window.setTimeout(() => { setUserChanged(false); setIndex((i) => (i + 1) % count); }, INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [rotating, index, count]);

  if (count === 0) return null;
  const go = (i: number) => { setUserChanged(true); setIndex((i + count) % count); };
  const event = events[index];
  const where = event.format === 'Online' ? 'Online' : [event.city, event.country].filter(Boolean).join(', ');

  return (
    <section
      ref={rootRef}
      className="featured"
      aria-roledescription="carousel"
      aria-labelledby="featured-title"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => { if (!rootRef.current?.contains(e.relatedTarget as Node)) setFocused(false); }}
    >
      <h2 id="featured-title" className="visually-hidden">Featured events</h2>

      <div
        className="featured__viewport"
        aria-live={rotating || !userChanged ? 'off' : 'polite'}
      >
        <div
          key={event.id}
          className="featured__slide"
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
        >
          <div className="featured__media">
            {event.image_url && <img src={event.image_url} alt="" referrerPolicy="no-referrer" />}
            <span className="featured__organiser">{event.organiser}</span>
          </div>
          <div className="featured__text">
            <p className="featured__kicker">
              {event.event_type} · <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time>
            </p>
            <h3 className="featured__title">{event.title}</h3>
            <p className="featured__meta">
              {where}
              {event.cost === 'Free' && ' · Free'}
              {event.level === 'Beginner friendly' && ' · Beginner friendly'}
            </p>
            <a className="featured__cta" href={`#/event/${event.id}`}>
              View event<span className="visually-hidden">: {event.title}</span>
            </a>
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="featured__controls">
          <button type="button" className="featured__round" onClick={() => setPlaying(!playing)}>
            <span aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
            <span className="visually-hidden">{playing ? 'Pause featured events' : 'Play featured events'}</span>
          </button>
          <button type="button" className="featured__round" onClick={() => go(index - 1)}>
            <span aria-hidden="true">←</span>
            <span className="visually-hidden">Previous featured event</span>
          </button>
          <p className="featured__counter" aria-hidden="true">{index + 1} / {count}</p>
          <ul className="featured__dots">
            {events.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  className="featured__dot"
                  aria-current={i === index ? 'true' : undefined}
                  onClick={() => go(i)}
                >
                  <span className="visually-hidden">Show featured event {i + 1}: {e.title}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="featured__round" onClick={() => go(index + 1)}>
            <span aria-hidden="true">→</span>
            <span className="visually-hidden">Next featured event</span>
          </button>
        </div>
      )}
    </section>
  );
}
