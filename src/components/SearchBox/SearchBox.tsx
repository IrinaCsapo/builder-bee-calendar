import { useRef, type FormEvent } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when the visitor presses Enter or the Search button. */
  onSubmit?: () => void;
}

/**
 * Pill search bar with a dark Search button. Results filter as you type;
 * Search / Enter jumps to the results.
 */
export function SearchBox({ value, onChange, onSubmit }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const submit = (e: FormEvent) => { e.preventDefault(); onSubmit?.(); };

  return (
    <form className="search-box" role="search" onSubmit={submit}>
      {/* Visually hidden but announced; the icon, placeholder and Search button make the purpose clear on screen */}
      <label htmlFor="event-search" className="visually-hidden">Search events</label>
      <div className="search-box__field">
        <span className="search-box__icon" aria-hidden="true">🔍</span>
        <input
          ref={inputRef}
          id="event-search"
          className="search-box__input"
          type="search"
          value={value}
          maxLength={100}
          placeholder="Event, organiser, city or theme"
          autoComplete="off"
          enterKeyHint="search"
          aria-describedby="event-search-hint"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape' && value) { e.preventDefault(); onChange(''); } }}
        />
        {value && (
          <button
            type="button"
            className="search-box__clear"
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
          >
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">Clear search</span>
          </button>
        )}
        <button type="submit" className="search-box__submit">Search</button>
      </div>
      <p id="event-search-hint" className="visually-hidden">Results update as you type.</p>
    </form>
  );
}
