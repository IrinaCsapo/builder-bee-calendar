// A still pixel bee (the same sprite as the flying ones in the hero), for illustrations.
const ROWS = [
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
const COLOURS: Record<string, string> = { K: '#000000', Y: '#FFC93C', W: '#FFFFFF' };

export function PixelBee({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-0.5 -0.5 14 13" shapeRendering="crispEdges" aria-hidden="true">
      {/* outline first, one pixel bigger all round, so the white wings show on any background */}
      {ROWS.flatMap((row, y) => [...row].map((ch, x) => (COLOURS[ch]
        ? <rect key={`o${x}-${y}`} x={x - 0.2} y={y - 0.2} width={1.4} height={1.4} fill="#1a1a1a" />
        : null)))}
      {ROWS.flatMap((row, y) => [...row].map((ch, x) => (COLOURS[ch]
        ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={COLOURS[ch]} />
        : null)))}
    </svg>
  );
}
