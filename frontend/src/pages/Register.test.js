import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from './Register';
import * as api from '../services/api';

// Mock des dépendances
jest.mock('../services/api');
jest.mock('react-router-dom');

describe('Composant Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('Affiche le formulaire d\'inscription', () => {
    render(<Register />);
    
    expect(screen.getByRole('heading', { name: /inscription/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  test('Met à jour les champs du formulaire lors de la saisie', () => {
    render(<Register />);
    
    const usernameInput = screen.getByPlaceholderText(/nom d'utilisateur/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('Soumet le formulaire avec les données correctes', async () => {
    api.registerUser.mockResolvedValueOnce({
      data: { message: 'Utilisateur créé avec succès' }
    });
    
    render(<Register />);
    
    const usernameInput = screen.getByPlaceholderText(/nom d'utilisateur/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(alert).toHaveBeenCalledWith('Utilisateur créé avec succès');
    });
  });

  test('Affiche une erreur si l\'inscription échoue', async () => {
    api.registerUser.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Email déjà utilisé'
        }
      }
    });
    
    render(<Register />);
    
    const usernameInput = screen.getByPlaceholderText(/nom d'utilisateur/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      });
      expect(alert).toHaveBeenCalledWith('Email déjà utilisé');
    });
  });

  test('Vérifie la validation du formulaire - champs obligatoires', async () => {
    render(<Register />);
    
    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);
    
    // Si votre formulaire a une validation native HTML
    // Test que l'API n'a pas été appelée si les champs sont vides
    expect(api.registerUser).not.toHaveBeenCalled();
  });
});