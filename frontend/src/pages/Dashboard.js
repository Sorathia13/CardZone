import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCards, deleteCard } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
    if (!token) {
      alert('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await getCards();
        setCards(response.data);
        setFilteredCards(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des cartes:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  useEffect(() => {
    // Filtrer les cartes par catégorie si un filtre est sélectionné
    let result = [...cards];
    
    if (categoryFilter) {
      result = result.filter(card => card.category === categoryFilter);
    }
    
    // Trier les cartes par prix (ordre croissant par défaut)
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
    
    setFilteredCards(result);
  }, [cards, categoryFilter, sortOrder]);

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      try {
        const response = await deleteCard(id);
        alert(response.data.message);
        // Mettre à jour la liste des cartes après suppression
        setCards(cards.filter(card => card._id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de la carte:', error);
        alert('Erreur lors de la suppression de la carte');
      }
    }
  };

  // Extraire toutes les catégories uniques pour le filtre
  const categories = [...new Set(cards.map(card => card.category))];

  return (
    <div>
      <h2>Tableau de bord</h2>
      <p>Bienvenue sur votre tableau de bord, {user?.username}</p>
      
      {loading ? (
        <p>Chargement des cartes...</p>
      ) : error ? (
        <p>Erreur lors du chargement des cartes. Aucune carte trouvée.</p>
      ) : (
        <>
          <div className="filters">
            <div>
              <label htmlFor="category-filter">Filtrer par catégorie: </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <button onClick={handleSortOrderChange}>
              Trier par prix {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {filteredCards.length === 0 ? (
            <p>Aucune carte trouvée</p>
          ) : (
            <div className="cards-container">
              {filteredCards.map(card => (
                <div key={card._id} className="card" data-testid="card-item">
                  <h3>{card.name}</h3>
                  <p>Catégorie: {card.category}</p>
                  <p>Prix: {card.price} €</p>
                  <button onClick={() => handleDeleteCard(card._id)}>Supprimer</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;