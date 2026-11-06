import type { ReactNode } from 'react';
import './Chip.css';

interface ChipProps {
  /** Visually hidden prefix so screen readers hear "Format: Online" rather than just "Online". */
  label?: string;
  children: ReactNode;
}

/** Neutral, read-only tag. Always text, never colour alone. */
export function Chip({ label, children }: ChipProps) {
  return (
    <span className="chip">
      {label && <span className="visually-hidden">{label}: </span>}
      {children}
    </span>
  );
}
