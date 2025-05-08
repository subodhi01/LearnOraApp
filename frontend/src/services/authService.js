import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Create axios instance with default config
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
      console.error('Authentication failed. Please check if you are logged in.');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Retrieved user from localStorage:', user);
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
  console.log('Auth token:', token ? 'Present' : 'Missing');
  if (!token) {
    console.log('No auth token available');
    return {};
  }
  return { 'Authorization': `Bearer ${token}` };
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/signin', { email, password });
    if (response.data.token) {
      const userData = {
        ...response.data,
        tokenExpiry: Date.now() + (5 * 60 * 60 * 1000) // 5 hours from now
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Failed to login');
  }
};

export const googleLogin = async (idToken) => {
  try {
    const response = await api.post('/google', { idToken });
    if (response.data.token) {
      const userData = {
        ...response.data,
        tokenExpiry: Date.now() + (5 * 60 * 60 * 1000) // 5 hours from now
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  } catch (error) {
    console.error('Google login error:', error);
    throw new Error(error.response?.data?.message || 'Failed to login with Google');
  }
};

export const signup = async (userData) => {
  try {
    const response = await api.post('/signup', userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(error.response?.data?.message || 'Failed to signup');
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

export default {
  getAuthToken,
  getAuthHeaders,
  login,
  googleLogin,
  signup,
  logout,
  isAuthenticated,
  checkAndRefreshToken
};