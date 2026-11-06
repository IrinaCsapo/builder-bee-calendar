import { useEffect } from 'react';

const SITE = 'Builder Bee Calendar';

/** Sets the browser tab title, e.g. "FemmeHacks · Builder Bee Calendar". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : SITE;
  }, [title]);
}
