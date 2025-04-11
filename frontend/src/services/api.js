import axios from 'axios'; // Importation d'Axios

const API_URL = 'http://localhost:5000'; // Adresse du serveur backend

export const registerUser = async (userData) => {
    return axios.post(`${API_URL}/api/auth/register`, userData);
};
  
export const loginUser = async (userData) => {
    return axios.post(`${API_URL}/api/auth/login`, userData);
};
// Fonction pour récupérer le message du backend
export const getWelcomeMessage = async () => {
  const response = await axios.get(`${API_URL}/`); // Requête GET vers le backend
  return response.data; // Retourne les données reçues
};

