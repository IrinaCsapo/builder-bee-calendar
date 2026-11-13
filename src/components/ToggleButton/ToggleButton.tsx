import { CheckIcon } from '@heroicons/react/20/solid';
import type { ReactNode } from 'react';
import './ToggleButton.css';

interface ToggleButtonProps {
  pressed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * A real <button> with aria-pressed. The pressed state is shown three ways:
 * a check mark, a filled background, and a heavier border, never colour alone.
 */
export function ToggleButton({ pressed, onToggle, children }: ToggleButtonProps) {
  return (
    <button type="button" className="toggle" aria-pressed={pressed} onClick={onToggle}>
      <span className="toggle__check" aria-hidden="true">{pressed && <CheckIcon className="icon" />}</span>
      {children}
    </button>
  );
}
