// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import GameFSM from './core/GameFSM';
import FXManager from './core/FXManager';
import { cushionVariants } from './data/cushionVariants';
import AgentBrain from './agents/AgentBrain';
import { getBaseUrl } from './utils/baseUrl';
import './styles/global.css';

// Detect if the device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Main Cushion component
const Cushion = ({ variant, position, rotation, onClick, activated }) => {
  // Don't try to load textures initially - use color only for faster loading
  // This prevents the loading getting stuck on texture issues
  return (
    <mesh 
      position={position} 
      rotation={rotation} 
      onClick={onClick}
      scale={activated ? [1.1, 1.2, 1.1] : [1, 1, 1]} // Scale up when activated
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color={variant.color} 
        emissive={activated ? variant.color : "#000000"}
        emissiveIntensity={activated ? 0.5 : 0}
      />
    </mesh>
  );
};

// Divine entity that reacts to events - simplified for mobile
const DivineEntity = ({ position, intensity = 0 }) => {
  return (
    <group position={position}>
      <pointLight position={[0, 2, 0]} intensity={0.5 + intensity * 0.3} color="#ffcc77" />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} /> {/* Reduced geometry complexity */}
        <meshStandardMaterial color="#ffcc77" emissive="#993300" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Main game scene - optimized for mobile and resilient to asset loading issues
const GameScene = ({ gameState, handleCushionClick }) => {
  // Generate cushions if activeCushions is missing or empty
  const cushions = gameState.activeCushions || [];
  
  // If we have no cushions but we're in PLAYING phase, generate some default ones
  const displayCushions = cushions.length > 0 ? cushions : 
    (gameState.phase === 'PLAYING' ? generateDefaultCushions() : []);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render cushions based on game state */}
      {displayCushions.map((cushion, index) => {
        // Get variant safely with fallback
        const variantId = cushion.variantId || 0;
        const variant = cushionVariants[variantId] || cushionVariants[0] || {
          color: '#4a6da7',
          name: 'Default Cushion'
        };
        
        return (
          <Cushion 
            key={index}
            variant={variant}
            position={cushion.position || [index * 2 - 2, 0, 0]}
            rotation={cushion.rotation || [0, 0, 0]}
            activated={cushion.activated || false}
            onClick={() => handleCushionClick(index)}
          />
        );
      })}
      
      {/* Divine entity that reacts to game events */}
      <DivineEntity 
        position={[0, 2, 0]} 
        intensity={gameState.score / 10} // Intensity increases with score
      />
      
      {/* Mobile-optimized controls */}
      <OrbitControls 
        enableZoom={!isMobile} // Disable zoom on mobile to avoid pinch conflicts
        enablePan={false}      // Disable panning for simpler mobile controls
        enableRotate={true}    // Keep rotation for perspective
        maxPolarAngle={Math.PI / 2} // Limit rotation to avoid disorientation
        minPolarAngle={Math.PI / 6} // Set minimum angle for better visibility
      />
    </>
  );
};

// Helper function to generate default cushions if needed
function generateDefaultCushions() {
  const count = 3;
  const cushions = [];
  
  for (let i = 0; i < count; i++) {
    // Place in a circle
    const angle = (i / count) * Math.PI * 2;
    const radius = 3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    cushions.push({
      variantId: i % cushionVariants.length,
      position: [x, 0, z],
      rotation: [0, angle, 0],
      activated: false
    });
  }
  
  return cushions;
}

// UI Overlay component - mobile responsive
const GameUI = ({ gameState, onStartGame, onRestart, onSettingsToggle }) => {
  return (
    <div className="game-ui">
      {gameState.phase === 'PLAYING' && (
        <div className="score-display">
          <h2>Divine Chaos: {gameState.score}</h2>
          <h3>Rounds: {gameState.roundsSurvived}</h3>
          {gameState.phase === 'PLAYING' && (
            <div className="round-timer">
              <progress 
                value={gameState.roundTime} 
                max={gameState.maxRoundTime}
              ></progress>
              <span>{Math.max(0, gameState.maxRoundTime - gameState.roundTime)}s</span>
            </div>
          )}
        </div>
      )}
      
      {gameState.phase === 'INTRO' && (
        <div className="intro-screen">
          <h1>Whoopee Chaos</h1>
          <p>The divine flatulence game of mythical proportions!</p>
          <button onClick={onStartGame}>Begin Divine Journey</button>
          
          {/* Mobile instructions */}
          {isMobile && (
            <div className="mobile-instructions">
              <p>Tap the divine cushions to unleash chaos!</p>
              <p>Use one finger to rotate view</p>
            </div>
          )}
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
      
      {/* Simple settings button for mobile */}
      {gameState.phase === 'PLAYING' && (
        <button 
          className="settings-button"
          onClick={onSettingsToggle}
        >
          ⚙️
        </button>
      )}
    </div>
  );
};

// Main App component
function App() {
  const [gameState, setGameState] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fxManager = useRef(new FXManager());
  const gameFSM = useRef(null);
  const agentBrain = useRef(null);
  
  // Force loading to complete after timeout even if assets are still loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Forcing loading completion after timeout");
        setIsLoading(false);
        
        // Initialize default game state if needed
        if (!gameState) {
          const defaultState = {
            phase: 'INTRO',
            score: 0,
            roundsSurvived: 0,
            roundTime: 0,
            maxRoundTime: 30,
            activeCushions: [],
            currentMessage: null
          };
          setGameState(defaultState);
        }
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(loadingTimer);
  }, [isLoading, gameState]);
  
  // Initialize game systems
  useEffect(() => {
    try {
      // Initialize with mobile-optimized settings
      const mobileOptions = {
        particleCount: isMobile ? 'low' : 'high',
        soundQuality: isMobile ? 'compressed' : 'high',
        maxCushions: isMobile ? 5 : 7 // Fewer cushions on mobile for performance
      };
      
      // Initialize core game components in try-catch blocks
      try {
        gameFSM.current = new GameFSM(mobileOptions);
      } catch (error) {
        console.error("Error initializing GameFSM:", error);
        // Fallback to basic game state
        gameFSM.current = {
          getState: () => ({
            phase: 'INTRO',
            score: 0,
            roundsSurvived: 0,
            roundTime: 0,
            maxRoundTime: 30,
            activeCushions: [],
            currentMessage: null
          }),
          subscribe: (callback) => {},
          dispatch: (action) => {
            if (action.type === 'START_GAME') {
              setGameState(prev => ({...prev, phase: 'PLAYING'}));
            }
          },
          dispose: () => {}
        };
      }
      
      try {
        agentBrain.current = new AgentBrain();
      } catch (error) {
        console.error("Error initializing AgentBrain:", error);
        // Fallback to simple agent
        agentBrain.current = {
          getDivineWisdom: () => Promise.resolve("The gods are silent today...")
        };
      }
      
      // Initial game state
      setGameState(gameFSM.current.getState());
      
      // Subscribe to state changes
      try {
        gameFSM.current.subscribe(newState => {
          setGameState({...newState});
          
          // Play sound effects based on state changes
          if (newState.lastAction === 'CUSHION_ACTIVATED' && fxManager.current) {
            try {
              const variantId = newState.activeCushions[newState.lastCushionIndex].variantId;
              fxManager.current.playFartSound(variantId);
            } catch (e) {
              console.warn("Error playing sound:", e);
            }
          }
        });
      } catch (error) {
        console.error("Error subscribing to game state:", error);
      }
      
      // Initialize the FX Manager with mobile optimizations
      try {
        fxManager.current.preloadSounds();
      } catch (error) {
        console.error("Error preloading sounds:", error);
      }
      
      // Setup mobile-specific event listeners
      if (isMobile) {
        window.addEventListener('orientationchange', handleOrientationChange);
      }
      
      // Mark loading as complete
      setIsLoading(false);
      
      return () => {
        // Cleanup
        if (fxManager.current && fxManager.current.dispose) {
          try {
            fxManager.current.dispose();
          } catch (e) {
            console.warn("Error disposing FXManager:", e);
          }
        }
        
        if (gameFSM.current && gameFSM.current.dispose) {
          try {
            gameFSM.current.dispose();
          } catch (e) {
            console.warn("Error disposing GameFSM:", e);
          }
        }
        
        if (isMobile) {
          window.removeEventListener('orientationchange', handleOrientationChange);
        }
      };
    } catch (error) {
      console.error("Critical initialization error:", error);
      // Force loading to complete even if there was an error
      setIsLoading(false);
      
      // Set minimal game state
      setGameState({
        phase: 'INTRO',
        score: 0,
        roundsSurvived: 0,
        activeCushions: [],
        currentMessage: null
      });
    }
  }, []);
  
  // Handle orientation change on mobile
  const handleOrientationChange = () => {
    // Force canvas resize after orientation change
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };
  
  const handleStartGame = () => {
    gameFSM.current.dispatch({ type: 'START_GAME' });
  };
  
  const handleRestart = () => {
    gameFSM.current.dispatch({ type: 'RESTART' });
  };
  
  const handleCushionClick = (cushionIndex) => {
    // Vibrate on mobile devices for tactile feedback
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    gameFSM.current.dispatch({ 
      type: 'ACTIVATE_CUSHION', 
      payload: { cushionIndex } 
    });
    
    // Get divine wisdom from the agent
    agentBrain.current.getDivineWisdom()
      .then(wisdom => {
        gameFSM.current.dispatch({
          type: 'DIVINE_MESSAGE',
          payload: { message: wisdom }
        });
      })
      .catch(error => {
        console.warn('Error getting divine wisdom:', error);
        // Fallback to simple message if agent fails
        gameFSM.current.dispatch({
          type: 'DIVINE_MESSAGE',
          payload: { message: "A deity mumbles something unintelligible..." }
        });
      });
  };
  
  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
  };
  
  // Simplified loading screen
  if (isLoading) {
    return (
      <div className="loading">
        <h1>Whoopee Chaos</h1>
        <div className="loading-spinner"></div>
        <p>Loading divine experience...</p>
      </div>
    );
  }
  
  // Fallback if game state initialization failed
  if (!gameState) {
    return (
      <div className="error-screen">
        <h1>Whoopee Chaos</h1>
        <p>Unable to initialize game. Please refresh the page.</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
  
  return (
    <div className="game-container">
      <Canvas 
        className="game-canvas"
        camera={{ position: [0, 3, 6], fov: 60 }} // Better default camera for mobile
        dpr={[1, isMobile ? 1.5 : 2]} // Lower resolution scaling on mobile
        onCreated={({ gl }) => {
          // Fallback on error
          gl.onError = () => {
            console.log("WebGL error occurred, but we'll continue");
            // We don't crash the app on WebGL errors
          };
        }}
      >
        <GameScene 
          gameState={gameState} 
          handleCushionClick={handleCushionClick} 
        />
      </Canvas>
      <GameUI 
        gameState={gameState}
        onStartGame={handleStartGame}
        onRestart={handleRestart}
        onSettingsToggle={handleSettingsToggle}
      />
      
      {/* Simple Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Divine Settings</h3>
          <button 
            onClick={() => {
              const enabled = fxManager.current.toggleSound();
              // Show feedback
              gameFSM.current.dispatch({
                type: 'DIVINE_MESSAGE',
                payload: { message: `Sound ${enabled ? 'enabled' : 'disabled'}` }
              });
              setShowSettings(false);
            }}
          >
            Toggle Sound
          </button>
          <button onClick={() => setShowSettings(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;
