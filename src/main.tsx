import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe Service Worker register block to enhance mobile PWA support offline
try {
  const isIframe = typeof window !== 'undefined' && (window.self !== window.top || window.parent !== window);
  if (!isIframe && typeof window !== 'undefined' && 'serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => {
            console.log('ASUNA Service Worker registered successfully:', reg.scope);
          })
          .catch(err => {
            console.warn('ASUNA Service Worker registration bypassed:', err);
          });
      } catch (innerErr) {
        console.warn('Immediate register call error:', innerErr);
      }
    });
  }
} catch (swError) {
  console.warn('Bypassed SW registration block:', swError);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
