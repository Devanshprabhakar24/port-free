// API Configuration
// Automatically uses production or development API URL

const isProduction = import.meta.env.PROD

export const API_CONFIG = {
  // Update this with your Render backend URL after deployment
  BACKEND_URL: isProduction 
    ? 'https://port-free.onrender.com' // Your Render backend URL
    : 'http://localhost:5000',
  
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
