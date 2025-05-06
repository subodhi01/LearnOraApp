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
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/signin', { email, password });
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

export default {
  getAuthToken,
  getAuthHeaders,
  login,
  signup,
  logout
}; 