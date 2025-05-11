import React from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOverviewClick = () => {
    navigate('/dashboard/overview');
  };

  const handleSettingsClick = () => {
    navigate('/dashboard/settings');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={`${user.firstName} ${user.lastName}`}
                className="profile-photo"
              />
            ) : (
              user?.firstName?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="user-info">
            <h3>{user?.firstName} {user?.lastName}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <nav className="dashboard-nav">
          <Link 
            to="/dashboard/overview" 
            className={`nav-item ${location.pathname === '/dashboard/overview' ? 'active' : ''}`}
            onClick={handleOverviewClick}
          >
            <i className="fas fa-home"></i>
            Overview
          </Link>
          <Link 
            to="/dashboard/courses" 
            className={`nav-item ${location.pathname === '/dashboard/courses' ? 'active' : ''}`}
          >
            <i className="fas fa-book"></i>
            My Courses
          </Link>
          <Link 
            to="/dashboard/my-posts" 
            className={`nav-item ${location.pathname === '/dashboard/my-posts' ? 'active' : ''}`}
          >
            <i className="fas fa-pencil-alt"></i>
            My Posts
          </Link>
          <Link 
            to="/dashboard/meeting" 
            className={`nav-item ${location.pathname === '/dashboard/meeting' ? 'active' : ''}`}
          >
            <i className="fas fa-video"></i>
            Meeting
          </Link>
          <Link 
            to="/dashboard/progress-templates" 
            className={`nav-item ${location.pathname === '/dashboard/progress-templates' ? 'active' : ''}`}
          >
            <i className="fas fa-tasks"></i>
            Progress Templates
          </Link>
          <Link 
            to="/dashboard/certificates" 
            className={`nav-item ${location.pathname === '/dashboard/certificates' ? 'active' : ''}`}
          >
            <i className="fas fa-certificate"></i>
            Certificates
          </Link>
          <Link 
            to="/dashboard/settings" 
            className={`nav-item ${location.pathname === '/dashboard/settings' ? 'active' : ''}`}
            onClick={handleSettingsClick}
          >
            <i className="fas fa-cog"></i>
            Settings
          </Link>
        </nav>

        <button onClick={handleLogout} className="logout-button">
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>

      <div className="dashboard-main">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;