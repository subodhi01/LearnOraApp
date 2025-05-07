import axios from 'axios';
import { getAuthHeaders } from './authService';

const API_URL = 'http://localhost:8000/api/notifications';

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