import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/learning-plans">Learning Plans</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/dashboard/settings">Settings</Link>
      </nav>
    </header>
  );
};

export default Header; 