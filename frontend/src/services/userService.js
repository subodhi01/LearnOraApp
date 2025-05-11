import axios from 'axios';
import { getAuthHeaders, getAuthToken } from './authService';

const API_URL = 'http://localhost:8000/api';

export const getUserProfile = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    console.log('Making profile request with headers:', getAuthHeaders());

    const response = await axios.get(`${API_URL}/auth/profile`, {
      params: { email: user.email },
      headers: getAuthHeaders()
    });
    console.log('Profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    const updateData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone || '',
      photoURL: profileData.photoURL || ''
    };

    console.log('Sending update data:', updateData);

    const response = await axios.put(`${API_URL}/auth/profile`, updateData, {
      params: { email: user.email },
      headers: getAuthHeaders()
    });
    console.log('Update response:', response.data);

    const updatedUser = response.data;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUserData = {
      ...currentUser,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone || '',
      photoURL: updatedUser.photoURL || ''
    };

    localStorage.setItem('user', JSON.stringify(updatedUserData));
    console.log('Updated user data in localStorage:', updatedUserData);

    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    const response = await axios.put(`${API_URL}/auth/change-password`, {
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, {
      params: { email: user.email },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const deleteUserProfile = async (password) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      throw new Error('User email not found');
    }

    console.log('Making delete request with headers:', getAuthHeaders());

    const response = await axios.delete(`${API_URL}/auth/profile`, {
      params: { email: user.email },
      data: { password },
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });

    console.log('Delete response:', response.data);

    localStorage.removeItem('user');

    return response.data;
  } catch (error) {
    console.error('Error deleting profile:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.config?.headers
    });
    if (error.response?.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete profile');
  }
};