import { useEffect, useRef } from 'react';
import './FlyingBee.css';

// Top-down pixel bee, head at the top. K = outline, Y = honey stripe, W = wing.
const WINGS_OPEN = [
  '...K...K...',
  '....K.K....',
  '.WW.KKK.WW.',
  'WWWWKYKWWWW',
  '.WWWKKKWWW.',
  '....KYK....',
  '....KKK....',
  '.....K.....',
];
const WINGS_CLOSED = [
  '...K...K...',
  '....K.K....',
  '....KKK....',
  '..WWKYKWW..',
  '.WWWKKKWWW.',
  '..WWKYKWW..',
  '....KKK....',
  '.....K.....',
];
const COLOURS: Record<string, string> = { K: '#000000', Y: '#F6C945', W: '#FFFFFF' };

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

/**
 * A single bee flying around the hero like a real one: smooth curves towards
 * a spot, a little side-to-side wobble, short hovers, then off again.
 * Decorative: aria-hidden, no pointer events.
 */
export function FlyingBee() {
  const beeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bee = beeRef.current;
    const stage = bee?.parentElement;
    if (!bee || !stage) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let W = stage.clientWidth, H = stage.clientHeight;
    const margin = 40;
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const newTarget = () => ({ x: rand(margin, W - margin), y: rand(margin, H * 0.85) });

    let x = W * 0.15, y = H * 0.2;          // position
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
          const speed = Math.min(190, 60 + dist * 0.9);             // slows as it arrives
          const wobble = Math.sin(t * 6.5) * 55;                     // side-to-side flutter
          const nx = dx / dist, ny = dy / dist;
          const desiredX = nx * speed - ny * wobble;
          const desiredY = ny * speed + nx * wobble;
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
  }, []);

  return (
    <div ref={beeRef} className="flying-bee" aria-hidden="true">
      <Sprite rows={WINGS_OPEN} className="flying-bee__frame flying-bee__frame--open" />
      <Sprite rows={WINGS_CLOSED} className="flying-bee__frame flying-bee__frame--closed" />
    </div>
  );
}
