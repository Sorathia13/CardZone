import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import '@testing-library/jest-dom';
import Login from './Login';
import * as api from '../services/api';

// Mock des dépendances
jest.mock('../services/api');
jest.mock('react-router-dom');

describe('Composant Login', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage de manière appropriée
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      },
      writable: true
    });
    
    // Mock window.alert
    global.alert = jest.fn();
  });

  test('Affiche le formulaire de connexion', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('Met à jour les champs du formulaire lors de la saisie', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('Soumet le formulaire avec les données correctes', async () => {
    // Mock de la fonction loginUser pour qu'elle retourne une promesse résolue
    api.loginUser.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { username: 'testuser', email: 'test@example.com' }
      }
    });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser', email: 'test@example.com' }));
      expect(alert).toHaveBeenCalledWith('Connexion réussie');
    });
  });

  test('Affiche une erreur si la connexion échoue', async () => {
    // Mock de la fonction loginUser pour qu'elle rejette la promesse
    api.loginUser.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Identifiants incorrects'
        }
      }
    });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(alert).toHaveBeenCalledWith('Identifiants incorrects');
    });
  });
});