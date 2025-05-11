import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, changePassword, deleteUserProfile } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Settings.css';
import './SettingsFollowers.css';
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
  const [profileImage, setProfileImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  // New states for followers/following
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photoURL: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
      fetchFollowersFollowing();
    }
  }, [authUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      setProfileForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        photoURL: userData.photoURL || ''
      });
      setProfileImage(userData.photoURL);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowersFollowing = async () => {
    try {
      const headers = getAuthHeaders();
      const followersRes = await axios.get(`${API_URL}/users/followers?email=${authUser.email}`, { headers });
      const followingRes = await axios.get(`${API_URL}/users/following?email=${authUser.email}`, { headers });
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (err) {
      console.error('Error fetching followers/following:', err);
      setError('Failed to load followers or following');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    setUploadingImage(true);
    setError(null);
    try {
      const storageRef = ref(storage, `profile_images/${authUser.email}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const updatedProfile = {
        ...profileForm,
        photoURL: downloadURL
      };
      await updateUserProfile(updatedProfile);
      setProfileForm(updatedProfile);
      setProfileImage(downloadURL);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUserData = {
        ...currentUser,
        photoURL: downloadURL
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setSuccess('Profile image updated successfully');
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload profile image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`${API_URL}/users/follow`, { userId, email: authUser.email }, { headers });
      await fetchFollowersFollowing();
      setSuccess('Followed user successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error following user:', err.response?.data || err.message);
      setError('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`${API_URL}/users/unfollow`, { userId, email: authUser.email }, { headers });
      await fetchFollowersFollowing();
      setSuccess('Unfollowed user successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error unfollowing user:', err.response?.data || err.message);
      setError('Failed to unfollow user');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_URL}/users/search?username=${searchQuery}`, { headers });
      setSearchResults(res.data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
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
            <div className="account-avatar-container">
              {profileImage || user?.photoURL ? (
                <img 
                  src={profileImage || user?.photoURL} 
                  alt="Profile" 
                  className="account-avatar-image"
                />
              ) : (
                <div className="account-avatar">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <div className="avatar-upload">
                <label className="upload-image-btn">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {uploadingImage ? 'Uploading...' : 'Change Photo'}
                </label>
              </div>
              <div className="followers-following">
                <button
                  className="followers-count"
                  onClick={() => setShowFollowersModal(true)}
                >
                  Followers: {followers.length}
                </button>
                <button
                  className="following-count"
                  onClick={() => setShowFollowingModal(true)}
                >
                  Following: {following.length}
                </button>
              </div>
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
            <div className="search-users-section">
              <h3>Search Users to Follow</h3>
              <form className="search-users-form" onSubmit={handleSearch}>
                <div className="search-form-group">
                  <input
                    type="text"
                    placeholder="Search by username"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-users-button">
                    Search
                  </button>
                </div>
              </form>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div key={result.id} className="search-result-item">
                      <span>{result.firstName} {result.lastName} ({result.email})</span>
                      {following.some((f) => f.id === result.id) ? (
                        <button
                          className="unfollow-button"
                          onClick={() => handleUnfollow(result.id)}
                        >
                          Unfollow
                        </button>
                      ) : (
                        <button
                          className="follow-button"
                          onClick={() => handleFollow(result.id)}
                        >
                          Follow
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Followers</h3>
              <button className="modal-close" onClick={() => setShowFollowersModal(false)}>
                ×
              </button>
              <div className="modal-list">
                {followers.length > 0 ? (
                  followers.map((follower) => (
                    <div key={follower.id} className="modal-list-item">
                      <span>{follower.firstName} {follower.lastName} ({follower.email})</span>
                    </div>
                  ))
                ) : (
                  <p>No followers yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Following</h3>
              <button className="modal-close" onClick={() => setShowFollowingModal(false)}>
                ×
              </button>
              <div className="modal-list">
                {following.length > 0 ? (
                  following.map((followed) => (
                    <div key={followed.id} className="modal-list-item">
                      <span>{followed.firstName} {followed.lastName} ({followed.email})</span>
                      <button
                        className="unfollow-button"
                        onClick={() => handleUnfollow(followed.id)}
                      >
                        Unfollow
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Not following anyone yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;