import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import './styles/index.css';

// Modalité de saisie : le contour de focus renforcé (index.css) ne s'affiche qu'après une touche de navigation ;
// à la souris, les anneaux d'origine (shadcn / Tailwind) restent identiques à l'original.
const root = document.documentElement;
document.addEventListener('keydown', (e) => { if (e.key === 'Tab' || e.key.startsWith('Arrow') || e.key === 'Enter' || e.key === ' ') root.dataset.kbd = ''; }, true);
document.addEventListener('pointerdown', () => { delete root.dataset.kbd; }, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
