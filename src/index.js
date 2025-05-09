import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleApp from './SimpleApp';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found!");
}

console.log('Whoopee Chaos - The divine flatulence game (Simple Version)');
