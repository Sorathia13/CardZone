import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';

// Mock des dépendances
jest.mock('react-router-dom');
jest.mock('../services/api');

// Composant de test pour accéder au contexte
const TestComponent = () => {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Connecté' : 'Non connecté'}</div>
      {user && <div data-testid="user-info">{user.username}</div>}
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
    api.loginUser.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { username: 'testuser', email: 'test@example.com' }
      }
    });
    
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
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    });
  });

  test('Inscription réussie', async () => {
    api.registerUser.mockResolvedValueOnce({
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
      expect(alert).toHaveBeenCalledWith('Utilisateur créé avec succès');
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
    api.loginUser.mockRejectedValueOnce({
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
    
    fireEvent.click(screen.getByText('Se connecter'));
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Identifiants incorrects');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Non connecté');
    });
  });

  test('Gestion des erreurs d\'inscription', async () => {
    api.registerUser.mockRejectedValueOnce({
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
    
    fireEvent.click(screen.getByText('S\'inscrire'));
    
    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalled();
      expect(alert).toHaveBeenCalledWith('Email déjà utilisé');
    });
  });
});