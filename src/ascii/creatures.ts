// ASCII bees and butterflies, drawn on a canvas cell grid.
// Technique inspired by ascii-sharks (MIT, drewdi): each creature is defined
// as simple shapes, then every grid cell it covers is sampled to decide a
// material, a soft tinted block and a glyph from a density ramp.

export type CreatureKind = 'bee' | 'butterfly';

export interface Creature {
  kind: CreatureKind;
  x: number;        // centre, px
  y: number;
  heading: number;  // radians, 0 = flying right
  size: number;     // 1 = default (~17 cells long for a bee)
  phase: number;    // wing phase, radians
  seed: number;     // per-creature randomness for glyph shimmer
  hue?: 0 | 1 | 2;  // butterfly colour variant
}

// Materials (what a sample point hits)
const NONE = 0, STRIPE_DARK = 1, STRIPE_GOLD = 2, FUZZ = 3, HEAD = 4, EYE = 5, WING = 6,
  WING_RIM = 7, LINE = 8, BF_WING = 9, BF_SPOT = 10, BF_RIM = 11, BF_BODY = 12;

type RGB = [number, number, number];
// Soft greyscale look, like ascii-sharks: light grey blocks, dark glyphs, colour only as a hint.
// Brand touches: honey #F6B93B and plum #4A1D6B appear in tints, spots and the odd sparkle.
const STYLE: Record<number, { fill: RGB; fillA: number; ink: string; ramp: string }> = {
  [STRIPE_DARK]: { fill: [92, 86, 98], fillA: 0.78, ink: '#f2efe6', ramp: '#@8%' },
  [STRIPE_GOLD]: { fill: [232, 220, 192], fillA: 0.7, ink: '#3a3442', ramp: 'SXt%' },
  [FUZZ]:        { fill: [214, 206, 192], fillA: 0.6, ink: '#2b2532', ramp: '%t;:' },
  [HEAD]:        { fill: [96, 92, 104], fillA: 0.7, ink: '#f2f0f5', ramp: '@#8' },
  [EYE]:         { fill: [28, 26, 32], fillA: 0.9, ink: '#ffffff', ramp: 'o' },
  [WING]:        { fill: [238, 236, 242], fillA: 0.55, ink: '#8a8494', ramp: ".:'-" },
  [WING_RIM]:    { fill: [214, 210, 220], fillA: 0.5, ink: '#6b6576', ramp: ":;'" },
  [LINE]:        { fill: [0, 0, 0], fillA: 0, ink: '#4a4552', ramp: "'.`" },
  [BF_WING]:     { fill: [206, 198, 214], fillA: 0.6, ink: '#2b2532', ramp: 'tS%X' },
  [BF_SPOT]:     { fill: [246, 185, 59], fillA: 0.55, ink: '#3a2a10', ramp: 'o@8' },
  [BF_RIM]:      { fill: [132, 124, 142], fillA: 0.65, ink: '#16141a', ramp: '#@%' },
  [BF_BODY]:     { fill: [70, 66, 78], fillA: 0.8, ink: '#e8e5ee', ramp: '|!' },
};
// Butterfly tints: plum-grey (default), lavender-grey, cream
const BF_VARIANTS: { wing: RGB; rim: RGB; spot: RGB }[] = [
  { wing: [204, 194, 216], rim: [128, 116, 144], spot: [246, 185, 59] },
  { wing: [218, 214, 232], rim: [146, 138, 164], spot: [180, 150, 214] },
  { wing: [234, 226, 206], rim: [150, 140, 122], spot: [246, 185, 59] },
];
// Rare sparkle colours: honey, plum, lavender, white
const ACCENTS = ['#f6b93b', '#4a1d6b', '#b48ad8', '#ffffff'];

const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Bee, side view, facing +x. Units ≈ one cell width. Returns the material at (x, y).
 * Wings flap fast: `flap` in [-1, 1].
 */
function beeAt(x: number, y: number, flap: number): number {
  // Eye and head first (they sit on top)
  if (inEllipse(x, y, 6.6, -0.6, 0.55, 0.55) <= 1) return EYE;
  if (inEllipse(x, y, 6.0, -0.1, 1.6, 1.75) <= 1) return HEAD;
  // Thorax: fuzzy gold
  if (inEllipse(x, y, 3.4, -0.2, 2.1, 2.2) <= 1) return FUZZ;
  // Abdomen with stripes
  const a = inEllipse(x, y, -1.6, 0.3, 4.4, 2.7);
  if (a <= 1) return Math.floor((x + 6.5) / 1.6) % 2 === 0 ? STRIPE_DARK : STRIPE_GOLD;
  // Stinger
  if (x < -5.6 && x > -7.4 && Math.abs(y - 0.5) < (x + 7.4) * 0.3) return STRIPE_DARK;
  // Wings: two lobes above the thorax, height follows the flap
  const lift = 0.35 + 0.65 * Math.abs(flap);
  const back = inEllipse(x, y, 1.0, -2.9 - 1.6 * lift, 3.6, 1.15 + 1.25 * lift);
  const front = inEllipse(x, y, 3.0, -2.6 - 1.3 * lift, 2.6, 0.9 + 1.0 * lift);
  if (back <= 0.72 || front <= 0.72) return WING;
  if (back <= 1 || front <= 1) return WING_RIM;
  // Antennae and legs
  if (distToSegment(x, y, 6.6, -1.6, 8.0, -3.9) < 0.32 || distToSegment(x, y, 8.0, -3.9, 9.0, -3.7) < 0.32) return LINE;
  for (const lx of [1.8, 3.4, 4.8]) if (distToSegment(x, y, lx, 1.8, lx - 0.6, 3.3) < 0.28) return LINE;
  return NONE;
}

/**
 * Butterfly, top view, flying towards +x. Wings open and close: `open` in [0.15, 1].
 */
function butterflyAt(x: number, y: number, open: number): number {
  if (inEllipse(x, y, 0, 0, 3.6, 0.65) <= 1) return BF_BODY;
  if (distToSegment(x, Math.abs(y), 3.2, 0.3, 5.6, 1.8) < 0.26) return LINE; // antennae
  const ay = Math.abs(y);              // mirror: both sides the same
  const s = open;                      // wings narrow towards the body as they close
  const fore = inEllipse(x, ay, 1.0, 0.4 + 3.6 * s, 3.3, 3.5 * s + 0.25);
  const hind = inEllipse(x, ay, -2.2, 0.3 + 2.6 * s, 2.5, 2.6 * s + 0.25);
  const wing = Math.min(fore, hind);
  if (wing > 1) return NONE;
  // Spots: one near each fore- and hind-wing tip
  if (inEllipse(x, ay, 2.2, 0.4 + 5.2 * s, 0.9, 0.85 * s + 0.2) <= 1) return BF_SPOT;
  if (inEllipse(x, ay, -3.0, 0.3 + 3.8 * s, 0.7, 0.7 * s + 0.15) <= 1) return BF_SPOT;
  return wing > 0.62 ? BF_RIM : BF_WING;
}

// Deterministic hash for glyph choice and shimmer
function hash(a: number, b: number, c: number) {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const SUB: [number, number][] = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75], [0.5, 0.5]];

/**
 * Rasterise one creature into the cell grid and paint it.
 * `cw`/`ch` are the cell size in px; `t` is time in seconds (drives shimmer).
 */
export function drawCreature(ctx: CanvasRenderingContext2D, c: Creature, cw: number, ch: number, t: number) {
  const unit = cw * c.size;                    // one shape unit in px
  const reach = (c.kind === 'bee' ? 10.5 : 7.5) * unit;
  const cos = Math.cos(-c.heading), sin = Math.sin(-c.heading);
  const flip = c.kind === 'bee' && Math.cos(c.heading) < 0 ? -1 : 1; // bees stay upright when flying left

  const col0 = Math.max(0, Math.floor((c.x - reach) / cw));
  const col1 = Math.ceil((c.x + reach) / cw);
  const row0 = Math.max(0, Math.floor((c.y - reach) / ch));
  const row1 = Math.ceil((c.y + reach) / ch);

  const flap = Math.sin(c.phase);
  const open = 0.18 + 0.82 * (0.5 + 0.5 * Math.cos(c.phase));
  const variant = BF_VARIANTS[c.hue ?? 0];
  const counts = new Uint8Array(13);

  for (let row = row0; row <= row1; row++) {
    for (let col = col0; col <= col1; col++) {
      counts.fill(0);
      let hits = 0;
      for (const [sx, sy] of SUB) {
        const px = (col + sx) * cw - c.x;
        const py = (row + sy) * ch - c.y;
        // into creature space
        let lx = (px * cos - py * sin) / unit;
        let ly = (px * sin + py * cos) / unit;
        if (flip < 0) ly = -ly; // mirror so a bee flying left isn't upside down
        const m = c.kind === 'bee' ? beeAt(lx, ly, flap) : butterflyAt(lx, ly, open);
        if (m !== NONE) { counts[m]++; hits++; }
      }
      if (!hits) continue;

      let mat = 0, best = 0;
      for (let m = 1; m < counts.length; m++) if (counts[m] > best) { best = counts[m]; mat = m; }
      const style = STYLE[mat];
      const x = col * cw, y = row * ch;
      const key = col * 92821 + row * 6271 + c.seed;
      const tick = Math.floor(t * 2.2 + (key % 97) / 31);
      const roll = hash(key, tick, 3);
      const coverage = hits / SUB.length;

      // Partial cells: soft edge glyph only, no block
      if (coverage < 0.6 && mat !== EYE) {
        ctx.fillStyle = mat === WING || mat === WING_RIM ? '#9a94a4' : '#6b6576';
        ctx.globalAlpha = 0.55 + coverage * 0.4;
        ctx.fillText(".'`,:"[Math.floor(roll * 5)], x + cw / 2, y + ch / 2 + 1);
        ctx.globalAlpha = 1;
        continue;
      }

      let fill = style.fill;
      if (c.kind === 'butterfly') {
        if (mat === BF_WING) fill = variant.wing;
        else if (mat === BF_RIM) fill = variant.rim;
        else if (mat === BF_SPOT) fill = variant.spot;
      }
      if (style.fillA > 0) {
        ctx.fillStyle = `rgba(${fill[0]},${fill[1]},${fill[2]},${style.fillA})`;
        ctx.fillRect(x + 1, y + 1, cw - 1, ch - 1);
      }
      const glyph = style.ramp[Math.floor(hash(key, tick, 9) * style.ramp.length)];
      ctx.fillStyle = roll < 0.06 ? ACCENTS[key % ACCENTS.length] : style.ink;
      ctx.fillText(glyph, x + cw / 2, y + ch / 2 + 1);
    }
  }
}

/** Faint cell grid, like graph paper. */
export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, cw: number, ch: number) {
  ctx.fillStyle = 'rgba(74, 29, 107, 0.05)';
  for (let x = 0; x <= w; x += cw) ctx.fillRect(Math.round(x), 0, 1, h);
  for (let y = 0; y <= h; y += ch) ctx.fillRect(0, Math.round(y), w, 1);
}
