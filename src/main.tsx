import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';
import { startAnalytics } from './lib/analytics';
import { interceptLinks, redirectOldHashLinks } from './lib/router';

redirectOldHashLinks();   // before anything reads the address
interceptLinks();
startAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
