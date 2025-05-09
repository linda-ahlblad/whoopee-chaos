import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Initialize the root element
const rootElement = document.getElementById('root');

// If the root element exists, render the app
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found!");
}

// Console branding
console.log('Whoopee Chaos - The divine flatulence game');
