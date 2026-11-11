/**
 * Halftone honeycomb with an ASCII wake (hero lab, #/hero-lab).
 *
 * At rest the honeycomb is a screen of light grey dots, biggest on the hexagon walls and shrinking
 * away from them. Moving the pointer over the hero leaves a warm wake: under the pointer the dots
 * become characters, densest right under it (". : - = + * # % @"), and along the path they cool
 * back to dots. The warm characters flicker between neighbours like a terminal redraw, lean a
 * little towards the pointer. A click or tap sends out a ring.
 * The warm characters darken from grey to black.
 *
 * Based on an "ASCII wake" effect: one number of heat per cell, cooled a little every frame,
 * read off a ramp of characters.
 *
 * Speed: the resting dots are drawn once into an offscreen layer. A frame copies that layer and
 * redraws only the warm cells, and the loop stops completely once everything has cooled.
 */

const SQRT3 = Math.sqrt(3);
const NORMALS: [number, number][] = [[1, 0], [0.5, SQRT3 / 2], [-0.5, SQRT3 / 2]];
const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

/** Lightest to densest; index 0 is never drawn (a cell that cold is a dot) */
const RAMP = [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
const COLD = 0.04;       // below this a cell is a dot
const TRAIL = 1.2;       // seconds for the wake to cool
const RING_S = 2.2;      // seconds a click ring takes to spread and fade
const DOT_COLOUR = '#f1f1f3';   // the resting honeycomb: very light grey

/** Distance (px) from a point to the nearest wall of a pointy-top honeycomb of radius R */
function edgeDistance(px: number, py: number, R: number) {
  const q = (SQRT3 / 3 * px - py / 3) / R;
  const r = (2 / 3 * py) / R;
  const x = q, z = r, y = -x - z;
  let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
  const cx = R * SQRT3 * (rx + rz / 2);
  const cy = R * 1.5 * rz;
  const vx = px - cx, vy = py - cy;
  let m = 0;
  for (const [nx, ny] of NORMALS) m = Math.max(m, Math.abs(vx * nx + vy * ny));
  return (R * SQRT3) / 2 - m;
}

/** A stable 0..1 per cell per "deal", so the flicker holds for a few frames */
function hash(k: number, n: number) {
  let h = (k * 374761393 + n * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// The wake darkens from grey to black as it warms (a few steps, so no colour strings per cell)
const INKS = ['#9a9aa2', '#5c5c66', '#26262b', '#000000'];

export class WakeHive {
  private ctx: CanvasRenderingContext2D;
  private base = document.createElement('canvas');
  private W = 0; private H = 0; private dpr = 1;
  private cols = 0; private rows = 0; private cw = 0; private ch = 0; private size = 12;
  private mask = new Float32Array(0);   // how much honeycomb wall is in each cell, 0..1
  private heat = new Float32Array(0);   // the wake
  private hx = -9999; private hy = -9999; private lx = NaN; private ly = NaN;
  private inside = false; private near = 0;
  private rings: { x: number; y: number; t: number }[] = [];
  private deal = 0; private tick = 0;
  private raf = 0;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  private ro: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, private stage: HTMLElement) {
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.build());
    this.ro.observe(canvas);
    stage.addEventListener('pointermove', this.onMove);
    stage.addEventListener('pointerleave', this.onLeave);
    stage.addEventListener('pointerdown', this.onDown);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.build();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.ro.disconnect();
    this.stage.removeEventListener('pointermove', this.onMove);
    this.stage.removeEventListener('pointerleave', this.onLeave);
    this.stage.removeEventListener('pointerdown', this.onDown);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  /** The grid, the honeycomb in it, and the resting dots drawn once */
  private build() {
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height;
    for (const c of [this.canvas, this.base]) { c.width = Math.round(this.W * this.dpr); c.height = Math.round(this.H * this.dpr); }

    const small = this.W < 640;
    this.size = small ? 10 : 13;
    this.cw = this.size * 0.66;
    this.ch = this.size * 0.82;
    this.cols = Math.ceil(this.W / this.cw) + 1;
    this.rows = Math.ceil(this.H / this.ch) + 1;
    this.mask = new Float32Array(this.cols * this.rows);
    this.heat = new Float32Array(this.cols * this.rows);

    const R = small ? 40 : 58;          // hexagon size
    const wall = R * 0.3;               // how far the dots reach from each wall
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const { x, y } = this.centre(i, j);
        // Shifted so the top row starts with whole hexagons
        const d = edgeDistance(x, y - R, R);
        const m = 1 - d / wall;
        this.mask[j * this.cols + i] = m > 0 ? m : 0;
      }
    }

    const g = this.base.getContext('2d')!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.W, this.H);
    g.fillStyle = DOT_COLOUR;
    const dot = Math.min(this.cw, this.ch) * 0.44;
    g.beginPath();
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const m = this.mask[j * this.cols + i];
        if (m <= 0) continue;
        const { x, y } = this.centre(i, j);
        const rad = Math.max(0.5, dot * Math.sqrt(m));      // halftone: dot area follows the wall
        g.moveTo(x + rad, y);
        g.arc(x, y, rad, 0, Math.PI * 2);
      }
    }
    g.fill();
    this.paint();
  }

  /** Odd rows sit half a cell over, like a halftone screen */
  private centre(i: number, j: number) {
    return { x: (i + 0.5 * (j & 1)) * this.cw, y: (j + 0.5) * this.ch };
  }

  private radius() { return this.W < 640 ? 46 : 64; }

  /** Heat dropped in a soft round at a point */
  private stamp(x: number, y: number, rad: number, amt: number) {
    const c0 = Math.max(0, Math.floor((x - rad) / this.cw) - 1), c1 = Math.min(this.cols - 1, Math.ceil((x + rad) / this.cw));
    const r0 = Math.max(0, Math.floor((y - rad) / this.ch)), r1 = Math.min(this.rows - 1, Math.ceil((y + rad) / this.ch));
    const R2 = rad * rad;
    for (let j = r0; j <= r1; j++) {
      for (let i = c0; i <= c1; i++) {
        const c = this.centre(i, j);
        const q = ((c.x - x) ** 2 + (c.y - y) ** 2) / R2;
        if (q >= 1) continue;
        const k = j * this.cols + i;
        const t = 1 - q;
        this.heat[k] = Math.min(1, this.heat[k] + amt * t * t);
      }
    }
  }

  private local(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onMove = (e: PointerEvent) => {
    if (this.reduced.matches || e.pointerType === 'touch') return;   // touch scrolls; it only gets rings
    const { x, y } = this.local(e);
    const rad = this.radius();
    if (Number.isNaN(this.lx)) { this.lx = x; this.ly = y; }
    // Stamp along the whole line since the last event, so a fast flick is one stroke
    const n = Math.max(1, Math.ceil(Math.hypot(x - this.lx, y - this.ly) / (rad / 3)));
    for (let k = 1; k <= n; k++) {
      const f = k / n;
      this.stamp(this.lx + (x - this.lx) * f, this.ly + (y - this.ly) * f, rad, 0.5);
    }
    this.lx = x; this.ly = y; this.hx = x; this.hy = y;
    this.inside = true;
    this.run();
  };

  private onLeave = () => { this.inside = false; this.lx = NaN; this.run(); };

  private onDown = (e: PointerEvent) => {
    if (this.reduced.matches) return;
    const { x, y } = this.local(e);
    this.rings.push({ x, y, t: 0 });
    this.run();
  };

  private onVisibility = () => { if (!document.hidden) this.run(); };

  /** The loop only runs while something is warm, a ring is out, or the pointer is coming or going */
  private run() {
    if (this.raf || document.hidden) return;
    let prev = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - prev) / 1000);
      prev = t;
      const keep = Math.exp((-dt * 3) / TRAIL);
      let warm = 0;
      const h = this.heat;
      for (let k = 0; k < h.length; k++) {
        if (!h[k]) continue;
        const v = h[k] * keep;
        h[k] = v < 0.003 ? 0 : v;
        if (v > warm) warm = v;
      }
      this.rings = this.rings.filter((r) => (r.t += dt) < RING_S);
      this.near += ((this.inside ? 1 : 0) - this.near) * (1 - Math.pow(0.004, dt));
      this.tick += dt;
      if (this.tick > 0.07) { this.tick = 0; this.deal++; }
      this.paint();
      const still = warm === 0 && !this.rings.length && Math.abs((this.inside ? 1 : 0) - this.near) < 0.004;
      this.raf = still || document.hidden ? 0 : requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  private paint() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.base, 0, 0);
    if (!this.cols) return;
    const anyHand = this.near > 0.002;
    if (!anyHand && !this.rings.length && !this.heat.some((v) => v > COLD)) return;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.font = `600 ${this.size}px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const top = RAMP.length - 1;
    const rad = this.radius(), R2 = rad * rad;
    const far = rad * 2, far2 = far * far;
    const lean = 0.4 * this.near;
    const rings = this.rings.map((r) => {
      const p = r.t / RING_S;
      const e = 1 - Math.pow(1 - p, 3);
      return { x: r.x, y: r.y, R: 8 + e * 420, amp: 0.6 * (1 - p) * (1 - p) * Math.min(1, p * 6) };
    });
    const halfW = this.cw / 2 + 0.5, halfH = this.ch / 2 + 0.5;

    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const k = j * this.cols + i;
        const m = this.mask[k];
        if (m <= 0) continue;
        const { x: cx, y: cy } = this.centre(i, j);
        let h = this.heat[k];
        if (anyHand) {
          const q = ((cx - this.hx) ** 2 + (cy - this.hy) ** 2) / R2;
          if (q < 1) h = Math.max(h, 0.95 * this.near * (1 - q) * (1 - q));
        }
        for (const r of rings) {
          const d = (Math.hypot(cx - r.x, cy - r.y) - r.R) / 26;
          if (d > -2.5 && d < 2.5) h += r.amp * Math.exp(-d * d);
        }
        if (h <= COLD) continue;                       // stays a dot (already drawn)
        h *= 0.55 + 0.45 * m;                          // thin wall edges warm a little less
        const v = Math.min(1, h);
        const u = v * top + 0.5 + (hash(k, this.deal) - 0.5) * 1.6 * Math.min(1, h * 2);
        const idx = clamp(Math.floor(u), 1, top);
        if (idx === 1) continue;                       // the lightest step is the dot itself
        // Clear this cell's dot and draw its character instead
        ctx.clearRect(cx - halfW, cy - halfH, halfW * 2, halfH * 2);
        let x = cx, y = cy;
        if (lean > 0.002) {
          const dx = this.hx - x, dy = this.hy - y, d2 = dx * dx + dy * dy;
          if (d2 < far2) {
            const f = 1 - d2 / far2, d = Math.sqrt(d2) || 1;
            const s = Math.min(d * 0.6, 14 * lean * f * f);
            x += (dx / d) * s; y += (dy / d) * s;
          }
        }
        ctx.fillStyle = INKS[Math.min(3, Math.floor(v * 4))];
        ctx.fillText(RAMP[idx], x, y);
      }
    }
  }
}
