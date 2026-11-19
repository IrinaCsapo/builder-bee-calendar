import { CheckIcon, LinkIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import './ShareLink.css';

/** One button that copies the event's own address (without filters or extras). */
export function ShareLink({ title }: { title: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const url = window.location.origin + window.location.pathname;

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Older browsers: copy through a hidden text box
      const box = document.createElement('textarea');
      box.value = url;
      box.setAttribute('readonly', '');
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.select();
      ok = document.execCommand?.('copy') ?? false;
      box.remove();
    }
    setState(ok ? 'copied' : 'failed');
    window.setTimeout(() => setState('idle'), 3000);
  };

  return (
    <div className="share-link">
      <button type="button" className="share-link__button" onClick={copy}>
        {state === 'copied'
          ? <><CheckIcon className="icon" aria-hidden="true" /> Link copied</>
          : <><LinkIcon className="icon" aria-hidden="true" /> Copy event link</>}
        <span className="visually-hidden"> for {title}</span>
      </button>
      {/* "Link copied" is shown on the button; screen readers hear it here. Only a failure shows below. */}
      <p className={`share-link__status${state === 'copied' ? ' visually-hidden' : ''}`} role="status">
        {state === 'copied' ? 'Link copied' : state === 'failed' ? `Couldn’t copy. The link is ${url}` : ''}
      </p>
    </div>
  );
}
