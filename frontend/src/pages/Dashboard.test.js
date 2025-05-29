import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

// Mock des dépendances
jest.mock('react-router-dom');
jest.mock('../services/api');

// Importer le mock de react-router-dom pour accéder à __mockNavigate
const { __mockNavigate } = require('react-router-dom');

describe('Composant Dashboard', () => {
  const mockCards = [
    { _id: '1', name: 'Carte 1', category: 'Catégorie A', price: 100 },
    { _id: '2', name: 'Carte 2', category: 'Catégorie B', price: 200 },
    { _id: '3', name: 'Carte 3', category: 'Catégorie A', price: 150 }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Réinitialiser le mock de navigate
    __mockNavigate.mockClear();
    
    // Mock localStorage pour simuler un utilisateur connecté
    const localStorageMock = {
      getItem: jest.fn().mockImplementation(key => {
        if (key === 'token') return 'fake-token';
        if (key === 'user') return JSON.stringify({ username: 'testuser', email: 'test@example.com' });
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock API pour simuler la récupération des cartes
    api.getCards = jest.fn().mockResolvedValue({
      data: mockCards
    });
    
    // Mock API pour simuler la suppression d'une carte
    api.deleteCard = jest.fn().mockResolvedValue({
      data: { message: 'Carte supprimée avec succès' }
    });
    
    global.confirm = jest.fn();
    global.alert = jest.fn();
    global.console.error = jest.fn();
  });

  test('Affiche le tableau de bord avec les cartes de l\'utilisateur', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    // Attendre que les cartes soient chargées
    await waitFor(() => {
      expect(api.getCards).toHaveBeenCalled();
    });
    
    // Vérifier l'affichage des cartes - utilisation de find au lieu de get pour laisser le temps au DOM de se mettre à jour
    const carte1 = await screen.findByText('Carte 1');
    expect(carte1).toBeInTheDocument();
    
    const carte2 = await screen.findByText('Carte 2');
    expect(carte2).toBeInTheDocument();
    
    const carte3 = await screen.findByText('Carte 3');
    expect(carte3).toBeInTheDocument();
    
    // Vérifier que les catégories et prix sont affichés
    expect(screen.getByText('Catégorie A')).toBeInTheDocument();
    
    // Utiliser une regex pour trouver le prix, car il peut être séparé en plusieurs éléments de texte
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  test('Peut filtrer les cartes par catégorie', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Carte 1')).toBeInTheDocument();
    });
    
    // Simuler la sélection d'une catégorie dans un filtre
    const filterSelect = screen.getByLabelText(/catégorie/i);
    fireEvent.change(filterSelect, { target: { value: 'Catégorie A' } });
    
    // Vérifier que seules les cartes de la catégorie A sont affichées
    expect(screen.getByText('Carte 1')).toBeInTheDocument();
    expect(screen.getByText('Carte 3')).toBeInTheDocument();
    expect(screen.queryByText('Carte 2')).not.toBeInTheDocument();
  });

  test('Peut trier les cartes par prix', async () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Carte 1')).toBeInTheDocument();
    });
    
    // Simuler le clic sur le bouton de tri par prix
    const sortButton = screen.getByText(/trier par prix/i);
    
    // Cliquer pour changer l'ordre en descendant
    fireEvent.click(sortButton);
    
    // Vérifier l'ordre des cartes (ordre descendant après le clic)
    const cardElementsDesc = screen.getAllByTestId('card-item');
    expect(cardElementsDesc[0]).toHaveTextContent('Carte 2'); // 200€
    expect(cardElementsDesc[1]).toHaveTextContent('Carte 3'); // 150€ 
    expect(cardElementsDesc[2]).toHaveTextContent('Carte 1'); // 100€
  });

  test('Peut supprimer une carte avec confirmation', async () => {
    // Mock de la confirmation (utilisateur clique sur "OK")
    global.confirm.mockReturnValueOnce(true);
    
    // Mock de la réponse pour la suppression
    api.deleteCard.mockResolvedValueOnce({
      data: { message: 'Carte supprimée avec succès' }
    });
    
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    // Attendre que les cartes soient chargées
    await waitFor(() => {
      expect(screen.getByText('Carte 1')).toBeInTheDocument();
    });
    
    // Simuler le clic sur le bouton de suppression de la première carte
    const deleteButtons = screen.getAllByText(/supprimer/i);
    fireEvent.click(deleteButtons[0]);
    
    // Vérifier que la confirmation a été demandée
    expect(global.confirm).toHaveBeenCalled();
    
    // Vérifier que la requête de suppression a été envoyée
    await waitFor(() => {
      expect(api.deleteCard).toHaveBeenCalledWith('1');
    });
    
    // Vérifier que l'utilisateur est informé du succès (attendre que l'alerte soit appelée)
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Carte supprimée avec succès');
    });
  });
  
  test('Gère les erreurs lors du chargement des cartes', async () => {
    // Réinitialiser les mocks
    api.getCards.mockReset();
    
    // Mock de fetch pour simuler une erreur
    api.getCards.mockRejectedValueOnce(new Error('Erreur de chargement des cartes'));
    
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Erreur'), expect.any(Error));
      expect(screen.getByText(/aucune carte trouvée/i)).toBeInTheDocument();
    });
  });
});