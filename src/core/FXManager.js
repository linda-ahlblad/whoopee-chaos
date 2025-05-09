// src/core/FXManager.js
import { getBaseUrl } from '../utils/baseUrl';
import { isMobile } from '../utils/mobileUtils';

class FXManager {
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
    this.isLoaded = false;
    this.isMobile = isMobile();
    this.audioContext = null;
    
    // Try to create AudioContext for better mobile audio performance
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('AudioContext not supported in this browser');
    }
  }
  
  // Initialize audio context on user interaction (required for mobile)
  initAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
  
  // Preload all game sounds with lower quality for mobile
  preloadSounds() {
    // Format selection based on device
    const format = this.isMobile ? 'mp3' : 'mp3'; // Could use 'ogg' for desktop if available
    
    // Preload fart sounds
    for (let i = 1; i <= 4; i++) {
      const path = `${getBaseUrl()}/assets/fart${i}.${format}`;
      this.loadSound(`fart${i}`, path);
    }
    
    // Additional game sounds
    this.loadSound('roundStart', `${getBaseUrl()}/assets/round_start.${format}`);
    this.loadSound('roundEnd', `${getBaseUrl()}/assets/round_end.${format}`);
    this.loadSound('gameOver', `${getBaseUrl()}/assets/game_over.${format}`);
    
    this.isLoaded = true;
  }
  
  // Load a sound file with error handling
  loadSound(id, url) {
    const audio = new Audio();
    
    // Lower quality presets for mobile
    if (this.isMobile) {
      audio.preload = 'auto';
    }
    
    // Add load event for tracking
    audio.addEventListener('canplaythrough', () => {
      console.log(`Sound ${id} loaded`);
    });
    
    // Add error handling
    audio.addEventListener('error', (e) => {
      console.error(`Error loading sound ${id}:`, e);
    });
    
    // Set source and begin loading
    audio.src = url;
    this.sounds[id] = audio;
    
    // Return the audio element for chaining
    return audio;
  }
  
  // Ensure audio context is running before playing sound
  ensureAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
  
  // Play a sound with optimizations for mobile
  playSound(id, options = {}) {
    if (!this.soundEnabled) return null;
    if (!this.isLoaded) this.preloadSounds();
    
    this.ensureAudioContext();
    
    const sound = this.sounds[id];
    if (!sound) {
      console.warn(`Sound ${id} not found`);
      return null;
    }
    
    // For mobile, we want to limit concurrent sounds to avoid performance issues
    if (this.isMobile) {
      // Stop any other sounds of the same type (e.g., fart sounds)
      if (id.startsWith('fart')) {
        for (let i = 1; i <= 4; i++) {
          const fartSound = this.sounds[`fart${i}`];
          if (fartSound && fartSound !== sound) {
            fartSound.pause();
            fartSound.currentTime = 0;
          }
        }
      }
    }
    
    // Reset the sound to the beginning
    sound.currentTime = 0;
    
    // Apply options
    if (options.volume !== undefined) {
      sound.volume = this.isMobile ? Math.min(options.volume, 0.8) : options.volume;
    } else {
      sound.volume = this.isMobile ? 0.8 : 1.0;
    }
    
    if (options.loop !== undefined) {
      sound.loop = options.loop;
    }
    
    // Play the sound with error handling
    const playPromise = sound.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(e => {
        console.warn(`Error playing sound ${id}:`, e);
        
        // Auto-retry once for mobile browsers that require user interaction
        if (e.name === 'NotAllowedError') {
          // We'll need user interaction to play sound
          document.addEventListener('touchstart', () => {
            this.ensureAudioContext();
          }, { once: true });
        }
      });
    }
    
    return sound;
  }
  
  // Play a fart sound based on variant - optimized for mobile
  playFartSound(variantId) {
    // Map variant ID to sound
    const soundId = `fart${(variantId % 4) + 1}`;
    
    // Less random variation on mobile to improve performance
    const volumeVariation = this.isMobile ? 0.1 : 0.3;
    
    // Random volume variation
    const volume = 0.7 + (Math.random() * volumeVariation);
    
    return this.playSound(soundId, { volume });
  }
  
  // Play background music - optimized for mobile
  playBGM(id, options = {}) {
    if (!this.soundEnabled) return null;
    
    // Stop current BGM if playing
    this.stopBGM();
    
    // Lower volume on mobile
    const volume = this.isMobile ? 
      (options.volume || 0.3) * 0.7 : 
      (options.volume || 0.3);
    
    // Play new BGM
    const bgm = this.playSound(id, { 
      loop: true, 
      volume
    });
    
    this.currentBgm = bgm;
    return bgm;
  }
  
  // Stop background music
  stopBGM() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm.currentTime = 0;
      this.currentBgm = null;
    }
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
    
    if (this.audioContext) {
      this.audioContext.close().catch(e => {
        console.warn('Error closing AudioContext:', e);
      });
    }
  }
}

export default FXManager;
