import type { CSSProperties } from 'react';
import './HeroBees.css';

// Pixel bees, in the spirit of the BuilderBee logo: antennae, round wings,
// striped body, stinger. Two frames (wings up / wings down) make them flap.
const WINGS_UP = [
  '  ▀▄ ▄▀  ',
  '▄▀▀▄█▄▀▀▄',
  '▀▄▄█▓█▄▄▀',
  '   █▓█   ',
  '    ▀    ',
].join('\n');
const WINGS_DOWN = [
  '  ▀▄ ▄▀  ',
  '   ▄█▄   ',
  '▄▀▀█▓█▀▀▄',
  '▀▄▄█▓█▄▄▀',
  '    ▀    ',
].join('\n');

// The big ASCII bee (as supplied). String.raw keeps the backslashes.
const ASCII_BEE = String.raw`              \     /
          \    o ^ o    /
            \ (     ) /
 ____________(%%%%%%%)____________
(     /   /  )%%%%%%%(  \   \     )
(___/___/__/           \__\___\___)
   (     /  /(%%%%%%%)\  \     )
    (__/___/ (%%%%%%%) \___\__)
            /(       )\
          /   (%%%%%)   \
               (%%%)
                 !`;

export type BeeStyle = 'pixel' | 'ascii';

// Fewer, calmer flights for the big ASCII bee
const ASCII_FLIGHTS: Flight[] = [
  { x: '-4%', y: '6%', size: 11, dx: '4vw', dy: '4vh', dur: 30, delay: 0, phone: true },
  { x: '83%', y: '3%', size: 10, dx: '-3vw', dy: '6vh', dur: 34, delay: -9 },
  { x: '86%', y: '54%', size: 12, dx: '-4vw', dy: '-5vh', dur: 28, delay: -4 },
  { x: '-3%', y: '60%', size: 10, dx: '4vw', dy: '-4vh', dur: 32, delay: -15 },
]

interface Flight { x: string; y: string; size: number; dx: string; dy: string; dur: number; delay: number; phone?: boolean }

// Start position, size, and how each bee's flight loop runs
const FLIGHTS: Flight[] = [
  { x: '6%', y: '12%', size: 18, dx: '10vw', dy: '7vh', dur: 24, delay: 0, phone: true },
  { x: '80%', y: '8%', size: 14, dx: '-9vw', dy: '9vh', dur: 29, delay: -6, phone: true },
  { x: '14%', y: '58%', size: 12, dx: '8vw', dy: '-8vh', dur: 21, delay: -11 },
  { x: '86%', y: '52%', size: 20, dx: '-11vw', dy: '-6vh', dur: 27, delay: -3 },
  { x: '28%', y: '30%', size: 10, dx: '-6vw', dy: '10vh', dur: 33, delay: -17 },
  { x: '66%', y: '74%', size: 13, dx: '7vw', dy: '-9vh', dur: 25, delay: -9, phone: true },
];

/**
 * Decorative bees flying around the hero. Hidden from screen readers, never catch clicks.
 * style="pixel": small flapping pixel bees. style="ascii": the big ASCII bee.
 */
export function HeroBees({ style = 'pixel' }: { style?: BeeStyle }) {
  if (style === 'ascii') {
    return (
      <div className="hero-bees" aria-hidden="true">
        {ASCII_FLIGHTS.map((f, i) => (
          <div
            key={i}
            className={`hero-bees__flight${f.phone ? '' : ' hero-bees__flight--wide-only'}`}
            style={{ left: f.x, top: f.y, '--dx': f.dx, '--dy': f.dy, '--dur': `${f.dur}s`, '--delay': `${f.delay}s` } as CSSProperties}
          >
            <pre className="hero-bees__ascii" style={{ fontSize: `${f.size}px` }}>{ASCII_BEE}</pre>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="hero-bees" aria-hidden="true">
      {FLIGHTS.map((f, i) => (
        <div
          key={i}
          className={`hero-bees__flight${f.phone ? '' : ' hero-bees__flight--wide-only'}`}
          style={{ left: f.x, top: f.y, '--dx': f.dx, '--dy': f.dy, '--dur': `${f.dur}s`, '--delay': `${f.delay}s` } as CSSProperties}
        >
          <div className="hero-bees__bee" style={{ fontSize: `${f.size}px`, '--flap-delay': `${i * -0.07}s` } as CSSProperties}>
            <pre className="hero-bees__frame hero-bees__frame--up">{WINGS_UP}</pre>
            <pre className="hero-bees__frame hero-bees__frame--down">{WINGS_DOWN}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
