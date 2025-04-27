import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Making request to:', `${API_URL}/user/profile`);
    console.log('With token:', token);

    const response = await axios.get(`${API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(`${API_URL}/user/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(`${API_URL}/user/password`, passwordData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
}; 