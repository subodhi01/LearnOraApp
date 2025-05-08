import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const validateToken = (token) => {
    try {
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Retrieved user from localStorage:', parsedUser);
        console.log('Token present:', !!parsedUser.token);

        if (validateToken(parsedUser.token)) {
          setUser(parsedUser);
        } else {
          console.log('Token expired, clearing user data');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const login = (userData) => {
    console.log('Setting user data:', userData);
    console.log('Token present:', !!userData.token);
    if (validateToken(userData.token)) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      console.error('Invalid token during login');
      throw new Error('Invalid authentication token');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};