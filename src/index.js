import React from 'react';
import ReactDOM from 'react-dom/client';
// Change this import to use one of your simplified versions
import SimpleApp from './SimpleApp';  // Try this one first
// OR
// import StandaloneApp from './StandaloneApp';
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
