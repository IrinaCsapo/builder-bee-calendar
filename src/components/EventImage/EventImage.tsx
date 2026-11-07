import { useState } from 'react';
import type { EventType } from '../../types/event';
import './EventImage.css';

const TYPE_ICON: Record<EventType, string> = {
  Hackathon: '🏆', Buildathon: '🛠️', Meetup: '☕', Conference: '🎤', Workshop: '💻', Bootcamp: '🎓', 'Pitch night': '💡',
};

interface EventImageProps {
  src?: string;
  type: EventType;
  variant?: 'card' | 'banner';
}

/**
 * The organiser's preview image, loaded from where they host it.
 * Decorative (alt=""): the event title is always right next to it.
 * Falls back to a branded placeholder if there's no image or it fails to load.
 */
export function EventImage({ src, type, variant = 'card' }: EventImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`event-image event-image--${variant}`} aria-hidden="true">
      {showImage ? (
        <img
          src={src}
          alt=""
          loading={variant === 'banner' ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          width={1200}
          height={600}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="event-image__placeholder">
          <span className="event-image__icon">{TYPE_ICON[type]}</span>
        </div>
      )}
    </div>
  );
}
