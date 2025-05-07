import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      const token = getAuthToken();
      if (!token) {
        // No token found, redirect to login
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const isExpired = Date.now() >= expirationTime;

        if (isExpired) {
          console.log('Token is expired, redirecting to login');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          console.log('Token is valid but request was forbidden');
          // Token is valid but request was forbidden - might be a permissions issue
          return Promise.reject(error);
        }
      } catch (err) {
        console.error('Error validating token:', err);
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const videoService = {
  // Get all videos
  getAllVideos: async () => {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Upload a video
  uploadVideo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Delete a video
  deleteVideo: async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};

export default videoService; 