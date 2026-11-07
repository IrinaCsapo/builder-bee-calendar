import { useEffect, useRef, type ReactNode } from 'react';
import { AsciiGarden as Garden } from '../../ascii/garden';
import './AsciiGarden.css';

// The creatures fly around these, never across them, so text stays readable.
const AVOID = ['.hero__title', '.hero__lede', '.hero__search', '.featured'];

/** Wraps content in a stage with ASCII bees and butterflies flying behind it. */
export function AsciiGarden({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!stageRef.current || !canvasRef.current) return;
    const garden = new Garden(canvasRef.current, stageRef.current, AVOID);
    return () => garden.destroy();
  }, []);

  return (
    <div ref={stageRef} className="ascii-garden">
      {/* Decorative: hidden from screen readers, doesn't catch clicks */}
      <canvas ref={canvasRef} className="ascii-garden__canvas" aria-hidden="true" />
      <div className="ascii-garden__content">{children}</div>
    </div>
  );
}
