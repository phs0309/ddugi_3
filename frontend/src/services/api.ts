import axios, { AxiosInstance, AxiosError } from 'axios';

// Safe environment variable access
const getEnvVar = (key: string, defaultValue: string = '') => {
  try {
    const env = (import.meta as any)?.env;
    return env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// Check if we're in production or deployed environment
const isProduction = getEnvVar('VITE_NODE_ENV') === 'production' || 
                    getEnvVar('NODE_ENV') === 'production' ||
                    window.location.hostname !== 'localhost';

const API_BASE_URL = getEnvVar('VITE_API_BASE_URL') || 
  (isProduction ? '/api' : 'http://localhost:3001/api');

// Debug logging
console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  isProduction,
  API_BASE_URL,
  env: {
    VITE_NODE_ENV: getEnvVar('VITE_NODE_ENV'),
    NODE_ENV: getEnvVar('NODE_ENV')
  }
});

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // Increase timeout to 60 seconds for Claude API calls
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        const requestId = `req-${Date.now()}`;
        config.headers['X-Request-Id'] = requestId;
        
        if (getEnvVar('VITE_NODE_ENV') === 'development') {
          console.log(`[API Request ${requestId}]`, config.method?.toUpperCase(), config.url, config.data);
        }
        
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        if (getEnvVar('VITE_NODE_ENV') === 'development') {
          console.log('[API Response]', response.status, response.data);
        }
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error('[API Error Response]', error.response.status, error.response.data);
          
          if (error.response.status === 401) {
            // Handle unauthorized
          }
          
          if (error.response.status === 429) {
            // Handle rate limiting
            const retryAfter = error.response.headers['retry-after'];
            console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
          }
        } else if (error.request) {
          console.error('[API No Response]', error.request);
        } else {
          console.error('[API Error]', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  get axios(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export default apiClient.axios;