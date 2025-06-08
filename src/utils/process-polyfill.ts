/**
 * Process polyfill for browser environment
 * 
 * This is needed because some of the rate-limiter components reference process.env
 * which is not available in the browser by default.
 */

// Create a simple process object with env
if (typeof window !== 'undefined') {
  // First check if process already exists
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
      env: {
        NODE_ENV: 'production',
        // Add any other environment variables needed by the rate-limiter components
        REACT_APP_GEMINI_API_KEY: '',
        REACT_APP_OPENAI_API_KEY: '',
        GITHUB_PAGES: 'true', // This will help components know they're running in a browser-only environment
        DEBUG: 'false',
        PUBLIC_URL: '', // Add PUBLIC_URL to fix those errors
      },
    };
  } else if (typeof (window as any).process.env === 'undefined') {
    // Process exists but env doesn't
    (window as any).process.env = {
      NODE_ENV: 'production',
      REACT_APP_GEMINI_API_KEY: '',
      REACT_APP_OPENAI_API_KEY: '',
      GITHUB_PAGES: 'true',
      DEBUG: 'false',
      PUBLIC_URL: '',
    };
  }
  
  // Define a proxy that returns empty string for any environment variable that doesn't exist
  const envProxy = new Proxy((window as any).process.env, {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop as string];
      }
      // Only log if it's not a common variable we're expecting
      if (!['PUBLIC_URL', 'DEBUG'].includes(String(prop))) {
        console.log(`Environment variable ${String(prop)} was requested but not defined`);
      }
      return ''; // Default to empty string for any undefined env vars
    }
  });
  
  // Replace the env object with our proxy
  (window as any).process.env = envProxy;
}

export {}; // This makes the file a module 