import { useEffect, useRef, type CSSProperties } from 'react';
import './FlyingBee.css';

// Top-down pixel bee, head at the top. K = black (head, stripes, antennae, stinger),
// Y = honey yellow body, W = wing. Mostly yellow, with two black stripes.
const WINGS_OPEN = [
  '....K...K....',
  '.....K.K.....',
  '.....KKK.....',
  '.WWW.KKK.WWW.',
  'WWWWWYYYWWWWW',
  'WWWWYYYYYWWWW',
  '.WWWKKKKKWWW.',
  '....YYYYY....',
  '....KKKKK....',
  '....YYYYY....',
  '.....YYY.....',
  '......K......',
];
const WINGS_CLOSED = [
  '....K...K....',
  '.....K.K.....',
  '.....KKK.....',
  '.....KKK.....',
  '...WWYYYWW...',
  '..WWYYYYYWW..',
  '..WWKKKKKWW..',
  '...WYYYYYW...',
  '....KKKKK....',
  '....YYYYY....',
  '.....YYY.....',
  '......K......',
];
const COLOURS: Record<string, string> = { K: '#000000', Y: '#FFC93C', W: '#FFFFFF' };

/** One frame of pixel art as crisp SVG rectangles. */
function Sprite({ rows, className }: { rows: string[]; className: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges">
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (COLOURS[ch] ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLOURS[ch]} /> : null)),
      )}
    </svg>
  );
}

interface FlyingBeeProps {
  /** Where it starts (and rests with reduced motion), as fractions of the hero */
  start?: { x: number; y: number };
  /** Size multiplier (1 = 65×60px on desktop) */
  scale?: number;
  /** Speed multiplier */
  speed?: number;
}

/**
 * A bee flying around the hero like a real one: smooth curves towards
 * a spot, a little side-to-side wobble, short hovers, then off again.
 * Decorative: aria-hidden, no pointer events, so clicks pass straight through.
 */
export function FlyingBee({ start: startAt = { x: 0.15, y: 0.2 }, scale = 1, speed = 1 }: FlyingBeeProps) {
  const beeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bee = beeRef.current;
    const stage = bee?.parentElement;
    if (!bee || !stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let W = stage.clientWidth, H = stage.clientHeight;
    const margin = 60;                       // keeps the (now bigger) bee fully inside the hero
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const newTarget = () => ({ x: rand(margin, W - margin), y: rand(margin, H * 0.85) });

    let x = W * startAt.x, y = H * startAt.y;  // position
    let vx = 0, vy = 0;                      // velocity (px/s)
    let heading = 0;                         // radians, 0 = facing right
    let target = newTarget();
    let hoverLeft = 0;                       // seconds left hovering
    let t = 0, last = performance.now(), raf = 0, visible = true;

    const place = () => {
      // The sprite's head points up, so add 90° to face the direction of travel
      bee.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${heading + Math.PI / 2}rad)`;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now; t += dt;

      if (hoverLeft > 0) {
        // Hovering: drift to a stop with a tiny buzz in place
        hoverLeft -= dt;
        vx *= 1 - 4 * dt; vy *= 1 - 4 * dt;
        x += Math.sin(t * 31) * 0.35; y += Math.cos(t * 27) * 0.35;
        if (hoverLeft <= 0) target = newTarget();
      } else {
        const dx = target.x - x, dy = target.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist < 24) {
          // Arrived: often stop and hover a moment, like a bee checking a flower
          if (Math.random() < 0.6) hoverLeft = rand(0.6, 1.8); else target = newTarget();
        } else {
          const pace = Math.min(190, 60 + dist * 0.9) * speed;      // slows as it arrives
          const wobble = Math.sin(t * 6.5) * 55;                     // side-to-side flutter
          const nx = dx / dist, ny = dy / dist;
          const desiredX = nx * pace - ny * wobble;
          const desiredY = ny * pace + nx * wobble;
          vx += (desiredX - vx) * Math.min(1, 3 * dt);               // smooth steering
          vy += (desiredY - vy) * Math.min(1, 3 * dt);
        }
      }
      x += vx * dt; y += vy * dt;
      x = Math.max(margin / 2, Math.min(W - margin / 2, x));
      y = Math.max(margin / 2, Math.min(H - margin / 2, y));

      // Turn smoothly towards the direction of travel (keep heading while hovering)
      if (Math.hypot(vx, vy) > 20) {
        let diff = Math.atan2(vy, vx) - heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heading += diff * Math.min(1, 5 * dt);
      }
      place();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches || !visible || document.hidden) { place(); return; }
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const ro = new ResizeObserver(() => { W = stage.clientWidth; H = stage.clientHeight; });
    ro.observe(stage);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(stage);
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);
    reduced.addEventListener('change', start);
    start();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      reduced.removeEventListener('change', start);
    };
  }, [startAt.x, startAt.y, speed]);

  return (
    <div ref={beeRef} className="flying-bee" aria-hidden="true" style={{ '--bee-scale': scale } as CSSProperties}>
      <Sprite rows={WINGS_OPEN} className="flying-bee__frame flying-bee__frame--open" />
      <Sprite rows={WINGS_CLOSED} className="flying-bee__frame flying-bee__frame--closed" />
    </div>
  );
}

/** Three bees, each with its own start, size and pace, flying above the hero content. */
export function FlyingBees() {
  return (
    <>
      <FlyingBee start={{ x: 0.12, y: 0.14 }} scale={1} speed={1} />
      <FlyingBee start={{ x: 0.86, y: 0.22 }} scale={0.85} speed={1.15} />
      <FlyingBee start={{ x: 0.1, y: 0.72 }} scale={0.75} speed={0.85} />
    </>
  );
}
