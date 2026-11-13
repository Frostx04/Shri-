import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { SettingsProvider } from './lib/settings';
import { loadStore } from './lib/store';

loadStore().then(() =>
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </HashRouter>
  </StrictMode>,
  ),
);
