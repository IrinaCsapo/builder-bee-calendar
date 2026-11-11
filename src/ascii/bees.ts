/**
 * ASCII bees for the hero lab (#/hero-lab): big side-view bees built from characters on
 * little tiles (like a terminal mosaic), white on the hero gradient, drifting slowly
 * across with fluttering wings. Twinkling dust specks fill the space between them.
 * Decorative only. Reduced motion: drawn once, still.
 */

// Side view, facing right. One letter per cell:
// W wing, B body, S stripe, H head, E eye, A antenna, T stinger, L leg, . empty
const WINGS_UP = [
  '.....WWWWWWW......................',
  '...WWWWWWWWWWWW...WWWWWW..........',
  '..WWWWWWWWWWWWWWWWWWWWWWWW......A.',
  '...WWWWWWWWWWWWWWWWWWWWWWWW....A..',
  '.....WWWWWWWWWWWWWWWWWWWWW....A...',
  '........WWWWWWWWWWWWWWWW.....A....',
];
const WINGS_DOWN = [
  '..................................',
  '..................................',
  '................................A.',
  '...............................A..',
  '..WWWWWWWWWWWWWWW..WWWWWWWW...A...',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWW..A....',
];
const BODY = [
  '.........BSSSBBSSSBB.....HHHHH....',
  '......BBBBSSSBBSSSBBBB..HHHHHHHH..',
  '....BBBBBBSSSBBSSSBBBBB.HHHHHHHHH.',
  '..BBBBBBBBSSSBBSSSBBBBBHHHHHHEEHHH',
  'TTBBBBBBBBSSSBBSSSBBBBBHHHHHHEEHHH',
  '..BBBBBBBBSSSBBSSSBBBBBHHHHHHHHHH.',
  '....BBBBBBSSSBBSSSBBBBB.HHHHHHHHH.',
  '......BBBBSSSBBSSSBBBB...HHHHHH...',
  '.........BSSSBBSSSBB..............',
  '.........L...L....L...............',
  '........L...L....L................',
];
const FRAMES = [[...WINGS_UP, ...BODY], [...WINGS_DOWN, ...BODY]];
const COLS = BODY[0].length;
const ROWS = FRAMES[0].length;

// Characters for each part (dense ones read as solid, light ones as see-through)
const CHARS: Record<string, string> = {
  B: '@#8%X&$',
  S: ':;!it',
  H: '@#8%&',
  E: 'O',
  W: ".:'`;-~",
  A: '/\\|',
  T: '<=-',
  L: '/\\|',
};
// Each part: how solid its white tile is (0 = no tile), and its character colour.
// Solid parts (body, head) are white tiles with soft purple characters; stripes and wings are
// see-through tiles with white characters, so the stripes read as gaps in the body.
const INK_ON_WHITE = 'rgba(112, 60, 180, 0.6)';
const STYLE: Record<string, { tile: number; ink: string }> = {
  B: { tile: 0.9, ink: INK_ON_WHITE },
  H: { tile: 0.92, ink: INK_ON_WHITE },
  E: { tile: 0.92, ink: 'rgba(60, 20, 110, 0.95)' },
  T: { tile: 0.7, ink: INK_ON_WHITE },
  S: { tile: 0.22, ink: 'rgba(255, 255, 255, 0.95)' },
  W: { tile: 0.34, ink: 'rgba(255, 255, 255, 0.95)' },
  A: { tile: 0, ink: 'rgba(255, 255, 255, 1)' },
  L: { tile: 0, ink: 'rgba(255, 255, 255, 1)' },
};
// A soft purple shadow under every bee, so white still shows on the pale top of the gradient
const SHADOW = 'rgba(70, 20, 120, 0.3)';

const DUST = ".'`:o-";

interface Bee {
  x: number; y: number;         // centre, px
  baseY: number;
  vx: number;                   // px/s (negative = flying left)
  cell: number;                 // cell size, px
  bob: number; bobSpeed: number; phase: number;
  flap: number;                 // seconds per wing beat
  chars: string[][];            // the character chosen for each cell, per frame
  images: HTMLCanvasElement[];  // each frame drawn once, redrawn only when a character changes
  dirty: boolean[];
}
interface Speck { x: number; y: number; ch: string; a: number; speed: number; phase: number; drift: number }

const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class AsciiBeeSky {
  private ctx: CanvasRenderingContext2D;
  private bees: Bee[] = [];
  private dust: Speck[] = [];
  private w = 0;
  private h = 0;
  private raf = 0;
  private last = 0;
  private t = 0;
  private running = false;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private ro: ResizeObserver;
  private io: IntersectionObserver;
  private visible = true;

  constructor(private canvas: HTMLCanvasElement, private count = 3) {
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.sync(); });
    this.io.observe(canvas);
    document.addEventListener('visibilitychange', this.sync);
    this.reduced.addEventListener('change', this.sync);
    this.resize();
  }

  private resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = this.canvas.getBoundingClientRect();
    if (!width || !height) return;
    const first = this.w === 0;
    this.w = width; this.h = height;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (first) this.populate();
    for (const b of this.bees) b.dirty = [true, true];
    this.draw();
  }

  private makeBee(i: number): Bee {
    const small = this.w < 640;
    const cell = small ? rand(8, 10) : rand(15, 19) - i * 1.5;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const baseY = rand(0.12, 0.88) * this.h;
    return {
      x: rand(0, this.w), y: baseY, baseY,
      vx: dir * rand(10, 22) * (cell / 12),
      cell,
      bob: rand(8, 22), bobSpeed: rand(0.35, 0.7), phase: rand(0, Math.PI * 2),
      flap: rand(0.16, 0.24),
      chars: FRAMES.map((f) => f.flatMap((row) => [...row].map((k) => (CHARS[k] ? pick(CHARS[k]) : '')))),
      images: FRAMES.map(() => document.createElement('canvas')),
      dirty: [true, true],
    };
  }

  private populate() {
    const n = this.w < 640 ? Math.max(2, this.count - 1) : this.count;
    this.bees = Array.from({ length: n }, (_, i) => this.makeBee(i));
    // Spread them out vertically so they don't bunch up
    this.bees.forEach((b, i) => { b.baseY = b.y = ((i + 0.5) / n) * this.h * 0.85 + this.h * 0.08; });
    const specks = Math.round((this.w * this.h) / 9000);
    this.dust = Array.from({ length: specks }, () => ({
      x: rand(0, this.w), y: rand(0, this.h), ch: pick(DUST),
      a: rand(0.25, 0.7), speed: rand(0.4, 1.4), phase: rand(0, Math.PI * 2), drift: rand(-4, 4),
    }));
  }

  private sync = () => {
    const shouldRun = this.visible && !document.hidden && !this.reduced.matches;
    if (shouldRun && !this.running) {
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.step);
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this.draw();
    }
  };

  private step = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.t += dt;
    for (const b of this.bees) {
      b.x += b.vx * dt;
      b.y = b.baseY + Math.sin(this.t * b.bobSpeed + b.phase) * b.bob;
      const half = (COLS * b.cell) / 2 + 20;
      // Off one side: come back in on the other, at a new height
      if (b.vx > 0 && b.x - half > this.w) { b.x = -half; b.baseY = rand(0.12, 0.88) * this.h; }
      if (b.vx < 0 && b.x + half < 0) { b.x = this.w + half; b.baseY = rand(0.12, 0.88) * this.h; }
      // A few times a second, some characters flicker to others, like a terminal redrawing
      if (Math.random() < 4 * dt) {
        for (let n = 0; n < 6; n++) {
          const f = Math.floor(Math.random() * 2), k = Math.floor(Math.random() * b.chars[f].length);
          const part = FRAMES[f][Math.floor(k / COLS)][k % COLS];
          if (CHARS[part] && part !== 'E') { b.chars[f][k] = pick(CHARS[part]); b.dirty[f] = true; }
        }
      }
    }
    for (const s of this.dust) {
      s.x += s.drift * dt;
      if (s.x < -10) s.x = this.w + 10;
      if (s.x > this.w + 10) s.x = -10;
    }
    this.draw();
    if (this.running) this.raf = requestAnimationFrame(this.step);
  };

  private draw() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Dust: tiny characters that twinkle
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    for (const s of this.dust) {
      const tw = this.reduced.matches ? 1 : 0.55 + 0.45 * Math.sin(this.t * s.speed * 2 + s.phase);
      ctx.fillStyle = `rgba(255,255,255,${(s.a * tw).toFixed(3)})`;
      ctx.fillText(s.ch, s.x, s.y);
    }

    for (const b of this.bees) {
      const frame = this.reduced.matches ? 0 : Math.floor(this.t / b.flap) % 2;
      const img = this.beeImage(b, frame);
      const dpr = this.canvas.width / this.w;
      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.vx < 0) ctx.scale(-1, 1);                       // face the way it's flying
      // A gentle nose-up / nose-down tilt with the bob
      ctx.rotate(Math.cos(this.t * b.bobSpeed + b.phase) * 0.06);
      ctx.drawImage(img, -img.width / dpr / 2, -img.height / dpr / 2, img.width / dpr, img.height / dpr);
      ctx.restore();
    }
  }

  /** One frame of a bee, drawn to its own canvas (only redrawn when its characters change). */
  private beeImage(b: Bee, frame: number) {
    const img = b.images[frame];
    if (!b.dirty[frame]) return img;
    b.dirty[frame] = false;
    const dpr = this.canvas.width / this.w;
    const c = b.cell, margin = c * 1.5;
    img.width = Math.ceil((COLS * c + margin * 2) * dpr);
    img.height = Math.ceil((ROWS * c + margin * 2) * dpr);
    const g = img.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${Math.round(c * 0.8)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    g.shadowColor = SHADOW;
    g.shadowBlur = c * 0.7;
    g.shadowOffsetY = c * 0.12;
    const pad = Math.max(1, c * 0.12), r = Math.max(1, c * 0.2);
    const flip = b.vx < 0;
    const rows = FRAMES[frame];
    // Tiles first (with the shadow), then characters on top (without)
    for (let pass = 0; pass < 2; pass++) {
      if (pass === 1) { g.shadowColor = 'transparent'; }
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const part = rows[y][x];
          const st = STYLE[part];
          if (!st) continue;
          const cx = margin + x * c, cy = margin + y * c;
          if (pass === 0) {
            if (!st.tile) continue;
            g.fillStyle = `rgba(255,255,255,${st.tile})`;
            g.beginPath();
            g.roundRect(cx + pad / 2, cy + pad / 2, c - pad, c - pad, r);
            g.fill();
          } else {
            g.fillStyle = st.ink;
            g.save();
            g.translate(cx + c / 2, cy + c / 2 + c * 0.04);
            if (flip) g.scale(-1, 1);                           // the whole bee is mirrored later; keep letters readable
            g.fillText(b.chars[frame][y * COLS + x], 0, 0);
            g.restore();
          }
        }
      }
      // Antennae and legs have no tile: give their characters the shadow too
      if (pass === 0) {
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
          const part = rows[y][x];
          if (part !== 'A' && part !== 'L') continue;
          g.fillStyle = STYLE[part].ink;
          g.save();
          g.translate(margin + x * c + c / 2, margin + y * c + c / 2);
          if (flip) g.scale(-1, 1);
          g.fillText(b.chars[frame][y * COLS + x], 0, 0);
          g.restore();
        }
      }
    }
    return img;
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    document.removeEventListener('visibilitychange', this.sync);
    this.reduced.removeEventListener('change', this.sync);
  }
}
