import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Console branding
console.log(`
%c Whoopee Chaos %c v1.0.0 %c
%c The divine flatulence game of mythical proportions!
`,
'background: #8e2de2; color: white; font-weight: bold; padding: 4px 0;',
'background: #4a6da7; color: white; font-weight: normal; padding: 4px 0;',
'background: transparent;',
'color: #e94822; font-style: italic;'
);
