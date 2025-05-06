import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getAuthToken = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('Retrieved user from localStorage:', user); // Debug log
    return user?.token;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  console.log('Auth token:', token ? 'Present' : 'Missing'); // Debug log
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/signin', { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data || 'Failed to login');
  }
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

export const logout = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default {
  getAuthToken,
  getAuthHeaders,
  login,
  signup,
  logout,
  isAuthenticated
}; 