// src/core/FXManager.js
// Simple audio manager for game sounds

export default class FXManager {
  constructor() {
    this.sounds = {
      fart1: null,
      fart2: null,
      fart3: null,
      fart4: null,
      roundStart: null,
      roundEnd: null,
      gameOver: null
    };
    
    this.currentBgm = null;
    this.soundEnabled = true;
  }
  
  // Preload all game sounds
  preloadSounds() {
    // Import the base URL utility
    const { getBaseUrl } = require('../utils/baseUrl');
    const baseUrl = getBaseUrl();
    
    // Preload fart sounds
    for (let i = 1; i <= 4; i++) {
      this.loadSound(`fart${i}`, `${baseUrl}/assets/sounds/fart${i}.mp3`);
    }
    
    // Additional game sounds
    this.loadSound('roundStart', `${baseUrl}/assets/sounds/round_start.mp3`);
    this.loadSound('roundEnd', `${baseUrl}/assets/sounds/round_end.mp3`);
    this.loadSound('gameOver', `${baseUrl}/assets/sounds/game_over.mp3`);
  }
  
  // Load a sound file
  loadSound(id, url) {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    
    // Add error handling
    audio.addEventListener('error', (e) => {
      console.error(`Error loading sound ${id}:`, e);
      // Create a silent fallback
      const fallback = new Audio();
      fallback.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      this.sounds[id] = fallback;
    });
    
    this.sounds[id] = audio;
  }
  
  // Play a sound
  playSound(id, options = {}) {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds[id];
    if (!sound) {
      console.warn(`Sound ${id} not found`);
      return;
    }
    
    // Reset the sound to the beginning
    sound.currentTime = 0;
    
    // Apply options
    if (options.volume !== undefined) {
      sound.volume = options.volume;
    }
    
    if (options.loop !== undefined) {
      sound.loop = options.loop;
    }
    
    // Play the sound
    sound.play().catch(e => {
      console.warn(`Error playing sound ${id}:`, e);
    });
    
    return sound;
  }
  
  // Play a fart sound based on variant
  playFartSound(variantId) {
    // Map variant ID to sound
    const soundId = `fart${(variantId % 4) + 1}`;
    
    // Random volume variation
    const volume = 0.7 + (Math.random() * 0.3); // 0.7 to 1.0
    
    return this.playSound(soundId, { volume });
  }
  
  // Toggle sound on/off
  toggleSound(enabled) {
    if (enabled !== undefined) {
      this.soundEnabled = enabled;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    
    // If disabling sound, stop all currently playing sounds
    if (!this.soundEnabled) {
      this.stopAllSounds();
    }
    
    return this.soundEnabled;
  }
  
  // Stop all sounds
  stopAllSounds() {
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
    
    this.currentBgm = null;
  }
  
  // Clean up resources
  dispose() {
    this.stopAllSounds();
    this.sounds = {};
  }
}
