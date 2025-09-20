// Use environment variable or fallback to appropriate defaults
// Determine API base URL
// In development we leverage CRA proxy (client/package.json -> proxy) so we omit explicit host.
// This avoids port drift when backend starts on 5000 but code points to 5001.
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://agroai-tfey.onrender.com' // Production backend URL
    : ''); // Use relative paths in development (proxy handles /api/*)

export const apiCall = async (endpoint, options = {}) => {
  const attemptRequest = async (base) => {
    const url = `${base}${endpoint}`;
    const config = {
      headers: {},
      ...options
    };

    if (!(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    if (options.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }
    const authToken = localStorage.getItem('authToken');
    if (authToken) config.headers.Authorization = `Bearer ${authToken}`;

    console.log(`🔄 API Call: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    const rawText = await response.text();
    let data = {};
    const contentType = response.headers.get('content-type') || '';
    if (rawText) {
      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          console.error('❌ JSON parse error (treating as raw text):', parseErr);
          data = { raw: rawText };
        }
      } else {
        data = { raw: rawText };
      }
    }
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, data);
      const err = new Error(data.message || data.error || data.raw || `Request failed with status ${response.status}`);
      err.status = response.status;
      if (response.status === 403) {
        err.hint = '403 Forbidden: Backend not matching proxy port, CORS denial, or another service intercepting.';
      }
      throw err;
    }
    // Attach final base for diagnostics when returning object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      data._meta = { ...(data._meta || {}), finalBase: base || '(relative)' };
    }
    console.log(`✅ API Success via ${base || '(relative)'}:`, data);
    return data;
  };

  const primaryBase = API_BASE_URL;
  const fallbackBases = [];
  // Dev-only fallback logic: try common localhost ports if relative base failed
  if (process.env.NODE_ENV !== 'production') {
    if (!primaryBase || primaryBase === '') {
      fallbackBases.push('http://localhost:5000', 'http://localhost:5001');
    } else {
      // If explicit base was set but fails, still attempt alternates
      fallbackBases.push('http://localhost:5000', 'http://localhost:5001');
    }
  }

  // Try primary
  try {
    return await attemptRequest(primaryBase);
  } catch (err) {
    const retryStatuses = [401, 403, 404, 500, 502];
    if ((err.status && retryStatuses.includes(err.status)) || err.message.includes('Failed to fetch')) {
      for (const fb of fallbackBases) {
        if (fb === primaryBase) continue;
        try {
          console.warn(`⚠️  Primary API base failed (${err.status || err.message}); retrying via ${fb}`);
          return await attemptRequest(fb);
        } catch (inner) {
          console.warn(`Retry via ${fb} failed: ${inner.status || inner.message}`);
        }
      }
    }
    console.error('❌ API Error (after retries):', err);
    throw err;
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

// Lightweight health check convenience helper
export const checkBackendHealth = async () => {
  const bases = [API_BASE_URL];
  if (process.env.NODE_ENV !== 'production') {
    if (!API_BASE_URL || API_BASE_URL === '') {
      bases.push('http://localhost:5000', 'http://localhost:5001');
    } else {
      bases.push('http://localhost:5000', 'http://localhost:5001');
    }
  }
  for (const b of bases) {
    try {
      const url = `${b}/api/health`;
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (_) {}
  }
  return false;
};