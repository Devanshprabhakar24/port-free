// API Configuration
// Uses environment variable if available, otherwise defaults based on environment

const isProduction = import.meta.env.PROD

// Support both Vite env vars and fallback to production detection
const getBackendUrl = () => {
  // Check for explicit env variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Fallback based on environment
  return isProduction 
    ? 'https://port-free.onrender.com'
    : 'http://localhost:5000'
}

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl(),
  
  ENDPOINTS: {
    CONTACT: '/api/contact/submit',
    HEALTH: '/health'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`
}

// Export for easy use
export const CONTACT_API_URL = getApiUrl(API_CONFIG.ENDPOINTS.CONTACT)
export const HEALTH_API_URL = getApiUrl(API_CONFIG.ENDPOINTS.HEALTH)
