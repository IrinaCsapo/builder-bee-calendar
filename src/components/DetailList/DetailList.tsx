import type { ReactNode } from 'react';
import './DetailList.css';

export interface DetailItem {
  term: string;
  value: ReactNode;
}

/** A <dl> of label/value pairs. Items with an empty value are skipped. */
export function DetailList({ items }: { items: DetailItem[] }) {
  return (
    <dl className="detail-list">
      {items
        .filter((item) => item.value !== undefined && item.value !== null && item.value !== '')
        .map((item) => (
          <div key={item.term} className="detail-list__row">
            <dt>{item.term}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
    </dl>
  );
}
