// src/config/environment.ts

interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  ASSET_BASE_URL: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
  IS_TEST: boolean;
}     

// Function to validate and get environment variables
const getValidatedEnv = (): EnvironmentConfig => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

  // Provide sensible defaults for development
  const defaultAPIUrl = NODE_ENV === 'development' ? 'http://localhost:8000/api' : '';
  const defaultAssetUrl = NODE_ENV === 'development' ? 'http://localhost:8000' : '';

  // Log warnings for missing environment variables
  if (!API_BASE_URL) {
    console.warn('Environment Warning: NEXT_PUBLIC_API_BASE_URL is not defined. Using default:', defaultAPIUrl);
  }

  if (!ASSET_BASE_URL) {
    console.warn('Environment Warning: NEXT_PUBLIC_ASSET_BASE_URL is not defined. Using default:', defaultAssetUrl);
  }

  // In production, require critical environment variables
  if (NODE_ENV === 'production') {
    if (!API_BASE_URL) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL is required in production');
    }
    if (!ASSET_BASE_URL) {
      throw new Error('NEXT_PUBLIC_ASSET_BASE_URL is required in production');
    }
  }

  const config: EnvironmentConfig = {
    NODE_ENV: NODE_ENV as 'development' | 'production' | 'test',
    API_BASE_URL: API_BASE_URL || defaultAPIUrl,
    ASSET_BASE_URL: ASSET_BASE_URL || defaultAssetUrl,
    IS_PRODUCTION: NODE_ENV === 'production',
    IS_DEVELOPMENT: NODE_ENV === 'development',
    IS_TEST: NODE_ENV === 'test',
  };

  return config;
};

const environment = getValidatedEnv();

export default environment;