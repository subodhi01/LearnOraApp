import axios from 'axios';

const API_URL = 'http://localhost:8000/api/notifications';

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

export const createNotification = async (userId, type, message, relatedId, courseId) => {
  try {
    const notificationData = {
      userId,
      type,
      message,
      relatedId,
      courseId
    };

    console.log('Creating notification with data:', notificationData);
    const response = await api.post('', notificationData);
    console.log('Notification created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create notification');
  }
};

export const getUserNotifications = async () => {
  try {
    console.log('Fetching all notifications');
    const response = await api.get('/user');
    console.log('Received notifications:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

export const getUnreadNotifications = async () => {
  try {
    console.log('Fetching unread notifications');
    const response = await api.get('/user/unread');
    console.log('Received unread notifications:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notifications:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch unread notifications');
  }
};

export const getUnreadCount = async () => {
  try {
    console.log('Fetching unread count');
    const response = await api.get('/user/unread/count');
    console.log('Received unread count:', response.data);
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

export const markAllAsRead = async () => {
  try {
    await api.put('/user/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
}; 