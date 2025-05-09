// src/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';

// App Loader component that handles error fallbacks
const AppLoader = () => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Set timeout to detect if app is taking too long to load
    const failsafeTimer = setTimeout(() => {
      console.log("Application may be stuck, showing failsafe UI");
      setHasError(true);
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(failsafeTimer);
  }, []);
  
  if (hasError) {
    // Display simple, functional version of the game
    return <SimplifiedGame />;
  }

  try {
    // Try to load the main App
    const App = require('./App').default;
    return <App />;
  } catch (error) {
    console.error("Failed to load main App:", error);
    return <SimplifiedGame />;
  }
};

// Very simplified game component as emergency fallback
const SimplifiedGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState(null);
  
  const handleCushionClick = () => {
    setScore(prev => prev + 1);
    const quotes = [
      "Zeus: My thunderous expulsions shake the heavens!",
      "Odin: By my throne in Asgard, what a release!",
      "Pele: My volcanic emissions flow like lava!",
      "Pan: The forest spirits dance with my release!",
      "Athena: Even wisdom acknowledges the necessity of release!"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setMessage(randomQuote);
    
    setTimeout(() => setMessage(null), 3000);
  };
  
  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="intro-screen">
          <h1>Whoopee Chaos</h1>
          <p>The divine flatulence game of mythical proportions!</p>
          <button onClick={() => setGameStarted(true)}>Begin Divine Journey</button>
          <p className="fallback-note">Running in simplified mode</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <div className="simplified-game">
        <div className="score-display">
          <h2>Divine Chaos: {score}</h2>
        </div>
        
        <div className="cushion-container">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              className={`simplified-cushion cushion-${i}`}
              onClick={handleCushionClick}
            >
              Click me
            </button>
          ))}
        </div>
        
        {message && (
          <div className="divine-message">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

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
      <AppLoader />
    </React.StrictMode>
  );
} else {
  // If root element exists, use it
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppLoader />
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
