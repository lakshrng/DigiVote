/**
 * API Configuration
 * 
 * For development:
 * - iOS Simulator: Use 'http://localhost:5000/api'
 * - Android Emulator: Use 'http://10.0.2.2:5000/api' (Android emulator special IP)
 * - Physical Device: Use your computer's local IP (e.g., 'http://192.168.1.100:5000/api')
 * 
 * To find your local IP:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig or ip addr (look for inet)
 */

// Determine API base URL based on environment
const getApiBaseUrl = (): string => {
  if (__DEV__) {
    // Development mode
    // For physical devices, replace with your computer's local IP
    // Example: 'http://192.168.1.100:5000/api'
    return 'http://localhost:5000/api';
  } else {
    // Production mode - update with your production API URL
    return 'https://your-production-api.com/api';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
};

// Helper to update API base URL at runtime (useful for testing)
export const updateApiBaseUrl = (newUrl: string): void => {
  // This can be used if you need to change the URL dynamically
  // You would need to recreate the axios instance
  console.log('API Base URL updated to:', newUrl);
};

