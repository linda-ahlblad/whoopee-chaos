// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GameFSM from './core/GameFSM';
import FXManager from './core/FXManager';
import { cushionVariants } from './data/cushionVariants';
import { getRandomQuote, getQuoteByTheme } from './data/divineQuotes';
import { getBaseUrl } from './utils/baseUrl';
import './styles/global.css';

// Main Cushion component
const Cushion = ({ variant, position, rotation, onClick, activated }) => {
  // Use a placeholder color if no texture is loaded
  const baseUrl = getBaseUrl();
  
  // Create a placeholder texture URL (we'll assume image might not exist)
  const textureUrl = `${baseUrl}/assets/images/cushion_${variant.theme}.png`;
  
  return (
    <mesh 
      position={position} 
      rotation={rotation} 
      onClick={onClick}
      scale={activated ? [1.2, 1.2, 1.2] : [1, 1, 1]}
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color={variant.color} 
        emissive={activated ? variant.color : '#000000'} 
        emissiveIntensity={activated ? 0.5 : 0}
      />
    </mesh>
  );
};

// Divine entity that reacts to events
const DivineEntity = ({ position, intensity = 0 }) => {
  const entityRef = useRef();
  
  useEffect(() => {
    // Animation logic could go here
  }, []);
  
  return (
    <group position={position} ref={entityRef}>
      <pointLight 
        position={[0, 2, 0]} 
        intensity={0.3 + (intensity * 0.1)} 
        color="#ffcc77" 
      />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#ffcc77" 
          emissive="#993300" 
          emissiveIntensity={0.1 + (intensity * 0.05)} 
        />
      </mesh>
    </group>
  );
};

// Main game scene
const GameScene = ({ gameState, handleCushionClick }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Render cushions based on game state */}
      {gameState.activeCushions.map((cushion, index) => (
        <Cushion 
          key={index}
          variant={cushion.variant}
          position={cushion.position}
          rotation={cushion.rotation}
          onClick={() => handleCushionClick(index)}
          activated={cushion.activated}
        />
      ))}
      
      {/* Divine entity that reacts to game events */}
      <DivineEntity 
        position={[0, 2, 0]} 
        intensity={gameState.score > 0 ? Math.min(gameState.score / 10, 1) : 0} 
      />
      
      {/* Controls for camera movement */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2} 
      />
    </>
  );
};

// UI Overlay component
const GameUI = ({ gameState, onStartGame, onRestart }) => {
  return (
    <div className="game-ui">
      {gameState.phase !== 'INTRO' && (
        <div className="score-display">
          <h2>Divine Chaos Score: {gameState.score}</h2>
          <h3>Rounds Survived: {gameState.roundsSurvived}</h3>
          
          {gameState.phase === 'PLAYING' && (
            <div className="round-timer">
              <progress 
                value={gameState.roundTime} 
                max={gameState.maxRoundTime}
              ></progress>
              <span>{gameState.maxRoundTime - gameState.roundTime}s</span>
            </div>
          )}
        </div>
      )}
      
      {gameState.phase === 'INTRO' && (
        <div className="intro-screen">
          <h1>Whoopee Chaos</h1>
          <p>The divine flatulence game of mythical proportions!</p>
          <button onClick={onStartGame}>Begin Divine Journey</button>
        </div>
      )}
      
      {gameState.phase === 'GAME_OVER' && (
        <div className="game-over">
          <h1>Divine Judgment</h1>
          <p>You have caused chaos with {gameState.score} divine eruptions!</p>
          <button onClick={onRestart}>Ascend Again</button>
        </div>
      )}
      
      {gameState.currentMessage && (
        <div className="divine-message">
          <p>{gameState.currentMessage}</p>
        </div>
      )}
    </div>
  );
};

// Main App component
function App() {
  const [gameState, setGameState] = useState(null);
  const fxManager = useRef(new FXManager());
  const gameFSM = useRef(null);
  
  // Initialize game systems
  useEffect(() => {
    gameFSM.current = new GameFSM();
    
    // Initial game state
    setGameState(gameFSM.current.getState());
    
    // Subscribe to state changes
    gameFSM.current.subscribe(newState => {
      setGameState({...newState});
      
      // Play sound effects based on state changes
      if (newState.lastAction === 'CUSHION_ACTIVATED' && fxManager.current) {
        const variantId = newState.activeCushions[newState.lastCushionIndex].variant.id;
        fxManager.current.playFartSound(variantId);
      }
    });
    
    // Initialize the FX Manager
    if (fxManager.current) {
      fxManager.current.preloadSounds();
    }
    
    return () => {
      // Cleanup
      if (fxManager.current) fxManager.current.dispose();
      if (gameFSM.current) gameFSM.current.dispose();
    };
  }, []);
  
  const handleStartGame = () => {
    gameFSM.current.dispatch({ type: 'START_GAME' });
  };
  
  const handleRestart = () => {
    gameFSM.current.dispatch({ type: 'RESTART' });
  };
  
  const handleCushionClick = (cushionIndex) => {
    // First activate the cushion
    gameFSM.current.dispatch({ 
      type: 'ACTIVATE_CUSHION', 
      payload: { cushionIndex } 
    });
    
    // Get divine wisdom based on the cushion's theme
    const cushionTheme = gameState.activeCushions[cushionIndex].variant.theme;
    const divineWisdom = getQuoteByTheme(cushionTheme);
    
    // Display the divine wisdom
    gameFSM.current.dispatch({
      type: 'DIVINE_MESSAGE',
      payload: { 
        message: `${divineWisdom.deity}: "${divineWisdom.quote}"` 
      }
    });
  };
  
  // Wait for game state to initialize
  if (!gameState) return <div>Loading divine experience...</div>;
  
  return (
    <div className="game-container">
      <Canvas className="game-canvas">
        <GameScene 
          gameState={gameState} 
          handleCushionClick={handleCushionClick} 
        />
      </Canvas>
      <GameUI 
        gameState={gameState}
        onStartGame={handleStartGame}
        onRestart={handleRestart}
      />
    </div>
  );
}

export default App;
