import axios from 'axios';

const API_URL = 'http://localhost:8000/api/comments';

export const createComment = async (commentData) => {
  try {
    const response = await axios.post(API_URL, commentData);
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.response?.data || 'Failed to create comment');
  }
};

export const getCommentsByPostId = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/post/${postId}`);
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
    const response = await axios.put(`${API_URL}/${commentId}`, updates);
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

export const deleteComment = async (commentId, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${commentId}`, {
      params: { userId },
    });
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