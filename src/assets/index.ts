// Import all assets so they get included in the build
import asuLogo from './asu-logo.png';
import siteLogo from './site-logo.png';
import reactLogo from './react.svg';
import wsHeader from './ws-header-1920x516.jpg';

// Export them for use in components
export {
  asuLogo,
  siteLogo,
  reactLogo,
  wsHeader
};

// Also export the paths for direct usage in img tags
export const assetPaths = {
  asuLogo: '/gpt-marketplace/assets/asu-logo.png',
  siteLogo: '/gpt-marketplace/assets/site-logo.png',
  reactLogo: '/gpt-marketplace/assets/react.svg',
  wsHeader: '/gpt-marketplace/assets/ws-header-1920x516.jpg',
}; 