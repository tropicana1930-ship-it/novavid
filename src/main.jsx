import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css'; // 👈 ¡Muy importante! Sin esto no hay estilos (Tailwind)

// Importamos el registro del Service Worker para la PWA
import * as serviceWorkerRegistration from './lib/serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);

// Activamos el Service Worker
serviceWorkerRegistration.register();