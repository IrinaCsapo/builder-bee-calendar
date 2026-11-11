import { useEffect, useRef } from 'react';
import { AsciiBeeSky } from '../../ascii/bees';
import './AsciiBees.css';

/** White ASCII bees drifting behind the hero content (hero lab). Decorative. */
export function AsciiBees({ count = 4 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const sky = new AsciiBeeSky(ref.current, count);
    return () => sky.destroy();
  }, [count]);
  return <canvas ref={ref} className="ascii-bees" aria-hidden="true" />;
}
