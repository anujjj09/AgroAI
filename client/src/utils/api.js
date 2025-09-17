// Use environment variable or fallback to appropriate defaults
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://agroai-tfey.onrender.com'  // Production backend URL
    : 'http://localhost:5000');

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  console.log(`🔄 API Call: ${config.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses or network errors
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data);
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    
    console.log(`✅ API Success:`, data);
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('❌ Network connectivity issue:', {
        url,
        error: error.message,
        suggestedFix: 'Check if backend server is running and API URL is correct'
      });
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    console.error('❌ API Error:', error);
    throw error;
  }
};

// Export API object with common HTTP methods
export const API = {
  get: (endpoint) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint, data) => apiCall(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => apiCall(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' })
};