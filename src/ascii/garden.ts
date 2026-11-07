// A small garden of ASCII bees and butterflies flying around the hero.
// Decorative only: the canvas is aria-hidden and ignores pointer events.
import { drawCreature, drawGrid, type Creature, type CreatureKind } from './creatures';

const CW = 9;   // cell size in px
const CH = 15;

interface Flyer extends Creature {
  vx: number;
  vy: number;
  tx: number;        // wander target
  ty: number;
  retarget: number;  // seconds until a new target
  speed: number;
}

interface Rect { x: number; y: number; w: number; h: number }

export class AsciiGarden {
  private ctx: CanvasRenderingContext2D;
  private flyers: Flyer[] = [];
  private avoid: Rect[] = [];
  private W = 0;
  private H = 0;
  private raf = 0;
  private last = 0;
  private time = 0;
  private frameCount = 0;
  private lastWidth = 0;
  private visible = true;
  private pointer = { x: -9999, y: -9999, active: false };
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;
  private font = '600 11px ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  constructor(private canvas: HTMLCanvasElement, private stage: HTMLElement, private avoidSelectors: string[]) {
    this.ctx = canvas.getContext('2d')!;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(stage);
    this.intersection = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; this.schedule(); });
    this.intersection.observe(stage);
    this.reduced.addEventListener('change', this.onMotionChange);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    window.addEventListener('blur', this.onLeave);
    this.resize();
    this.schedule();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    this.reduced.removeEventListener('change', this.onMotionChange);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('blur', this.onLeave);
  }

  private resize() {
    const r = this.stage.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = r.width;
    this.H = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.measureAvoid();
    this.populate();
    if (this.reduced.matches || this.isNarrow()) this.drawStill();
    else this.schedule();
  }

  /** Text and panels the creatures should fly around, not across. */
  private measureAvoid() {
    const s = this.stage.getBoundingClientRect();
    this.avoid = [];
    for (const sel of this.avoidSelectors) {
      for (const el of this.stage.querySelectorAll<HTMLElement>(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width && r.height) this.avoid.push({ x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height });
      }
    }
  }

  private populate() {
    // Phones: text fills the full width, so there's nowhere to fly without
    // covering it. Show only the grid paper (and save battery).
    if (this.isNarrow()) { this.flyers = []; this.lastWidth = this.W; return; }
    const plan: [CreatureKind, number][] =
      [['bee', 1.7], ['butterfly', 1.6], ['bee', 1.35], ['butterfly', 1.3], ['bee', 1.1], ['butterfly', 1.15]];
    if (this.flyers.length === plan.length && this.lastWidth === this.W) return;
    this.lastWidth = this.W;
    // Smaller creatures on smaller stages
    const scale = Math.max(0.7, Math.min(1, this.W / 1400));
    this.flyers = plan.map(([kind, baseSize], i) => {
      const size = baseSize * scale;
      const p = this.freeSpot(i);
      return {
        kind, size, x: p.x, y: p.y, heading: 0, phase: i * 1.7, seed: 101 + i * 37,
        hue: (i % 3) as 0 | 1 | 2,
        vx: 0, vy: 0, tx: p.x, ty: p.y, retarget: 0,
        speed: kind === 'bee' ? 70 + i * 6 : 34 + i * 3,
      };
    });
  }

  /** A spot in the margins, away from text. Deterministic per index so reduced-motion stills are stable. */
  private freeSpot(i: number) {
    for (let tries = 0; tries < 40; tries++) {
      const r1 = frac(Math.sin((i + 1) * 12.9898 + tries * 78.233) * 43758.5453);
      const r2 = frac(Math.sin((i + 1) * 39.3468 + tries * 11.135) * 24634.6345);
      const x = 40 + r1 * (this.W - 80);
      const y = 30 + r2 * (this.H - 60);
      if (!this.insideAvoid(x, y, 130, 80)) return { x, y };
    }
    return { x: i % 2 ? this.W - 60 : 60, y: 60 + i * 40 };
  }

  private insideAvoid(x: number, y: number, padX: number, padY = padX) {
    return this.avoid.some((r) => x > r.x - padX && x < r.x + r.w + padX && y > r.y - padY && y < r.y + r.h + padY);
  }

  /** Half-width and half-height of a creature in px, plus a little breathing room. */
  private extent(f: { kind: CreatureKind; size: number }): [number, number] {
    const unit = CW * f.size;
    return f.kind === 'bee' ? [8.5 * unit + 8, 5.5 * unit + 8] : [6 * unit + 8, 6 * unit + 8];
  }

  private isNarrow() { return this.W < 640; }

  private schedule() {
    cancelAnimationFrame(this.raf);
    if (this.isNarrow()) { this.draw(); return; }
    if (!this.visible || document.hidden || this.reduced.matches) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    // Layout can shift (fonts, carousel slides): re-measure a few times a second
    if (++this.frameCount % 20 === 0) this.measureAvoid();
    for (const f of this.flyers) this.step(f, dt);
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private step(f: Flyer, dt: number) {
    const bee = f.kind === 'bee';
    f.retarget -= dt;
    const near = Math.hypot(f.tx - f.x, f.ty - f.y) < 30;
    if (f.retarget <= 0 || near) {
      const p = this.freeSpot(Math.floor(this.time * 7 + f.seed));
      f.tx = p.x; f.ty = p.y;
      f.retarget = bee ? 2 + Math.random() * 2.5 : 4 + Math.random() * 4;
    }

    // Steer towards the wander target
    let ax = (f.tx - f.x) * (bee ? 1.4 : 0.6);
    let ay = (f.ty - f.y) * (bee ? 1.4 : 0.6);
    // Bees zigzag, butterflies bob
    ax += Math.sin(this.time * (bee ? 9 : 2.2) + f.seed) * (bee ? 160 : 40);
    ay += Math.cos(this.time * (bee ? 7 : 3.1) + f.seed * 2) * (bee ? 120 : 70);

    // Fly around text and the honey panel. The safe zone is as big as the
    // creature itself, so wings and stingers don't cross the text either.
    const [px, py] = this.extent(f);
    for (const r of this.avoid) {
      const inside = f.x > r.x - px && f.x < r.x + r.w + px && f.y > r.y - py && f.y < r.y + r.h + py;
      if (!inside) continue;
      const dl = f.x - (r.x - px), dr = r.x + r.w + px - f.x, dtp = f.y - (r.y - py), db = r.y + r.h + py - f.y;
      const m = Math.min(dl, dr, dtp, db);
      const push = 1400 + 30 * (Math.max(px, py) - m);
      if (m === dl) ax -= push; else if (m === dr) ax += push; else if (m === dtp) ay -= push; else ay += push;
    }
    // Scatter from the mouse
    if (this.pointer.active) {
      const dx = f.x - this.pointer.x, dy = f.y - this.pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 140 && d > 0.1) { const k = (140 - d) * 14 / d; ax += dx * k; ay += dy * k; }
    }
    // Stay inside the stage
    const m = 30;
    if (f.x < m) ax += (m - f.x) * 20; if (f.x > this.W - m) ax -= (f.x - (this.W - m)) * 20;
    if (f.y < m) ay += (m - f.y) * 20; if (f.y > this.H - m) ay -= (f.y - (this.H - m)) * 20;

    f.vx += ax * dt; f.vy += ay * dt;
    const sp = Math.hypot(f.vx, f.vy);
    const max = f.speed * (this.pointer.active ? 2.2 : 1);
    if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
    f.vx *= 1 - 0.6 * dt; f.vy *= 1 - 0.6 * dt;
    f.x += f.vx * dt; f.y += f.vy * dt;

    // Facing: bees stay mostly level; butterflies turn freely (seen from above)
    const target = Math.atan2(f.vy, f.vx);
    if (bee) {
      const level = Math.cos(target) >= 0 ? 0 : Math.PI;
      const tilt = Math.max(-0.45, Math.min(0.45, Math.atan2(f.vy, Math.abs(f.vx))));
      f.heading = level === 0 ? tilt : Math.PI - tilt;
    } else {
      f.heading += angleDiff(target, f.heading) * Math.min(1, dt * 2.5);
    }
    f.phase += dt * (bee ? 38 : 5 + sp * 0.03);
  }

  private draw() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H, CW, CH);
    ctx.font = this.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of this.flyers) drawCreature(ctx, f, CW, CH, this.time);
  }

  /** Reduced motion: creatures perched in the margins, one still frame. */
  private drawStill() {
    this.flyers.forEach((f, i) => {
      const p = this.freeSpot(i);
      f.x = p.x; f.y = p.y;
      f.heading = f.kind === 'bee' ? (i % 2 ? Math.PI : 0) : -Math.PI / 2;
      f.phase = f.kind === 'bee' ? 1.2 : 0;
    });
    this.draw();
  }

  private onMotionChange = () => { if (this.reduced.matches) { cancelAnimationFrame(this.raf); this.drawStill(); } else this.schedule(); };
  private onVisibility = () => this.schedule();
  private onPointer = (e: PointerEvent) => {
    const r = this.stage.getBoundingClientRect();
    this.pointer.x = e.clientX - r.left;
    this.pointer.y = e.clientY - r.top;
    this.pointer.active = e.pointerType !== 'touch' && this.pointer.x >= 0 && this.pointer.y >= 0 && this.pointer.x <= r.width && this.pointer.y <= r.height;
  };
  private onLeave = () => { this.pointer.active = false; };
}

const frac = (n: number) => n - Math.floor(n);
function angleDiff(a: number, b: number) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
