import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <span className="user-name">{user?.firstName} {user?.lastName}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
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