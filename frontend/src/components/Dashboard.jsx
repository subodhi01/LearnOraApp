import React from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
            to="/dashboard/progress" 
            className={`nav-item ${location.pathname === '/dashboard/progress' ? 'active' : ''}`}
          >
            <i className="fas fa-chart-line"></i>
            Progress
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