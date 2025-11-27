// Agrega el import:
import { HelmetProvider } from 'react-helmet-async'; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ... (otros imports)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Esta es la parte CRÍTICA: Envolver <App /> */}
    <HelmetProvider> 
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);