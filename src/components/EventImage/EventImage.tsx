import { useState } from 'react';
import p1 from '../../assets/placeholders/placeholder-1.jpg';
import p2 from '../../assets/placeholders/placeholder-2.jpg';
import p3 from '../../assets/placeholders/placeholder-3.jpg';
import p4 from '../../assets/placeholders/placeholder-4.jpg';
import p5 from '../../assets/placeholders/placeholder-5.jpg';
import p6 from '../../assets/placeholders/placeholder-6.jpg';
import './EventImage.css';

const PLACEHOLDERS = [p1, p2, p3, p4, p5, p6];

// Every event picture has our own web-sized copies (made at build time by scripts/optimise-images.ts):
// /img/events/<id>-480.webp and -960.webp, served from builderbee.club instead of the organiser's site.
// If they're missing (a brand-new event in local development, or a picture that couldn't be fetched),
// the original address is used instead.
const ownCopies = (id: string) => ({
  src: `/img/events/${id}-960.webp`,
  srcSet: `/img/events/${id}-480.webp 480w, /img/events/${id}-960.webp 960w`,
});
// How wide each image shows: cards are a quarter of the page (half on tablets, most of a phone),
// the featured image is at most 24rem, the event page banner spans the page.
const SIZES = {
  card: '(max-width: 40rem) 85vw, (max-width: 64rem) 45vw, 24rem',
  banner: '(max-width: 75rem) 100vw, 75rem',
};

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
  const [useOriginal, setUseOriginal] = useState(false);   // our copy didn't load: try the organiser's
  const [fit, setFit] = useState<'fill' | 'whole'>('fill');
  const [loaded, setLoaded] = useState('');   // the address that loaded, for the blurred backdrop
  const showImage = src && !failed;

  return (
    <div
      className={`event-image event-image--${variant}`}
      aria-hidden="true"
    >
      {/* Wide or tall images leave space around them: fill it with a soft, blurred copy of the same picture */}
      {showImage && fit === 'whole' && loaded && (
        <span className="event-image__backdrop" style={{ backgroundImage: `url(${loaded})` }} />
      )}
      {showImage ? (
        <img
          className={`event-image__img event-image__img--${fit}`}
          src={useOriginal ? src : ownCopies(id).src}
          srcSet={useOriginal ? undefined : ownCopies(id).srcSet}
          sizes={useOriginal ? undefined : SIZES[variant]}
          alt=""
          loading={variant === 'banner' ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          width={1000}
          height={1000}
          onLoad={(e) => {
            // Pictures the same shape as their box fill it (cropping at most a sliver); any other shape
            // is shown whole, so posters never lose their text. Boxes are square, except the featured
            // card on phones (16:9).
            const img = e.currentTarget;
            const box = img.parentElement!.getBoundingClientRect();
            const boxRatio = box.height ? box.width / box.height : 1;
            const off = (img.naturalWidth / img.naturalHeight) / boxRatio;
            setFit(off >= 0.93 && off <= 1.07 ? 'fill' : 'whole');
            setLoaded(img.currentSrc || img.src);
          }}
          onError={() => (useOriginal ? setFailed(true) : setUseOriginal(true))}
        />
      ) : (
        <div className="event-image__placeholder" style={{ backgroundImage: `url(${placeholderFor(id)})` }}>
          <span className="event-image__title">{title}</span>
        </div>
      )}
    </div>
  );
}
