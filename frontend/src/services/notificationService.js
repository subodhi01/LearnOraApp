import axios from 'axios';
import { getAuthHeaders } from './authService';

const API_URL = 'http://localhost:8000/api/notifications';

export const getUserNotifications = async () => {
    try {
        console.log('Fetching all notifications');
        const response = await axios.get(`${API_URL}/user`, {
            headers: getAuthHeaders()
        });
        console.log('Received notifications:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const getUnreadNotifications = async () => {
    try {
        console.log('Fetching unread notifications');
        const response = await axios.get(`${API_URL}/user/unread`, {
            headers: getAuthHeaders()
        });
        console.log('Received unread notifications:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching unread notifications:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const getUnreadCount = async () => {
    try {
        console.log('Fetching unread count');
        const response = await axios.get(`${API_URL}/user/unread/count`, {
            headers: getAuthHeaders()
        });
        console.log('Received unread count:', response.data);
        return response.data.count;
    } catch (error) {
        console.error('Error fetching unread count:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await axios.put(`${API_URL}/${notificationId}/read`, null, {
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};

export const markAllAsRead = async () => {
    try {
        await axios.put(`${API_URL}/user/read-all`, null, {
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
}; 