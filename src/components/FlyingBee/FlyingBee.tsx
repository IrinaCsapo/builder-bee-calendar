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

/** A rectangle, in px relative to the hero */
interface Zone { l: number; t: number; r: number; b: number }

/**
 * The hero content the bees must not sit on: anything marked data-bee-avoid
 * (headline, description, buttons, featured card), padded by `pad`.
 */
function readZones(stage: HTMLElement, pad: number): Zone[] {
  const s = stage.getBoundingClientRect();
  return [...stage.querySelectorAll<HTMLElement>('[data-bee-avoid]')].map((el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left - s.left - pad, t: r.top - s.top - pad, r: r.right - s.left + pad, b: r.bottom - s.top + pad };
  });
}
const inside = (z: Zone, x: number, y: number) => x > z.l && x < z.r && y > z.t && y < z.b;

interface FlyingBeeProps {
  /** Where it starts (and rests with reduced motion), as fractions of the hero */
  start?: { x: number; y: number };
  /** Size multiplier (1 = 104×96px on desktop) */
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
    const margin = 90;                       // keeps the big bee fully inside the hero
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    // Spots to fly to are always outside the text; if there's no free spot, any spot will do
    let zones: Zone[] = [];
    const pad = () => bee.offsetWidth * 0.45;
    const refreshZones = () => { zones = readZones(stage, pad()); };
    let sinceTarget = 0;                     // seconds since the current spot was picked
    const newTarget = () => {
      sinceTarget = 0;
      for (let i = 0; i < 40; i++) {
        const p = { x: rand(margin / 2, W - margin / 2), y: rand(margin / 2, H - margin / 2) };
        if (!zones.some((z) => inside(z, p.x, p.y))) return p;
      }
      return { x: rand(margin / 2, W - margin / 2), y: rand(margin / 2, H - margin / 2) };
    };

    let x = W * startAt.x, y = H * startAt.y;  // position (moved off the text on the first frames)
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
      // Over text: never stop there, and hurry across (no push back: pushing against the
      // steering left bees stuck at the edge of the headline when their spot was on the far side)
      if (zones.some((z) => inside(z, x, y))) {
        if (hoverLeft > 0) { hoverLeft = 0; target = newTarget(); }
        const sp = Math.hypot(vx, vy);
        if (sp > 1 && sp < 240 * speed) { vx *= 1 + 1.5 * dt; vy *= 1 + 1.5 * dt; }
      }
      // Safety net: if a spot hasn't been reached in a while, pick another
      sinceTarget += dt;
      if (hoverLeft <= 0 && sinceTarget > 6) target = newTarget();
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

    const ro = new ResizeObserver(() => { W = stage.clientWidth; H = stage.clientHeight; refreshZones(); });
    ro.observe(stage);
    refreshZones();
    // Start somewhere free too (this is also where it rests with reduced motion)
    if (zones.some((z) => inside(z, x, y))) ({ x, y } = newTarget());
    target = newTarget();
    // The headline word and featured card change size now and then
    const zoneTimer = window.setInterval(refreshZones, 1000);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); });
    io.observe(stage);
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);
    reduced.addEventListener('change', start);
    start();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.clearInterval(zoneTimer);
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

/** Three bees, each with its own start, size and pace. They fly around the hero content, never resting on it. */
export function FlyingBees() {
  return (
    <>
      <FlyingBee start={{ x: 0.12, y: 0.14 }} scale={1} speed={1} />
      <FlyingBee start={{ x: 0.86, y: 0.22 }} scale={0.85} speed={1.15} />
      <FlyingBee start={{ x: 0.1, y: 0.72 }} scale={0.75} speed={0.85} />
    </>
  );
}
