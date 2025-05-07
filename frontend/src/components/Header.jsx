import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './Notifications/NotificationBell';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>LearnOra</h1>
          </Link>
        </div>
        
        <nav className="nav-links">
          <Link to="/courses">Courses</Link>
          <Link to="/community">Community</Link>
          <Link to="/learning-plans">Learning Plans</Link>
          <Link to="/resources">Resources</Link>
        </nav>

        <div className="auth-section">
          {user ? (
            <div className="user-section">
              <NotificationBell />
              <div className="user-menu" ref={dropdownRef}>
                <div 
                  className="user-avatar"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                  <div className="user-info">
                    <span className="user-name">{user?.firstName} {user?.lastName}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                  <div className="dropdown-menu">
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <i className="fas fa-user"></i>
                      Dashboard
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
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;