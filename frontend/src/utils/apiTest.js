import { healthAPI } from '@services/apiService';

/**
 * Test API connection to backend
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection to:', import.meta.env.VITE_API_BASE_URL);
    
    const response = await healthAPI.check();
    
    if (response.status === 200) {
      return {
        success: true,
        message: 'Backend connection successful',
        details: {
          status: response.data.status,
          baseURL: import.meta.env.VITE_API_BASE_URL,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: `Backend responded with status: ${response.status}`,
        details: { status: response.status }
      };
    }
  } catch (error) {
    console.error('API Connection Test Failed:', error);
    
    let errorMessage = 'Failed to connect to backend';
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      errorMessage = 'Network error - check if backend is running';
    } else if (error.response) {
      errorMessage = `Backend error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response from backend - check URL and CORS settings';
    }
    
    return {
      success: false,
      message: errorMessage,
      details: {
        error: error.message,
        baseURL: import.meta.env.VITE_API_BASE_URL,
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Test basic authentication flow
 */
export const testAuthEndpoint = async () => {
  try {
    // Try to access a protected endpoint without auth (should get 401)
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      return {
        success: true,
        message: 'Auth endpoint working correctly (401 for unauthorized)',
        details: { status: response.status }
      };
    } else {
      return {
        success: false,
        message: `Expected 401 but got ${response.status}`,
        details: { status: response.status }
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Auth test failed',
      details: { error: error.message }
    };
  }
};

/**
 * Run comprehensive connection tests
 */
export const runConnectionTests = async () => {
  console.log('🔍 Running API Connection Tests...');
  
  const results = {
    health: await testAPIConnection(),
    auth: await testAuthEndpoint(),
  };
  
  console.log('📊 Connection Test Results:', results);
  return results;
};