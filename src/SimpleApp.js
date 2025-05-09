import React, { useState, useEffect } from 'react';

// Simple fart sounds (base64 data URLs)
const fartSounds = [
  // These would be base64 encoded audio, but for now we'll use empty placeholders
  "",
  "",
  "",
  ""
];

// Cushion variants
const cushionVariants = [
  { name: "The Thundercloud", color: "#4a6da7", scoreValue: 1 },
  { name: "The Royal Roar", color: "#8e2de2", scoreValue: 2 },
  { name: "The Crimson Calamity", color: "#e94822", scoreValue: 3 },
  { name: "The Emerald Eruption", color: "#1eb980", scoreValue: 2 },
  { name: "The Golden Gale", color: "#ffcb47", scoreValue: 4 },
  { name: "The Obsidian Outburst", color: "#212121", scoreValue: 5 }
];

// Divine quotes
const divineQuotes = [
  { deity: "Zeus", quote: "My thunderous expulsions shake the heavens themselves!" },
  { deity: "Odin", quote: "By my throne in Asgard, what a magnificent release!" },
  { deity: "Pele", quote: "My volcanic emissions flow like lava through the divine realm!" },
  { deity: "Pan", quote: "The forest spirits dance when I release my sylvan zephyrs!" },
  { deity: "Midas", quote: "Even my gaseous emissions turn to gold in their opulence!" },
  { deity: "Hades", quote: "From the depths of the underworld comes this miasmic greeting!" },
  { deity: "Eris", quote: "Chaos is my domain, and chaos I shall release!" },
  { deity: "Athena", quote: "Even wisdom acknowledges the necessity of release!" }
];

// Simple App component (no Three.js dependency)
const SimpleApp = () => {
  const [gamePhase, setGamePhase] = useState('INTRO');
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [message, setMessage] = useState(null);
  const [activeVariants, setActiveVariants] = useState([]);
  const [roundTime, setRoundTime] = useState(0);
  const [maxRoundTime, setMaxRoundTime] = useState(30);

  // Generate random cushions for a round
  const generateRound = (count = 3) => {
    const variants = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * cushionVariants.length);
      variants.push({
        ...cushionVariants[randomIndex],
        id: i,
        activated: false
      });
    }
    
    return variants;
  };

  // Start a new game
  const handleStartGame = () => {
    setGamePhase('PLAYING');
    setScore(0);
    setRounds(0);
    setActiveVariants(generateRound(3));
    setRoundTime(0);
    
    // Start round timer
    const timer = setInterval(() => {
      setRoundTime(prevTime => {
        if (prevTime >= maxRoundTime - 1) {
          clearInterval(timer);
          handleRoundEnd();
          return 0;
        }
        return prevTime + 1;
      });
    }, 1000);
    
    // Store timer ID in window for cleanup
    window.gameTimer = timer;
  };

  // End current round
  const handleRoundEnd = () => {
    // Check if any cushions were activated
    const anyActivated = activeVariants.some(variant => variant.activated);
    
    if (!anyActivated) {
      // Game over if no cushions activated
      setGamePhase('GAME_OVER');
      if (window.gameTimer) {
        clearInterval(window.gameTimer);
      }
    } else {
      // Start new round with more cushions
      const newRounds = rounds + 1;
      setRounds(newRounds);
      
      const cushionCount = Math.min(3 + Math.floor(newRounds / 2), 6);
      setActiveVariants(generateRound(cushionCount));
      setRoundTime(0);
      
      // Show round message
      setMessage("Round complete! Divine chaos increases...");
      setTimeout(() => setMessage(null), 3000);
      
      // Restart timer
      const timer = setInterval(() => {
        setRoundTime(prevTime => {
          if (prevTime >= maxRoundTime - 1) {
            clearInterval(timer);
            handleRoundEnd();
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
      
      // Update timer ID
      if (window.gameTimer) {
        clearInterval(window.gameTimer);
      }
      window.gameTimer = timer;
    }
  };

  // Handle cushion activation
  const handleCushionClick = (id) => {
    // Find the clicked cushion
    const newVariants = activeVariants.map(variant => {
      if (variant.id === id && !variant.activated) {
        // Play fart sound
        try {
          const audio = new Audio();
          if (fartSounds[id % fartSounds.length]) {
            audio.src = fartSounds[id % fartSounds.length];
            audio.play().catch(e => console.log('Audio playback failed'));
          }
          
          // Try to vibrate on mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
          
          // Update score
          setScore(prevScore => prevScore + (variant.scoreValue || 1));
          
          // Show divine message
          const randomQuote = divineQuotes[Math.floor(Math.random() * divineQuotes.length)];
          setMessage(`${randomQuote.deity}: "${randomQuote.quote}"`);
          setTimeout(() => setMessage(null), 5000);
          
          // Return activated variant
          return {
            ...variant,
            activated: true
          };
        } catch (e) {
          console.log('Error activating cushion:', e);
        }
      }
      return variant;
    });
    
    setActiveVariants(newVariants);
  };

  // Restart game
  const handleRestartGame = () => {
    if (window.gameTimer) {
      clearInterval(window.gameTimer);
    }
    handleStartGame();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.gameTimer) {
        clearInterval(window.gameTimer);
      }
    };
  }, []);

  // Intro screen
  if (gamePhase === 'INTRO') {
    return (
      <div className="game-container">
        <div className="intro-screen">
          <h1>Whoopee Chaos</h1>
          <p>The divine flatulence game of mythical proportions!</p>
          <button onClick={handleStartGame}>Begin Divine Journey</button>
          <p className="simple-note">Simple version</p>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gamePhase === 'GAME_OVER') {
    return (
      <div className="game-container">
        <div className="game-over">
          <h1>Divine Judgment</h1>
          <p>You have caused chaos with {score} divine eruptions!</p>
          <p>You survived {rounds} rounds!</p>
          <button onClick={handleRestartGame}>Ascend Again</button>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="game-container">
      <div className="simple-game">
        <div className="score-display">
          <h2>Divine Chaos: {score}</h2>
          <h3>Round: {rounds}</h3>
          <div className="round-timer">
            <div className="timer-bar">
              <div 
                className="timer-fill" 
                style={{ width: `${(roundTime / maxRoundTime) * 100}%` }}
              ></div>
            </div>
            <span>{maxRoundTime - roundTime}s</span>
          </div>
        </div>

        <div className="simple-cushions-container">
          {activeVariants.map(variant => (
            <div 
              key={variant.id}
              className={`simple-cushion ${variant.activated ? 'activated' : ''}`}
              style={{ 
                backgroundColor: variant.color,
                transform: variant.activated ? 'scale(0.9)' : 'scale(1)'
              }}
              onClick={() => handleCushionClick(variant.id)}
            >
              <span>{variant.name}</span>
            </div>
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

export default SimpleApp;
