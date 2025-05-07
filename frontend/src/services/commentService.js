import axios from 'axios';

const API_URL = 'http://localhost:8000/api/comments';

// Get the auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
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

export const createComment = async (commentData) => {
  try {
    console.log('Creating comment with data:', JSON.stringify(commentData, null, 2));
    const response = await api.post('', commentData);
    console.log('Comment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestData: commentData
    });
    throw new Error(error.response?.data || 'Failed to create comment');
  }
};

export const getCommentsByPostId = async (postId) => {
  try {
    const response = await api.get(`/post/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data || 'Failed to fetch comments');
  }
};

export const updateComment = async (commentId, updates) => {
  try {
    const response = await api.put(`/${commentId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data || 'Failed to update comment');
  }
};

export const deleteComment = async (commentId, userEmail) => {
  try {
    const response = await api.delete(`/comments/${commentId}?userId=${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data || 'Failed to delete comment');
  }
};

export const toggleCommentVisibility = async (commentId, userEmail) => {
  try {
    const response = await api.post(`/${commentId}/toggle-visibility?userId=${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling comment visibility:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data || 'Failed to toggle comment visibility');
  }
};