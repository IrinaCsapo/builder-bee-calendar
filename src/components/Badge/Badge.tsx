import type { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'honey' | 'plum';
  children: ReactNode;
}

/** Highlighted label for things people filter on (Free, Beginner friendly). */
export function Badge({ variant = 'honey', children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
