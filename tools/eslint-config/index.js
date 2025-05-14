// Main export that re-exports all configurations
import baseConfig from './base.js';
import typescriptConfig from './typescript.js';

// Named exports for more granular usage
export { baseConfig, typescriptConfig };

// Default export is the typescript config for convenience
export default typescriptConfig;
