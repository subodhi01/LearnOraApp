import axios from 'axios';

const API_URL = 'http://localhost:8000/api/notifications';

const getAuthHeaders = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      console.error('No user token found in localStorage');
      return {};
    }
    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {};
  }
};

export const createNotification = async (notificationData) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('Authentication required');
    }

    console.log('Creating notification with data:', notificationData);
    console.log('Using headers:', headers);

    const response = await axios.post(API_URL, notificationData, { headers });
    console.log('Notification created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.error('Authentication failed. Please check if you are logged in.');
    }
    throw error.response?.data || error.message;
  }
};

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