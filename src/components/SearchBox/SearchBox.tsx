import { useRef } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

/** Visible label, a real <input type="search">, and a clear button that returns focus to the input. */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="search-box" role="search">
      <label htmlFor="event-search" className="search-box__label">Search</label>
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
      </div>
      <p id="event-search-hint" className="visually-hidden">Results update as you type.</p>
    </div>
  );
}
