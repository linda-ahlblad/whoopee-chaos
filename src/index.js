// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { initMobileOptimizations } from './utils/mobileUtils';

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', () => {
  initMobileOptimizations();
});

// Initialize the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  // If root element not found, create it
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
  
  const root = ReactDOM.createRoot(newRoot);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // If root element exists, use it
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Console branding - simpler for production
if (process.env.NODE_ENV === 'production') {
  console.log('Whoopee Chaos - The divine flatulence game');
} else {
  console.log(`
%c Whoopee Chaos %c v1.0.0 %c
%c The divine flatulence game of mythical proportions!
`,
  'background: #8e2de2; color: white; font-weight: bold; padding: 4px 0;',
  'background: #4a6da7; color: white; font-weight: normal; padding: 4px 0;',
  'background: transparent;',
  'color: #e94822; font-style: italic;'
  );
}
