import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword, deleteUserProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import './Settings.css';
import axios from 'axios';
import { getAuthHeaders } from '../services/authService';

const API_URL = 'http://localhost:8000/api';

const Settings = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for user:', authUser); // Debug log
      
      const userData = await getUserProfile();
      console.log('User Data:', userData); // Debug log
      
      setUser(userData);
      setProfileForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || ''
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err); // Debug error
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(profileForm);
      setUser(updatedUser);
      setSuccess('Profile updated successfully');
      setError(null);
      await fetchUserProfile();
      setActiveTab('account');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await changePassword(passwordForm);
      setSuccess('Password changed successfully');
      setError(null);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Proceed with deletion, passing the password for verification
      await deleteUserProfile(deletePassword);
      logout();
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      if (err.message.includes('Authentication failed')) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Failed to delete account');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return <div className="settings-container">Please log in to view your settings.</div>;
  }

  if (loading && !user) {
    return <div className="settings-container">Loading...</div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          Account
        </button>
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Password
        </button>
        <button
          className={`tab-button ${activeTab === 'delete' ? 'active' : ''}`}
          onClick={() => setActiveTab('delete')}
        >
          Delete Account
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'account' && (
          <div className="account-details">
            <div className="account-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="account-info">
              <div className="info-group">
                <label>Name</label>
                <p>{user?.firstName} {user?.lastName}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-group">
                <label>Phone</label>
                <p>{user?.phone ? user.phone : 'Not set'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <form className="settings-form" onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form className="settings-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}

        {activeTab === 'delete' && (
          <div className="delete-account-section">
            <h2>Delete Account</h2>
            <p className="warning-text">
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                className="delete-account-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete My Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="delete-confirm-form">
                <div className="form-group">
                  <label>Enter your password to confirm deletion:</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                </div>
                <div className="delete-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="confirm-delete-button"
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Confirm Deletion'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 