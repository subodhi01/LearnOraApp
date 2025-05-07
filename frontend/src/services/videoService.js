import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Constants for file size limits
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB in bytes

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout per chunk
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
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to fetch videos. Please try again.');
    }
  },

  // Upload a video in chunks
  uploadVideo: async (file, onProgress) => {
    try {
      // Validate file size (10GB limit)
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size too large. Maximum size is 10GB.');
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Only video files are allowed.');
      }

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
        const start = (chunkNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('chunkNumber', chunkNumber);
        formData.append('totalChunks', totalChunks);
        formData.append('originalName', file.name);

        try {
          await api.post('/videos/upload-chunk', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          uploadedChunks++;
          const progress = Math.round((uploadedChunks / totalChunks) * 100);
          console.log(`Upload progress: ${progress}%`);
          if (onProgress) {
            onProgress(progress);
          }
        } catch (error) {
          console.error(`Error uploading chunk ${chunkNumber}:`, error);
          throw new Error(`Failed to upload chunk ${chunkNumber}. Please try again.`);
        }
      }

      return { message: 'Upload completed successfully' };
    } catch (error) {
      console.error('Error uploading video:', error);
      if (error.message) {
        throw new Error(error.message);
      }
      throw new Error('Failed to upload video. Please try again.');
    }
  },

  // Delete a video
  deleteVideo: async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`);
    } catch (error) {
      console.error('Error deleting video:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to delete video. Please try again.');
    }
  }
};

export default videoService; 