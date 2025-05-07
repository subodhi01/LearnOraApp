import axios from 'axios';

const API_URL = 'http://localhost:8000/api/comments';

// Get auth headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    throw new Error('Authentication required. Please log in.');
  }
  return { 'Authorization': `Bearer ${user.token}` };
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
    try {
      const headers = getAuthHeaders();
      config.headers = { ...config.headers, ...headers };
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Authentication failed. Please check if you are logged in.');
      throw new Error('Authentication failed. Please log in to continue.');
    }
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
    throw new Error(error.response?.data?.message || 'Failed to create comment');
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
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const updateComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Failed to update comment');
  }
};

export const deleteComment = async (commentId, userEmail) => {
  try {
    const response = await api.delete(`/${commentId}`, {
      params: { userId: userEmail }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    if (error.message === 'Authentication required. Please log in.') {
      throw new Error('Please log in to delete comments');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};

export const toggleCommentVisibility = async (commentId, userEmail) => {
  try {
    const response = await api.post(`/${commentId}/toggle-visibility`, null, {
      params: { userId: userEmail }
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling comment visibility:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data?.message || 'Failed to toggle comment visibility');
  }
};