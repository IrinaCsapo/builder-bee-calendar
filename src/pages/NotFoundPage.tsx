import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage({ message = 'That page doesn’t exist.' }: { message?: string }) {
  useDocumentTitle('Page not found');
  return (
    <div className="container" style={{ paddingBlock: 'var(--space-8)' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-plum)' }}>Page not found</h1>
      <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-lg)' }}>{message}</p>
      <p style={{ marginTop: 'var(--space-4)' }}>
        <a href="#/" style={{ fontWeight: 700 }}>See all upcoming events</a>
      </p>
    </div>
  );
}
