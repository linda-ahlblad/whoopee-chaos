import React, { useState, useEffect } from 'react';
import './styles/global.css';

// Detect if the device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

// Cushion variants
const cushionVariants = [
  { id: 0, name: "The Thundercloud", color: "#4a6da7", scoreValue: 1 },
  { id: 1, name: "The Royal Roar", color: "#8e2de2", scoreValue: 2 },
  { id: 2, name: "The Crimson Calamity", color: "#e94822", scoreValue: 3 },
  { id: 3, name: "The Emerald Eruption", color: "#1eb980", scoreValue: 2 },
  { id: 4, name: "The Golden Gale", color: "#ffcb47", scoreValue: 4 },
  { id: 5, name: "The Obsidian Outburst", color: "#212121", scoreValue: 5 }
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

// Get random quote
const getRandomQuote = () => {
  const index = Math.floor(Math.random() * divineQuotes.length);
  return divineQuotes[index];
};

// Simple Cushion Component
const Cushion = ({ variant, activated, onClick }) => {
  return (
    <div
      className={`cushion ${activated ? 'activated' : ''}`}
      style={{
        backgroundColor: variant.color,
        transform: `scale(${activated ? 0.95 : 1})`,
        opacity: activated ? 0.7 : 1
      }}
      onClick={onClick}
    >
      <span>{variant.name}</span>
    </div>
  );
};

function App() {
  const [gamePhase, setGamePhase] = useState('INTRO');
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [message, setMessage] = useState(null);
  const [cushions, setCushions] = useState([]);
  const [roundTime, setRoundTime] = useState(0);
  const [maxRoundTime, setMaxRoundTime] = useState(30);
  const [highScore, setHighScore] = useState(() => {
    // Load high score from localStorage if available
    const saved = localStorage.getItem('whoopeeChaosHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Timer reference
  const timerRef = React.useRef(null);

  // Generate cushions for a round
  const generateCushions = (count) => {
    const newCushions = [];
    const usedVariants = new Set();
    
    for (let i = 0; i < count; i++) {
      let variantIndex;
      // Try to get different variants when possible
      do {
        variantIndex = Math.floor(Math.random() * cushionVariants.length);
      } while (usedVariants.has(variantIndex) && usedVariants.size < cushionVariants.length);
      
      usedVariants.add(variantIndex);
      
      newCushions.push({
        variant: cushionVariants[variantIndex],
        id: i,
        activated: false
      });
    }
    
    return newCushions;
  };

  // Start game
  const handleStartGame = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setGamePhase('PLAYING');
    setScore(0);
    setRounds(0);
    setCushions(generateCushions(3));
    setRoundTime(0);
    
    // Start round timer
    timerRef.current = setInterval(() => {
      setRoundTime(prevTime => {
        if (prevTime >= maxRoundTime - 1) {
          // End round
          handleRoundEnd();
          return 0;
        }
        return prevTime + 1;
      });
    }, 1000);
  };

  // Handle end of round
  const handleRoundEnd = () => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Check if any cushions were activated
    const anyActivated = cushions.some(cushion => cushion.activated);
    
    if (!anyActivated) {
      // Game over
      handleGameOver();
    } else {
      // Start new round
      const newRounds = rounds + 1;
      setRounds(newRounds);
      
      // More cushions in higher rounds (but not too many on mobile)
      const maxCushions = isMobile ? 6 : 8;
      const cushionCount = Math.min(3 + Math.floor(newRounds / 2), maxCushions);
      setCushions(generateCushions(cushionCount));
      
      // Reset round time
      setRoundTime(0);
      
      // Show round message
      setMessage("Round complete! Divine chaos increases...");
      setTimeout(() => setMessage(null), 3000);
      
      // Start new timer
      timerRef.current = setInterval(() => {
        setRoundTime(prevTime => {
          if (prevTime >= maxRoundTime - 1) {
            handleRoundEnd();
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
  };

  // Handle game over
  const handleGameOver = () => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whoopeeChaosHighScore', score.toString());
    }
    
    setGamePhase('GAME_OVER');
  };

  // Handle cushion click
  const handleCushionClick = (id) => {
    if (gamePhase !== 'PLAYING') return;
    
    setCushions(prev => {
      return prev.map(cushion => {
        if (cushion.id === id && !cushion.activated) {
          // Try to play sound (with vibration on mobile)
          try {
            // Create and play a simple audio blip
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.value = 100 + Math.random() * 300;
            gain.gain.value = 0.1;
            
            oscillator.connect(gain);
            gain.connect(context.destination);
            
            oscillator.start();
            oscillator.stop(context.currentTime + 0.2);
            
            // Vibrate on mobile
            if (isMobile && 'vibrate' in navigator) {
              navigator.vibrate(50);
            }
          } catch (error) {
            console.log('Audio error:', error);
          }
          
          // Update score
          setScore(prev => prev + cushion.variant.scoreValue);
          
          // Show divine message
          const quote = getRandomQuote();
          setMessage(`${quote.deity}: "${quote.quote}"`);
          setTimeout(() => setMessage(null), 5000);
          
          // Return activated cushion
          return { ...cushion, activated: true };
        }
        return cushion;
      });
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
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
          
          {highScore > 0 && (
            <p className="high-score">Highest Divine Score: {highScore}</p>
          )}
          
          {isMobile && (
            <div className="mobile-instructions">
              <p>Tap the divine cushions to unleash chaos!</p>
            </div>
          )}
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
          
          {score >= highScore && (
            <p className="new-high-score">New High Score!</p>
          )}
          
          <button onClick={handleStartGame}>Ascend Again</button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="game-container">
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
        
        {highScore > 0 && (
          <div className="high-score-display">
            Best: {highScore}
          </div>
        )}
      </div>

      <div className="cushions-container">
        {cushions.map(cushion => (
          <Cushion
            key={cushion.id}
            variant={cushion.variant}
            activated={cushion.activated}
            onClick={() => handleCushionClick(cushion.id)}
          />
        ))}
      </div>

      {message && (
        <div className="divine-message">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}

export default App;
