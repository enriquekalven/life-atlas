import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SceneErrorBoundary } from './components/SceneErrorBoundary';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      {/* App-level boundary: an unexpected error shows a friendly card, never a blank page. */}
      <SceneErrorBoundary title="TerraFauna 3D Atlas">
        <App />
      </SceneErrorBoundary>
    </React.StrictMode>
  );
}
