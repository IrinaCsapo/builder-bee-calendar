import { useEffect, useRef } from 'react';
import { HiveCanvas } from './hive';
import { WakeHive } from './wakeHive';
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

/**
 * Hero lab version: a halftone honeycomb that turns into ASCII characters where the pointer
 * moves (see wakeHive.ts). It listens for the pointer on the hero itself, so it works over the text too.
 */
export function WakeHivePattern() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const stage = canvas?.parentElement;
    if (!canvas || !stage) return;
    const hive = new WakeHive(canvas, stage);
    return () => hive.destroy();
  }, []);
  return <canvas ref={ref} className="hive-pattern hive-pattern--wake" aria-hidden="true" />;
}
