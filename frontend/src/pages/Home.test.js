import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import '@testing-library/jest-dom';
import Home from './Home';
import { getWelcomeMessage } from '../services/api';

// Mock des dépendances
jest.mock('../services/api');
global.fetch = jest.fn();

describe('Composant Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWelcomeMessage.mockResolvedValue('Message de bienvenue');
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ _id: '123', name: 'Carte Test', category: 'Catégorie Test', price: 100 }),
      ok: true
    });
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });

  test('Affiche la page d\'accueil avec le formulaire d\'ajout de carte', async () => {
    render(<Home />);
    
    // Vérifier que la page affiche le titre et le message de bienvenue
    expect(screen.getByRole('heading', { name: /bienvenue sur le site de vente de cartes/i })).toBeInTheDocument();
    
    // Vérifier que le formulaire d'ajout de carte est présent
    expect(screen.getByRole('heading', { name: /ajouter une carte/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nom de la carte/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/catégorie/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/prix/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter la carte/i })).toBeInTheDocument();
    
    // Vérifier que le message de bienvenue est chargé
    await waitFor(() => {
      expect(getWelcomeMessage).toHaveBeenCalled();
    });
  });

  test('Met à jour les champs du formulaire lors de la saisie', () => {
    render(<Home />);
    
    const nameInput = screen.getByPlaceholderText(/nom de la carte/i);
    const categoryInput = screen.getByPlaceholderText(/catégorie/i);
    const priceInput = screen.getByPlaceholderText(/prix/i);
    
    fireEvent.change(nameInput, { target: { value: 'Carte Test' } });
    fireEvent.change(categoryInput, { target: { value: 'Catégorie Test' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    
    expect(nameInput.value).toBe('Carte Test');
    expect(categoryInput.value).toBe('Catégorie Test');
    expect(priceInput.value).toBe('100');
  });

  test('Soumet le formulaire avec les données correctes', async () => {
    render(<Home />);
    
    const nameInput = screen.getByPlaceholderText(/nom de la carte/i);
    const categoryInput = screen.getByPlaceholderText(/catégorie/i);
    const priceInput = screen.getByPlaceholderText(/prix/i);
    const submitButton = screen.getByRole('button', { name: /ajouter la carte/i });
    
    fireEvent.change(nameInput, { target: { value: 'Carte Test' } });
    fireEvent.change(categoryInput, { target: { value: 'Catégorie Test' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Carte Test',
          category: 'Catégorie Test',
          price: '100'
        })
      });
      expect(console.log).toHaveBeenCalledWith('Carte ajoutée :', expect.anything());
    });
  });

  test('Affiche une erreur si l\'ajout de carte échoue', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Erreur réseau'));
    
    render(<Home />);
    
    const nameInput = screen.getByPlaceholderText(/nom de la carte/i);
    const categoryInput = screen.getByPlaceholderText(/catégorie/i);
    const priceInput = screen.getByPlaceholderText(/prix/i);
    const submitButton = screen.getByRole('button', { name: /ajouter la carte/i });
    
    fireEvent.change(nameInput, { target: { value: 'Carte Test' } });
    fireEvent.change(categoryInput, { target: { value: 'Catégorie Test' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Erreur lors de l'ajout de la carte :", expect.anything());
    });
  });
});