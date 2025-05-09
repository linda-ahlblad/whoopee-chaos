import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './styles/global.css';

// Mock data for divine quotes (since we're not using Azure)
const divineQuotes = [
  { deity: "Zeus", quote: "My thunderous expulsions shake the heavens themselves!" },
  { deity: "Odin", quote: "By my throne in Asgard, what a magnificent release!" },
  { deity: "Pele", quote: "My volcanic emissions flow like lava through the divine realm!" },
  { deity: "Pan", quote: "The forest spirits dance when I release my sylvan zephyrs!" },
  { deity: "Midas", quote: "Even my gaseous emissions turn to gold in their opulence!" },
  { deity: "Hades", quote: "From the depths of the underworld comes this miasmic greeting!" }
];

// A simple cushion component
const Cushion = ({ position, color, onClick }) => {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Main game scene
const GameScene = ({ onCushionClick }) => {
  // Create cushions in a circle
  const cushions = [];
  const count = 5;
  const radius = 3;
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    cushions.push(
      <Cushion 
        key={i}
        position={[x, 0, z]}
        color={`hsl(${(i / count) * 360}, 70%, 60%)`}
        onClick={() => onCushionClick(i)}
      />
    );
  }
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      {cushions}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
    </>
  );
};

// Main App component
function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  
  const handleStartGame = () => {
    setGameStarted(true);
  };
  
  const handleCushionClick = (cushionIndex) => {
    // Get a random divine quote
    const randomQuote = divineQuotes[Math.floor(Math.random() * divineQuotes.length)];
    setCurrentQuote(`${randomQuote.deity}: "${randomQuote.quote}"`);
    
    // Clear the quote after 5 seconds
    setTimeout(() => {
      setCurrentQuote(null);
    }, 5000);
  };
  
  return (
    <div className="game-container">
      <Canvas className="game-canvas">
        <GameScene onCushionClick={handleCushionClick} />
      </Canvas>
      
      <div className="game-ui">
        {!gameStarted ? (
          <>
            <h1>Whoopee Chaos</h1>
            <p>The divine flatulence game of mythical proportions!</p>
            <button onClick={handleStartGame}>Start Game</button>
          </>
        ) : (
          currentQuote && (
            <div 
              style={{ 
                background: 'rgba(0,0,0,0.7)', 
                padding: '20px', 
                borderRadius: '10px',
                maxWidth: '80%',
                textAlign: 'center',
                position: 'absolute',
                bottom: '40px'
              }}
            >
              <p>{currentQuote}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
