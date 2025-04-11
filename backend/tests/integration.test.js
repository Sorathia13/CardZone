const request = require('supertest');
const { app, closeConnections } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const Card = require('../models/Card');
require('dotenv').config();

describe('Tests d\'intégration', () => {
  // Variables pour stocker les données de test
  let userData = {
    username: `integration_user_${Date.now()}`,
    email: `integration_${Date.now()}@example.com`,
    password: 'password123'
  };
  let token;
  let cardId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Nettoyage des données de test
    await User.deleteMany({ email: userData.email });
    await Card.deleteMany({ name: /^Test Integration/ });
    await closeConnections();
  });

  describe('Flux d\'authentification et de gestion des cartes', () => {
    test('1. Inscription d\'un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Utilisateur créé avec succès');
    });

    test('2. Connexion avec les identifiants créés', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(userData.email);
      expect(res.body.user.username).toBe(userData.username);

      // Stocker le token pour les tests suivants
      token = res.body.token;
    });

    test('3. Création d\'une carte avec l\'utilisateur authentifié', async () => {
      const cardData = {
        name: 'Test Integration Card',
        category: 'Test Category',
        price: 100
      };

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', token)
        .send(cardData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', cardData.name);
      expect(res.body).toHaveProperty('category', cardData.category);
      expect(res.body).toHaveProperty('price', cardData.price);

      // Stocker l'ID de la carte pour les tests suivants
      cardId = res.body._id;
    });

    test('4. Récupération de la carte créée', async () => {
      const res = await request(app)
        .get(`/api/cards/${cardId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', cardId);
      expect(res.body).toHaveProperty('name', 'Test Integration Card');
    });

    test('5. Modification de la carte', async () => {
      const updatedCardData = {
        name: 'Test Integration Card Updated',
        category: 'Test Category Updated',
        price: 150
      };

      const res = await request(app)
        .put(`/api/cards/${cardId}`)
        .set('Authorization', token)
        .send(updatedCardData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', cardId);
      expect(res.body).toHaveProperty('name', updatedCardData.name);
      expect(res.body).toHaveProperty('category', updatedCardData.category);
      expect(res.body).toHaveProperty('price', updatedCardData.price);
    });

    test('6. Suppression de la carte', async () => {
      const res = await request(app)
        .delete(`/api/cards/${cardId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Carte supprimée avec succès');

      // Vérifier que la carte a bien été supprimée
      const checkCard = await request(app)
        .get(`/api/cards/${cardId}`)
        .set('Authorization', token);

      expect(checkCard.statusCode).toBe(404);
    });

    test('7. Déconnexion et tentative d\'accès avec un token expiré', async () => {
      // Simuler un token expiré ou invalide
      const invalidToken = token + 'invalid';

      const res = await request(app)
        .post('/api/cards')
        .set('Authorization', invalidToken)
        .send({
          name: 'Test Card with Invalid Token',
          category: 'Test',
          price: 100
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token invalide');
    });
  });
});