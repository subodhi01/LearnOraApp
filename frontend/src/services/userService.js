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

    // Ensure phone number is included in the update
    const updateData = {
      email: user.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone || '' // Include phone number, default to empty string if not provided
    };

    console.log('Sending update data:', updateData); // Debug log

    const response = await axios.put(`${API_URL}/user/profile`, updateData);
    console.log('Update response:', response.data); // Debug log
    
    // Update the user in localStorage with the new data
    const updatedUser = response.data;
    const updatedUserData = {
      ...user,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone || ''
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    console.log('Updated user data in localStorage:', updatedUserData); // Debug log
    
    return updatedUser;
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