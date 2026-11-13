import { LinkIcon } from '@heroicons/react/20/solid';
import { useRef, useState } from 'react';
import './ShareLink.css';

interface ShareLinkProps {
  title: string;
}

/** Copies the current page URL. Uses the phone's share sheet when there is one. */
export function ShareLink({ title }: ShareLinkProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const url = window.location.href;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage('Link copied');
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // user closed the share sheet
      // Older browsers: select the text box and use the legacy copy command
      inputRef.current?.select();
      const copied = document.execCommand?.('copy');
      setMessage(copied ? 'Link copied' : 'Could not copy. Select the link below to copy it.');
    }
    window.setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="share-link">
      <button type="button" className="share-link__button hive-hover hive-hover--on-light" onClick={share}>
        <LinkIcon className="icon" aria-hidden="true" /> Share this event
      </button>
      <input
        className="share-link__url"
        type="text"
        readOnly
        ref={inputRef}
        value={url}
        aria-label="Link to this event"
        onFocus={(e) => e.currentTarget.select()}
      />
      <p className="share-link__status" role="status">{message}</p>
    </div>
  );
}
