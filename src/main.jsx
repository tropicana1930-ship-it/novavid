import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { register } from '@/lib/serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);

// Register the service worker for offline support
register();