// Simplified API URL configuration
// Uses relative URLs since nginx proxies API calls to backend

// Helper function to get full API URL for a specific endpoint
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api${endpoint}`;
};

// Function to get API base URL
export const getApiBaseUrl = () => {
  // Use relative URL since nginx proxies API calls
  return '';
};

// Common API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  INVENTORY: '/inventory',
  SALES: '/sales',
  WORKER: '/worker',
  ANALYTICS: '/analytics',
}; 