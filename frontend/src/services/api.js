// Importation d'Axios - Compatible avec Jest
const axios = require('axios');

const API_URL = 'http://localhost:5000'; // Adresse du serveur backend

// Création d'une instance axios avec une configuration de base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout après 10 secondes
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  config => {
    // Récupérer le token du localStorage si disponible
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.message === 'Network Error') {
      console.error("Problème de connexion au serveur. Vérifiez que le serveur backend est en cours d'exécution.");
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  return api.post('/api/auth/register', userData);
};

export const loginUser = async (userData) => {
  return api.post('/api/auth/login', userData);
};

// Fonction pour récupérer les cartes de l'utilisateur
export const getCards = async () => {
  return api.get('/api/cards');
};

// Fonction pour supprimer une carte
export const deleteCard = async (cardId) => {
  return api.delete(`/api/cards/${cardId}`);
};

// Fonction pour créer une nouvelle carte
export const createCard = async (cardData) => {
  return api.post('/api/cards', cardData);
};

// Fonction pour mettre à jour une carte
export const updateCard = async (cardId, cardData) => {
  return api.put(`/api/cards/${cardId}`, cardData);
};

// Fonction pour récupérer le message du backend
export const getWelcomeMessage = async () => {
  const response = await api.get('/');
  return response.data;
};

