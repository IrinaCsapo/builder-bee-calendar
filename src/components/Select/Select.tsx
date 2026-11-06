import './Select.css';

interface SelectProps {
  id: string;
  label: string;
  value: string;
  allLabel: string;            // e.g. "All types", the empty option
  options: readonly string[];
  onChange: (value: string) => void;
}

/** Native <select> with a visible <label>. Keyboard and screen reader support come for free. */
export function Select({ id, label, value, allLabel, options, onChange }: SelectProps) {
  return (
    <div className="select">
      <label className="select__label" htmlFor={id}>{label}</label>
      <select id={id} className="select__control" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
