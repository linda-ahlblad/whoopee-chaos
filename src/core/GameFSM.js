// src/core/GameFSM.js
// Simple Finite State Machine for game logic
import { getRandomVariant, cushionVariants } from '../data/cushionVariants';

export default class GameFSM {
  constructor() {
    // Initial state
    this.state = {
      phase: 'INTRO', // INTRO, PLAYING, ROUND_END, GAME_OVER
      score: 0,
      roundsSurvived: 0,
      roundTime: 0,
      maxRoundTime: 30,
      activeCushions: [],
      currentMessage: null,
      lastAction: null,
      lastCushionIndex: null
    };
    
    // Event listeners
    this.listeners = [];
  }
  
  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  // Update state and notify listeners
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }
  
  // Notify all listeners of state change
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }
  
  // Handle actions
  dispatch(action) {
    switch (action.type) {
      case 'START_GAME':
        this.startGame();
        break;
      case 'RESTART':
        this.restartGame();
        break;
      case 'ACTIVATE_CUSHION':
        this.activateCushion(action.payload.cushionIndex);
        break;
      case 'ROUND_TICK':
        this.roundTick();
        break;
      case 'END_ROUND':
        this.endRound();
        break;
      case 'DIVINE_MESSAGE':
        this.updateState({ 
          currentMessage: action.payload.message,
          lastAction: 'DIVINE_MESSAGE'
        });
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }
  
  // Start the game
  startGame() {
    // Generate initial cushions
    const activeCushions = this.generateCushions(3);
    
    this.updateState({ 
      phase: 'PLAYING', 
      score: 0,
      roundsSurvived: 0,
      roundTime: 0,
      activeCushions,
      lastAction: 'GAME_STARTED'
    });
    
    // Start game loop
    this.startGameLoop();
  }
  
  // Restart the game
  restartGame() {
    this.stopGameLoop();
    this.startGame();
  }
  
  // Start the game loop
  startGameLoop() {
    this.gameLoopInterval = setInterval(() => {
      this.dispatch({ type: 'ROUND_TICK' });
    }, 1000);
  }
  
  // Stop the game loop
  stopGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }
  
  // Handle round tick
  roundTick() {
    if (this.state.phase !== 'PLAYING') return;
    
    const newRoundTime = this.state.roundTime + 1;
    
    if (newRoundTime >= this.state.maxRoundTime) {
      this.dispatch({ type: 'END_ROUND' });
    } else {
      this.updateState({ 
        roundTime: newRoundTime,
        lastAction: 'ROUND_TICK'
      });
    }
  }
  
  // End the current round
  endRound() {
    // Check if any cushions were activated
    const activatedCount = this.state.activeCushions.filter(c => c.activated).length;
    
    if (activatedCount === 0) {
      // Game over if no cushions were activated
      this.gameOver();
    } else {
      // Start new round with more cushions
      const roundsSurvived = this.state.roundsSurvived + 1;
      const cushionCount = Math.min(3 + Math.floor(roundsSurvived / 2), 7);
      const activeCushions = this.generateCushions(cushionCount);
      
      this.updateState({
        roundsSurvived,
        roundTime: 0,
        activeCushions,
        lastAction: 'ROUND_ENDED'
      });
    }
  }
  
  // Activate a cushion
  activateCushion(cushionIndex) {
    if (this.state.phase !== 'PLAYING') return;
    
    const activeCushions = [...this.state.activeCushions];
    
    // If already activated, do nothing
    if (activeCushions[cushionIndex].activated) return;
    
    // Mark cushion as activated
    activeCushions[cushionIndex] = {
      ...activeCushions[cushionIndex],
      activated: true
    };
    
    // Update score based on variant
    const variant = activeCushions[cushionIndex].variant;
    const scoreIncrease = variant.scoreValue || 1;
    
    this.updateState({
      activeCushions,
      score: this.state.score + scoreIncrease,
      lastAction: 'CUSHION_ACTIVATED',
      lastCushionIndex: cushionIndex
    });
  }
  
  // Game over
  gameOver() {
    this.stopGameLoop();
    
    this.updateState({
      phase: 'GAME_OVER',
      lastAction: 'GAME_OVER'
    });
  }
  
  // Generate new cushions
  generateCushions(count) {
    const cushions = [];
    
    for (let i = 0; i < count; i++) {
      // Random variant
      const variant = getRandomVariant();
      
      // Random position in a circle
      const angle = (i / count) * Math.PI * 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      cushions.push({
        variant,
        position: [x, 0, z],
        rotation: [0, angle, 0],
        activated: false
      });
    }
    
    return cushions;
  }
  
  // Get current state
  getState() {
    return this.state;
  }
  
  // Cleanup
  dispose() {
    this.stopGameLoop();
    this.listeners = [];
  }
}
