import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp';
import './styles/global.css';

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
      <SimpleApp />
    </React.StrictMode>
  );
} else {
  // If root element exists, use it
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
}

// Console message
console.log('Whoopee Chaos - The divine flatulence game (Simple Version)');
