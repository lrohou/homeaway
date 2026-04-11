import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // Initialize app settings
      setAppPublicSettings({ id: 'homeaway-app' });
      setIsLoadingPublicSettings(false);
      
      // Check user authentication
      checkUserAuth();
    } catch (error) {
      console.error('App state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const token = localStorage.getItem('authToken');
      console.log('[Auth] Checking user auth. Token exists:', !!token);
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoadingAuth(false);
        return;
      }

      // Appeler api.auth.me() pour récupérer les infos utilisateur
      const currentUser = await api.auth.me();
      console.log('[Auth] User authenticated:', currentUser);
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error) {
      console.error('[Auth] User auth check failed:', error);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
      setAuthError({
        type: 'auth_failed',
        message: error.message || 'Authentication failed'
      });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email, password) => {
    try {
      setAuthError(null);
      console.log('[Auth] Attempting login for:', email);
      const user = await api.auth.login({ email, password });
      console.log('[Auth] Login successful, user:', user);
      console.log('[Auth] Token in storage:', localStorage.getItem('authToken') ? '✓' : '✗');
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      console.error('[Auth] Login error:', errorMessage);
      setAuthError({
        type: 'login_error',
        message: errorMessage
      });
      throw error;
    }
  };

  const register = async (email, password, name, avatar, code) => {
    try {
      setAuthError(null);
      console.log('[Auth] Attempting registration for:', email);
      const user = await api.auth.register({ email, password, name, avatar, code });
      console.log('[Auth] Registration successful, user:', user);
      console.log('[Auth] Token in storage:', localStorage.getItem('authToken') ? '✓' : '✗');
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      console.error('[Auth] Registration error:', errorMessage);
      setAuthError({
        type: 'register_error',
        message: errorMessage
      });
      throw error;
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      setAuthError(null);
      const user = await api.auth.loginWithGoogle(idToken);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      const errorMessage = error.message || 'Google login failed';
      setAuthError({
        type: 'google_login_error',
        message: errorMessage
      });
      throw error;
    }
  };

  const logout = (shouldRedirect = true) => {
    console.log('[Auth] Logging out, shouldRedirect:', shouldRedirect);
    api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('[Auth] Token removed from storage');
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      googleLogin: loginWithGoogle,
      logout,
      navigateToLogin,
      checkAppState,
      checkUserAuth
    }}>
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
