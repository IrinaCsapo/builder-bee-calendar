import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface WordRotatorProps {
  /** The first word is the one it starts and finishes on */
  words: string[];
  /** Milliseconds each word stays */
  every?: number;
  /** Full rounds before it settles back on the first word (moving content should stop) */
  rounds?: number;
}

/**
 * Swaps the last word of the headline: hackathon → workshop → buildathon → …
 * Decorative: the heading carries the full sentence for screen readers, so this is aria-hidden.
 * No movement with reduced motion; it settles on the first word after a few rounds.
 */
export function WordRotator({ words, every = 2400, rounds = 2 }: WordRotatorProps) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number>();
  const measure = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let step = 0;
    const total = words.length * rounds;           // ends back on words[0]
    const id = window.setInterval(() => {
      if (document.hidden) return;                 // don't race through words in a background tab
      step += 1;
      setIndex(step % words.length);
      if (step >= total) window.clearInterval(id);
    }, every);
    return () => window.clearInterval(id);
  }, [words, every, rounds]);

  // The space for the word eases to each new word's width, so the line doesn't jump
  useLayoutEffect(() => {
    const el = measure.current?.children[index] as HTMLElement | undefined;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [index]);

  return (
    <span className="word-rotator" aria-hidden="true" style={{ width }}>
      <span key={index} className="word-rotator__word">{words[index]}</span>
      {/* Invisible copies, used to measure each word */}
      <span ref={measure} className="word-rotator__measure">
        {words.map((w) => <span key={w}>{w}</span>)}
      </span>
    </span>
  );
}
