import { useEffect } from 'react';

const SITE = 'BuilderBee';

/** Sets the browser tab title, e.g. "FemmeHacks · BuilderBee". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
