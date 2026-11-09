import { useState } from 'react';
import p1 from '../../assets/placeholders/placeholder-1.jpg';
import p2 from '../../assets/placeholders/placeholder-2.jpg';
import p3 from '../../assets/placeholders/placeholder-3.jpg';
import p4 from '../../assets/placeholders/placeholder-4.jpg';
import p5 from '../../assets/placeholders/placeholder-5.jpg';
import p6 from '../../assets/placeholders/placeholder-6.jpg';
import './EventImage.css';

const PLACEHOLDERS = [p1, p2, p3, p4, p5, p6];

/** The same event always gets the same placeholder. */
function placeholderFor(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PLACEHOLDERS[h % PLACEHOLDERS.length];
}

interface EventImageProps {
  id: string;
  title: string;
  src?: string;
  variant?: 'card' | 'banner';
}

/**
 * The organiser's image, loaded from where they host it. If there isn't one
 * (or it fails), one of our gradient placeholders with the event title on it.
 * Decorative (aria-hidden): the real title is always right next to it.
 */
export function EventImage({ id, title, src, variant = 'card' }: EventImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`event-image event-image--${variant}`} aria-hidden="true">
      {showImage ? (
        <>
          {/* Soft blurred copy fills the space around the uncropped image */}
          <img className="event-image__backdrop" src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          <img
            className="event-image__img"
            src={src}
            alt=""
            loading={variant === 'banner' ? 'eager' : 'lazy'}
            decoding="async"
            referrerPolicy="no-referrer"
            width={1000}
            height={1000}
            onError={() => setFailed(true)}
          />
        </>
      ) : (
        <div className="event-image__placeholder" style={{ backgroundImage: `url(${placeholderFor(id)})` }}>
          <span className="event-image__title">{title}</span>
        </div>
      )}
    </div>
  );
}
