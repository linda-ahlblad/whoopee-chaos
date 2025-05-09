// src/StandaloneApp.js
// Standalone version that doesn't depend on any other files
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// Detect if we're on mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Cushion variants
const cushionVariants = [
  { id: 0, name: "The Thundercloud", color: "#4a6da7", scoreValue: 1, theme: "thunder" },
  { id: 1, name: "The Royal Roar", color: "#8e2de2", scoreValue: 2, theme: "royal" },
  { id: 2, name: "The Crimson Calamity", color: "#e94822", scoreValue: 3, theme: "crimson" },
  { id: 3, name: "The Emerald Eruption", color: "#1eb980", scoreValue: 2, theme: "emerald" },
  { id: 4, name: "The Golden Gale", color: "#ffcb47", scoreValue: 4, theme: "golden" },
  { id: 5, name: "The Obsidian Outburst", color: "#212121", scoreValue: 5, theme: "obsidian" }
];

// Divine quotes
const divineQuotes = [
  { deity: "Zeus", quote: "My thunderous expulsions shake the heavens themselves!", theme: "thunder" },
  { deity: "Odin", quote: "By my throne in Asgard, what a magnificent release!", theme: "royal" },
  { deity: "Pele", quote: "My volcanic emissions flow like lava through the divine realm!", theme: "crimson" },
  { deity: "Pan", quote: "The forest spirits dance when I release my sylvan zephyrs!", theme: "emerald" },
  { deity: "Midas", quote: "Even my gaseous emissions turn to gold in their opulence!", theme: "golden" },
  { deity: "Hades", quote: "From the depths of the underworld comes this miasmic greeting!", theme: "obsidian" },
  { deity: "Eris", quote: "Chaos is my domain, and chaos I shall release!", theme: "chaos" },
  { deity: "Athena", quote: "Even wisdom acknowledges the necessity of release!", theme: "wisdom" }
];

// Get random quote
const getRandomQuote = () => {
  const index = Math.floor(Math.random() * divineQuotes.length);
  return divineQuotes[index];
};

// Cushion component
const Cushion = ({ color, position, rotation, onClick, activated }) => {
  return (
    <mesh 
      position={position} 
      rotation={rotation} 
      onClick={onClick}
      scale={activated ? [1.1, 1.2, 1.1] : [1, 1, 1]}
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color={color} 
        emissive={activated ? color : "#000000"}
        emissiveIntensity={activated ? 0.5 : 0}
      />
    </mesh>
  );
};

// Divine entity
const DivineEntity = ({ position, intensity = 0 }) => {
  return (
    <group position={position}>
      <pointLight position={[0, 2, 0]} intensity={0.5 + intensity * 0.3} color="#ffcc77" />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#ffcc77" emissive="#993300" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Main functional component
const StandaloneApp = () => {
  const [gamePhase, setGamePhase] = useState('INTRO');
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [message, setMessage] = useState(null);
  const [cushions, setCushions] = useState([]);
  const [roundTime, setRoundTime] = useState(0);
  const [maxRoundTime, setMaxRoundTime] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  
  const timerId = useRef(null);
  
  // Initialize game
  useEffect(() => {
    // Force loading to complete after 3 seconds
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  // Generate cushions
  const generateCushions = (count) => {
    const newCushions = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const variant = cushionVariants[i % cushionVariants.length];
      
      newCushions.push({
        variant,
        position: [x, 0, z],
        rotation: [0, angle, 0],
        activated: false
      });
    }
    
    return newCushions;
  };
  
  // Start game
  const handleStartGame = () => {
    const count = isMobile ? 3 : 4;
    setCushions(generateCushions(count));
    setGamePhase('PLAYING');
    setScore(0);
    setRounds(0);
    setRoundTime(0);
    
    // Start round timer
    timerId.current = setInterval(() => {
      setRoundTime(prev => {
        if (prev >= maxRoundTime - 1) {
          // End round
          endRound();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };
  
  // Handle cushion click
  const handleCushionClick = (index) => {
    // Skip if already activated
    if (cushions[index].activated) return;
    
    // Vibrate on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    // Update cushions
    const newCushions = [...cushions];
    newCushions[index].activated = true;
    setCushions(newCushions);
    
    // Update score
    const scoreValue = cushions[index].variant.scoreValue || 1;
    setScore(prev => prev + scoreValue);
    
    // Show divine message
    const quote = getRandomQuote();
    setMessage(`${quote.deity}: "${quote.quote}"`);
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };
  
  // End round
  const endRound = () => {
    // Check if any cushions were activated
    const activatedCount = cushions.filter(c => c.activated).length;
    
    if (activatedCount === 0) {
      // Game over if no cushions activated
      gameOver();
    } else {
      // Start new round
      const newRounds = rounds + 1;
      setRounds(newRounds);
      
      // More cushions in higher rounds
      const cushionCount = Math.min(3 + Math.floor(newRounds / 2), isMobile ? 5 : 7);
      setCushions(generateCushions(cushionCount));
      
      // Reset round time
      setRoundTime(0);
      
      // Show round message
      setMessage("Round complete! Divine chaos increases...");
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  };
  
  // Game over
  const gameOver = () => {
    clearInterval(timerId.current);
    setGamePhase('GAME_OVER');
    setMessage(null);
  };
  
  // Restart game
  const handleRestart = () => {
    handleStartGame();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="loading">
        <h1>Whoopee Chaos</h1>
        <div className="loading-spinner"></div>
        <p>Loading divine experience...</p>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <Canvas
        className="game-canvas"
        camera={{ position: [0, 3, 6], fov: 60 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        
        {gamePhase === 'PLAYING' && (
          <>
            {cushions.map((cushion, index) => (
              <Cushion 
                key={index}
                color={cushion.variant.color}
                position={cushion.position}
                rotation={cushion.rotation}
                activated={cushion.activated}
                onClick={() => handleCushionClick(index)}
              />
            ))}
            
            <DivineEntity 
              position={[0, 2, 0]}
              intensity={score / 10}
            />
          </>
        )}
        
        <OrbitControls 
          enableZoom={!isMobile}
          enablePan={false}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
      
      <div className="game-ui">
        {gamePhase === 'PLAYING' && (
          <div className="score-display">
            <h2>Divine Chaos: {score}</h2>
            <h3>Rounds: {rounds}</h3>
            <div className="round-timer">
              <progress value={roundTime} max={maxRoundTime}></progress>
              <span>{Math.max(0, maxRoundTime - roundTime)}s</span>
            </div>
          </div>
        )}
        
        {gamePhase === 'INTRO' && (
          <div className="intro-screen">
            <h1>Whoopee Chaos</h1>
            <p>The divine flatulence game of mythical proportions!</p>
            <button onClick={handleStartGame}>Begin Divine Journey</button>
            
            {isMobile && (
              <div className="mobile-instructions">
                <p>Tap the divine cushions to unleash chaos!</p>
                <p>Use one finger to rotate view</p>
              </div>
            )}
          </div>
        )}
        
        {gamePhase === 'GAME_OVER' && (
          <div className="game-over">
            <h1>Divine Judgment</h1>
            <p>You have caused chaos with {score} divine eruptions!</p>
            <button onClick={handleRestart}>Ascend Again</button>
          </div>
        )}
        
        {message && (
          <div className="divine-message">
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandaloneApp;
