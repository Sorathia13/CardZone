import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

// Création du hook useAuth pour faciliter l'utilisation du contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, testMode = false }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fonction sécurisée pour la navigation (pour les tests)
  const safeNavigate = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    if (token && userString) {
      try {
        const decoded = jwtDecode(token);
        setUser(JSON.parse(userString));
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalide, nettoyer le localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const response = await loginUser(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      safeNavigate('/dashboard');
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Identifiants incorrects';
      setError(message);
      alert(message);
      // Ne pas relancer l'exception dans le contexte des tests
      return { error: message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const response = await registerUser(userData);
      alert(response.data.message || 'Utilisateur créé avec succès');
      safeNavigate('/login');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Email déjà utilisé';
      setError(message);
      alert(message);
      // Ne pas relancer l'exception dans le contexte des tests
      return { error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    safeNavigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      error,
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
