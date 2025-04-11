import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { AuthProvider } from '../context/AuthContext';

// Mock des dépendances
jest.mock('react-router-dom');

// Mock de fetch global
global.fetch = jest.fn();

describe('Composant Dashboard', () => {
  const mockCards = [
    { _id: '1', name: 'Carte 1', category: 'Catégorie A', price: 100 },
    { _id: '2', name: 'Carte 2', category: 'Catégorie B', price: 200 },
    { _id: '3', name: 'Carte 3', category: 'Catégorie A', price: 150 }
  ];
  
  beforeEach(() => {
    jest.clearAllMocks();
    
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
    
    // Mock fetch pour simuler la récupération des cartes
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockCards)
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
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/cards', expect.any(Object));
    });
    
    // Vérifier l'affichage des cartes
    await waitFor(() => {
      expect(screen.getByText('Carte 1')).toBeInTheDocument();
      expect(screen.getByText('Carte 2')).toBeInTheDocument();
      expect(screen.getByText('Carte 3')).toBeInTheDocument();
      
      // Vérifier que les catégories et prix sont affichés
      expect(screen.getByText('Catégorie A')).toBeInTheDocument();
      expect(screen.getByText('100 €')).toBeInTheDocument();
    });
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
    fireEvent.click(sortButton);
    
    // Vérifier l'ordre des cartes (supposons que l'ordre soit croissant)
    const cardElements = screen.getAllByTestId('card-item');
    expect(cardElements[0]).toHaveTextContent('Carte 1');
    expect(cardElements[1]).toHaveTextContent('Carte 3');
    expect(cardElements[2]).toHaveTextContent('Carte 2');
  });

  test('Peut supprimer une carte avec confirmation', async () => {
    // Mock de la confirmation (utilisateur clique sur "OK")
    global.confirm.mockReturnValueOnce(true);
    
    // Mock de la réponse du fetch pour la suppression
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Carte supprimée avec succès' })
    }).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockCards.filter(card => card._id !== '1'))
    });
    
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );
    
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
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/cards/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
    
    // Vérifier que l'utilisateur est informé du succès
    expect(global.alert).toHaveBeenCalledWith('Carte supprimée avec succès');
  });
  
  test('Gère les erreurs lors du chargement des cartes', async () => {
    // Réinitialiser les mocks
    global.fetch.mockReset();
    
    // Mock de fetch pour simuler une erreur
    global.fetch.mockRejectedValueOnce(new Error('Erreur de chargement des cartes'));
    
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