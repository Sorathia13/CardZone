import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';
import jwtDecode from 'jwt-decode';

// Mock des dépendances
jest.mock('react-router-dom');
jest.mock('../services/api');
jest.mock('jwt-decode');

// Composant de test qui expose l'état d'erreur
const TestComponent = () => {
  const { isAuthenticated, user, error, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Connecté' : 'Non connecté'}</div>
      {user && <div data-testid="user-info">{user.username}</div>}
      {error && <div data-testid="auth-error">{error}</div>}
      <button onClick={() => login({ email: 'test@example.com', password: 'password123' })}>Se connecter</button>
      <button onClick={() => register({ username: 'testuser', email: 'test@example.com', password: 'password123' })}>S'inscrire</button>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock alert
    global.alert = jest.fn();
  });

  test('État initial : non authentifié, pas d\'utilisateur', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Non connecté');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  test('Connexion réussie', async () => {
    api.loginUser.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: { username: 'testuser', email: 'test@example.com' }
      }
    });
    jwtDecode.mockReturnValue({ username: 'testuser', email: 'test@example.com' });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByText('Se connecter'));
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Connecté');
    });
  });

  test('Inscription réussie', async () => {
    api.registerUser.mockResolvedValue({
      data: { message: 'Utilisateur créé avec succès' }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    fireEvent.click(screen.getByText('S\'inscrire'));
    
    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({ 
        username: 'testuser', 
        email: 'test@example.com', 
        password: 'password123' 
      });
      expect(global.alert).toHaveBeenCalledWith('Utilisateur créé avec succès');
    });
  });

  test('Déconnexion', async () => {
    // Simuler un utilisateur déjà connecté
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'fake-token';
      if (key === 'user') return JSON.stringify({ username: 'testuser', email: 'test@example.com' });
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Vérifier que l'utilisateur est connecté au départ
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Connecté');
    
    // Déconnecter l'utilisateur
    fireEvent.click(screen.getByText('Se déconnecter'));
    
    // Vérifier que l'utilisateur est déconnecté
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Non connecté');
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });

  test('Gestion des erreurs de connexion', async () => {
    // Configuration du mock pour simuler une erreur de connexion
    api.loginUser.mockRejectedValue({
      response: {
        data: {
          message: 'Identifiants incorrects'
        }
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Tenter de se connecter
    fireEvent.click(screen.getByText('Se connecter'));
    
    // Attendre que l'erreur soit affichée dans le composant
    await waitFor(() => {
      const errorElement = screen.queryByTestId('auth-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Identifiants incorrects');
      
      // Vérifier que l'utilisateur reste non connecté
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Non connecté');
    });
  });

  test('Gestion des erreurs d\'inscription', async () => {
    // Configuration du mock pour simuler une erreur d'inscription
    api.registerUser.mockRejectedValue({
      response: {
        data: {
          message: 'Email déjà utilisé'
        }
      }
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Tenter de s'inscrire
    fireEvent.click(screen.getByText('S\'inscrire'));
    
    // Attendre que l'erreur soit affichée dans le composant
    await waitFor(() => {
      const errorElement = screen.queryByTestId('auth-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Email déjà utilisé');
    });
  });
});