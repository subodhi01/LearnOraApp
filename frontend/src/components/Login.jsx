import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { login, googleLogin } from '../services/authService';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await login(formData.email, formData.password);
        console.log('Login response:', response);
        console.log('Token present in response:', !!response.token);
        authLogin({
          id: response.id,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          photoURL: response.photoURL,
          token: response.token
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ submit: error.message || 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleLogin(credentialResponse.credential);
      authLogin({
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        photoURL: response.photoURL,
        token: response.token
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setErrors({ submit: error.message || 'Failed to login with Google' });
    }
  };

  const handleGoogleError = () => {
    setErrors({ submit: 'Google login failed. Please try again.' });
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue your learning journey</p>

        <div className="oauth-buttons" role="group" aria-label="Social login options">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            render={(renderProps) => (
              <button
                className="oauth-button google"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                aria-label="Continue with Google"
                role="link"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google icon"
                  className="oauth-icon"
                  aria-hidden="true"
                />
                Continue with Google
              </button>
            )}
          />
          <button
            className="oauth-button github"
            onClick={() => console.log('GitHub login not implemented')}
            aria-label="Continue with GitHub"
            role="link"
          >
            <img
              src="https://github.com/favicon.ico"
              alt="GitHub icon"
              className="oauth-icon"
              aria-hidden="true"
            />
            Continue with GitHub
          </button>
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-footer">
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot Password?
            </Link>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;