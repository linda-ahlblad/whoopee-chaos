/**
 * Gets the base URL for assets based on the environment
 * This ensures assets load correctly on GitHub Pages
 */
export const getBaseUrl = () => {
  // In production on GitHub Pages, assets are served from the repo name path
  if (process.env.NODE_ENV === 'production') {
    return '/whoopee-chaos';
  }
  // In development, use the path as is
  return '';
};
