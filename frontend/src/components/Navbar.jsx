import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" className="navbar-logo">
                    LearnOra
                </Link>
            </div>
            <div className="navbar-menu">
                {isAuthenticated ? (
                    <>
                        <Link to="/dashboard" className="navbar-item">
                            Dashboard
                        </Link>
                        <Link to="/courses" className="navbar-item">
                            Courses
                        </Link>
                        <Link to="/community" className="navbar-item">
                            Community
                        </Link>
                        <div className="navbar-right">
                            <div className="user-menu">
                                <button className="user-menu-button" onClick={toggleUserMenu}>
                                    {user?.firstName} {user?.lastName}
                                </button>
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <Link to="/profile" className="dropdown-item">
                                            Profile
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-item">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-item">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 