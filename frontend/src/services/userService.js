import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const getUserProfile = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('No user email found');
    }

    const response = await axios.get(`${API_URL}/user/profile`, {
      params: { email: user.email }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data || 'Failed to fetch user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('No user email found');
    }

    const response = await axios.put(`${API_URL}/user/profile`, {
      email: user.email,
      ...profileData
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data || 'Failed to update profile');
  }
};

export const changePassword = async (passwordData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('No user email found');
    }

    const response = await axios.put(`${API_URL}/user/password`, {
      email: user.email,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(error.response?.data || 'Failed to change password');
  }
};