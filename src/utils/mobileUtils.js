// src/utils/mobileUtils.js

/**
 * Mobile-specific utility functions
 */

// Fix for iOS Safari 100vh issue
export const setupMobileHeight = () => {
  // First we get the viewport height and multiply it by 1% to get a value for a vh unit
  const vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  // Update on resize and orientation change
  window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });
};

// Helper to determine if the device is mobile
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (window.innerWidth <= 768);
};

// Enable full screen mode for mobile browsers that support it
export const requestFullscreen = () => {
  const element = document.documentElement;
  
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
};

// Disable browser pull-to-refresh on mobile
export const disablePullToRefresh = () => {
  document.body.style.overscrollBehavior = 'none';
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Optimize touch events for mobile devices
export const optimizeTouchEvents = () => {
  // Prevent double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd < 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Prevent pinch-to-zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Add support for device vibration
export const vibrateDevice = (patternOrDuration = 50) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(patternOrDuration);
    return true;
  }
  return false;
};

// Initialize all mobile optimizations
export const initMobileOptimizations = () => {
  if (isMobile()) {
    setupMobileHeight();
    disablePullToRefresh();
    optimizeTouchEvents();
    
    // Add fullscreen button if supported
    if (document.documentElement.requestFullscreen || 
        document.documentElement.mozRequestFullScreen || 
        document.documentElement.webkitRequestFullscreen || 
        document.documentElement.msRequestFullscreen) {
      
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.innerText = '📱';
      fullscreenBtn.className = 'fullscreen-button';
      fullscreenBtn.addEventListener('click', () => {
        requestFullscreen();
        // Vibrate to confirm action
        vibrateDevice(30);
      });
      document.body.appendChild(fullscreenBtn);
    }
  }
};
