import { useState } from 'react';
import { NEWSLETTER_FORM_URL } from './site';

export type SignupState = 'idle' | 'sending' | 'done' | 'error';

/**
 * Sends an address straight to our Brevo signup form (double opt-in: Brevo emails a confirmation link),
 * so BuilderBee itself never stores it. Used by the hero and the newsletter boxes.
 */
export function useNewsletterSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SignupState>('idle');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const body = new FormData();
    body.append('EMAIL', email.trim());
    body.append('email_address_check', '');   // Brevo's spam trap: must stay empty
    body.append('locale', 'en');
    try {
      // Brevo doesn't allow reading the reply from another site, so a sent request counts as success
      await fetch(NEWSLETTER_FORM_URL, { method: 'POST', body, mode: 'no-cors' });
      setState('done');
    } catch {
      setState('error');
    }
  };
  return { email, setEmail, state, submit, enabled: Boolean(NEWSLETTER_FORM_URL) };
}

export const CONFIRM_MESSAGE =
  'Nearly there! Check your inbox for an email from BuilderBee (hello@builderbee.club) and click “Yes, send me the weekly email”. It can take a minute, so check spam too.';
