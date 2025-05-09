import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth, AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import LearningPlan from './components/LearningPlan/LearningPlan';
import Courses from './components/Courses/Courses';
//import ProgressTemplate from './components/ProgressTemplate/ProgressTemplate';
import Resources from './components/Resources/Resources';
import './App.css';

// Add Font Awesome
const fontAwesome = document.createElement('link');
fontAwesome.rel = 'stylesheet';
fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
document.head.appendChild(fontAwesome);

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again.</h1>;
    }
    return this.props.children;
  }
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const isAuthenticated = () => {
    try {
      if (!user?.token) {
        return false;
      }

      // Check if token is expired
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const isExpired = Date.now() >= expirationTime;

      if (isExpired) {
        console.log('Token is expired, logging out');
        localStorage.removeItem('user');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route component
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  } />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<div>Overview Content</div>} />
                    <Route path="settings" element={<Settings />} />
                    {/* <Route path="progress" element={<ProgressTemplate />} />
                    <Route path="progress-templates" element={<ProgressTemplate />} /> */}
                  </Route>
                  <Route path="/learning-plans" element={
                    <ProtectedRoute>
                      <LearningPlan />
                    </ProtectedRoute>
                  } />
                  <Route path="/courses" element={
                    <ProtectedRoute>
                      <Courses />
                    </ProtectedRoute>
                  } />
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;