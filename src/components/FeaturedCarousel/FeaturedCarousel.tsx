import { useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '../../types/event';
import { formatRange } from '../../lib/dates';
import { EventImage } from '../EventImage/EventImage';
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
            <EventImage id={event.id} title={event.title} src={event.image_url} />
          </div>
          <div className="featured__text">
            <div className="featured__top">
              <p className="featured__pill">{event.format}</p>
              <p className="featured__organiser"><span className="visually-hidden">Organised by </span>{event.organiser}</p>
            </div>
            <h3 className="featured__title">
              <a href={`#/event/${event.id}`}>{event.title}</a>
            </h3>
            <p className="featured__meta">
              <time dateTime={event.start_date}>{formatRange(event.start_date, event.end_date)}</time>
              {' · '}{where}
            </p>
            <p className="featured__desc">{event.audience}</p>
            <div className="featured__actions">
              <a className="featured__cta" href={event.registration_url} target="_blank" rel="noopener noreferrer">
                Register <span aria-hidden="true">↗</span>
                <span className="visually-hidden"> for {event.title} on the organiser's site (opens in a new tab)</span>
              </a>
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
                  <button type="button" className="featured__round" onClick={() => go(index + 1)}>
                    <span aria-hidden="true">→</span>
                    <span className="visually-hidden">Next featured event</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
