// Pixel honeycomb with a diagonal shimmer, drawn on a canvas.
// The honeycomb is drawn once into an offscreen layer; only the shimmer animates,
// and only while a sweep is passing (every few seconds).

interface Options {
  cell: number;          // pixel size in CSS px
  radius: number;        // hexagon size (centre to corner) in CSS px
  baseAlpha: number;     // how visible the resting pattern is
  every: number;         // seconds between sweeps
  sweep: number;         // seconds a sweep takes
}

const DEFAULTS: Options = { cell: 3, radius: 34, baseAlpha: 0.32, every: 6, sweep: 1.8 };

const SQRT3 = Math.sqrt(3);
// Pointy-top hexagon edge normals (0°, 60°, 120°)
const NORMALS: [number, number][] = [[1, 0], [0.5, SQRT3 / 2], [-0.5, SQRT3 / 2]];

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Distance (px) from point to the nearest edge of the nearest hexagon in a pointy-top honeycomb. */
function edgeDistance(px: number, py: number, R: number) {
  // pixel -> fractional axial coords, then round to the nearest hex
  const q = (SQRT3 / 3 * px - py / 3) / R;
  const r = (2 / 3 * py) / R;
  let x = q, z = r, y = -x - z;
  let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz; else if (dy > dz) ry = -rx - rz; else rz = -rx - ry;
  const cx = R * SQRT3 * (rx + rz / 2);
  const cy = R * 1.5 * rz;
  const vx = px - cx, vy = py - cy;
  let m = 0;
  for (const [nx, ny] of NORMALS) m = Math.max(m, Math.abs(vx * nx + vy * ny));
  return (R * SQRT3) / 2 - m;   // apothem minus distance along the closest normal
}

export class HiveCanvas {
  private ctx: CanvasRenderingContext2D;
  private base = document.createElement('canvas');
  private cells: { x: number; y: number; a: number; d: number }[] = []; // edge pixels, d = diagonal coordinate
  private W = 0; private H = 0; private dpr = 1;
  private raf = 0; private timer = 0; private start = 0;
  private visible = true;
  private o: Options;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  private ro: ResizeObserver; private io: IntersectionObserver;

  constructor(private canvas: HTMLCanvasElement, opts: Partial<Options> = {}) {
    this.o = { ...DEFAULTS, ...opts };
    this.ctx = canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.schedule(0); });
    this.io.observe(canvas);
    this.reduced.addEventListener('change', this.onMotion);
    this.resize();
  }

  destroy() {
    cancelAnimationFrame(this.raf); clearTimeout(this.timer);
    this.ro.disconnect(); this.io.disconnect();
    this.reduced.removeEventListener('change', this.onMotion);
  }

  private resize() {
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width; this.H = r.height;
    for (const c of [this.canvas, this.base]) { c.width = Math.round(this.W * this.dpr); c.height = Math.round(this.H * this.dpr); }
    // Smaller hexagons on small screens
    const R = this.W < 640 ? this.o.radius * 0.7 : this.o.radius;
    const { cell } = this.o;
    const thick = cell * 1.6;
    this.cells = [];
    const g = this.base.getContext('2d')!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, this.W, this.H);
    for (let y = 0; y < this.H; y += cell) {
      for (let x = 0; x < this.W; x += cell) {
        const d = edgeDistance(x + cell / 2, y + cell / 2, R);
        if (d > thick) continue;
        const h = hash(x / cell, y / cell);
        if (h < 0.22) continue;                       // gaps give the pixel/dither texture
        const a = this.o.baseAlpha * (0.55 + 0.45 * h);
        this.cells.push({ x, y, a, d: x + y * 0.8 }); // diagonal coordinate for the sweep
        g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        g.fillRect(x, y, cell - 1, cell - 1);
      }
    }
    this.drawBase();
    this.schedule(400);
  }

  private drawBase() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.base, 0, 0);
  }

  /** Start the next sweep after `delay` ms (never with reduced motion or when off screen). */
  private schedule(delay: number) {
    clearTimeout(this.timer); cancelAnimationFrame(this.raf);
    if (this.reduced.matches || !this.visible || !this.cells.length) { this.drawBase(); return; }
    this.timer = window.setTimeout(() => { this.start = performance.now(); this.raf = requestAnimationFrame(this.frame); }, delay);
  }

  private frame = (now: number) => {
    const t = (now - this.start) / 1000 / this.o.sweep;           // 0 → 1 across the sweep
    if (t >= 1) { this.drawBase(); this.schedule(this.o.every * 1000); return; }
    this.drawBase();
    const { ctx, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const span = this.W + this.H * 0.8;
    const centre = -200 + t * (span + 400);                         // band travels top-left → bottom-right
    const width = 140;
    const { cell } = this.o;
    for (const c of this.cells) {
      const k = 1 - Math.abs(c.d - centre) / width;
      if (k <= 0) continue;
      const glow = k * k;                                            // soft falloff
      // warm gold at the centre of the band, white at its edges
      const g = Math.round(255 - 40 * glow), b = Math.round(255 - 140 * glow);
      ctx.fillStyle = `rgba(255,${g},${b},${Math.min(0.85, c.a + glow * 0.6).toFixed(3)})`;
      ctx.fillRect(c.x, c.y, cell - 1, cell - 1);
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private onMotion = () => this.schedule(0);
}
