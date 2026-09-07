import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  // index.html bozulmuşsa React hiç başlayamaz; en azından sebebini söyle.
  document.body.innerHTML =
    '<p style="color:#c5a26f;font-family:Georgia,serif;padding:2rem;text-align:center">' +
    'Oda bulunamadı: #root elemanı eksik.</p>';
} else {
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
