import { useEffect, useRef } from 'react';
import { HiveCanvas } from './hive';
import './HivePattern.css';

/** Light pixel honeycomb behind the hero, with a shimmer every few seconds. Decorative. */
export function HivePattern() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const hive = new HiveCanvas(ref.current);
    return () => hive.destroy();
  }, []);
  return <canvas ref={ref} className="hive-pattern" aria-hidden="true" />;
}
