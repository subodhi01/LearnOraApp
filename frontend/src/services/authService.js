import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      // Clear invalid token
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Retrieved user from localStorage:', user); // Debug log
    if (!user?.token) {
      console.log('No token found in user data');
      return null;
    }
    return user.token;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  console.log('Auth token:', token ? 'Present' : 'Missing'); // Debug log
  if (!token) {
    console.log('No auth token available');
    return {};
  }
  return { 'Authorization': `Bearer ${token}` };
};

export const login = async (email, password) => {
  try {
    console.log('Attempting login for:', email);
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await api.post('/signin', { email, password });
    console.log('Login response received');

    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (!response.data.token) {
      throw new Error('No authentication token received');
    }

    const userData = {
      ...response.data,
      tokenExpiry: Date.now() + (5 * 60 * 60 * 1000) // 5 hours from now
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User data stored successfully');
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          error.response.data || 
                          'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'Failed to process login request. Please try again.');
    }
  }
};

export const googleLogin = async (idToken) => {
  try {
    const response = await api.post('/google', { idToken });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error(error.response?.data || 'Failed to login with Google');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.token) {
      return false;
    }

    // Check if token is expired
    const payload = JSON.parse(atob(user.token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const isExpired = Date.now() >= expirationTime;

    if (isExpired) {
      console.log('Token is expired, logging out');
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export const checkAndRefreshToken = () => {
  if (!isAuthenticated()) {
    logout();
    return false;
  }
  return true;
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(error.response?.data || 'Failed to signup');
  }
};

export default {
  getAuthToken,
  getAuthHeaders,
  login,
  signup,
  logout,
  isAuthenticated,
  checkAndRefreshToken
}; 
