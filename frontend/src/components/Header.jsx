import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './Notifications/NotificationBell';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, currentUser, logout, firebaseLogout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      // Handle both types of logout
      if (user) {
    logout();
      }
      if (currentUser) {
        await firebaseLogout();
      }
    navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if user is authenticated through either method
  const isAuthenticated = user || currentUser;

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1><i className="fas fa-graduation-cap"></i> LearnOra</h1>
          </Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/" className="nav-item">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/courses" className="nav-item">
            <i className="fas fa-book"></i>
            <span>Courses</span>
          </Link>
          <Link to="/learning-plans" className="nav-item">
            <i className="fas fa-tasks"></i>
            <span>Learning Plans</span>
          </Link>
          <Link to="/resources" className="nav-item">
            <i className="fas fa-bookmark"></i>
            <span>Resources</span>
          </Link>
          <Link to="/community" className="nav-item">
            <i className="fas fa-users"></i>
            <span>Community</span>
          </Link>
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-section">
              <NotificationBell />
              <div className="user-menu" ref={dropdownRef}>
                <div 
                  className="user-avatar"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user ? 
                    `${user.firstName?.[0]}${user.lastName?.[0]}` :
                    currentUser?.displayName?.[0] || currentUser?.email?.[0]
                  }
                </div>
                <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                  <div className="user-info">
                    <span className="user-name">
                      {user ? 
                        `${user.firstName} ${user.lastName}` :
                        currentUser?.displayName || 'User'
                      }
                    </span>
                    <span className="user-email">
                      {user ? user.email : currentUser?.email}
                    </span>
                  </div>
                  <div className="dropdown-menu">
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fas fa-user"></i>
                      Dashboard
                    </Link>
                    <Link to="/settings" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fas fa-cog"></i>
                      Settings
                    </Link>
                    <button onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </Link>
              <Link to="/signup" className="signup-btn">
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;