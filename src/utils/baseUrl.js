// src/utils/baseUrl.js
/**
 * Gets the base URL for assets based on the environment
 * This ensures assets load correctly on GitHub Pages
 */
export const getBaseUrl = () => {
  // Check if we're running on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    // Extract repo name from path
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 1) {
      return '/' + pathSegments[1]; // e.g., '/whoopee-chaos'
    }
  }
  
  // In development or if unable to determine, use empty string
  return '';
};

// More reliable alternative that works with both local and GitHub Pages
export const getAssetPath = (path) => {
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  
  // In production builds with GitHub Pages
  if (process.env.NODE_ENV === 'production' && window.location.hostname.includes('github.io')) {
    return `${window.location.pathname.split('/')[1]}/${path}`;
  }
  
  // Local development
  return path;
};
