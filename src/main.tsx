// Import process polyfill first to ensure it's loaded before anything else
import './utils/process-polyfill';
// Import local server fix
import './utils/rate-limiter/localServerFix';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
