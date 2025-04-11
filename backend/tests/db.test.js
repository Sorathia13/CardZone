const mongoose = require("mongoose");
const User = require("../models/User");
const Card = require("../models/Card");
const { closeConnections } = require("../index");
require("dotenv").config();

describe("Tests de la base de données", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await closeConnections();
  });

  describe("Connexion MongoDB", () => {
    test("Vérifier la connexion à MongoDB", () => {
      // readyState peut être 1 (connecté) ou 2 (connecté en cours)
      expect([1, 2]).toContain(mongoose.connection.readyState);
    });
  });

  describe("Validation du modèle User", () => {
    test("L'utilisateur est valide avec tous les champs requis", async () => {
      const validUser = new User({
        username: "TestUserValid",
        email: `valid_${Date.now()}@example.com`,
        password: "password123"
      });
      
      const savedUser = await validUser.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(validUser.username);
      expect(savedUser.email).toBe(validUser.email);
      
      // Nettoyer après le test
      await User.findByIdAndDelete(savedUser._id);
    });

    test("L'utilisateur n'est pas valide sans les champs requis", async () => {
      const userWithoutRequiredField = new User({
        email: `invalid_${Date.now()}@example.com`,
        password: "password123"
      });
      
      let error;
      try {
        await userWithoutRequiredField.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.username).toBeDefined();
    });

    test("L'utilisateur ne peut pas être créé avec un email déjà existant", async () => {
      const email = `duplicate_${Date.now()}@example.com`;
      
      // Créer un premier utilisateur
      const user1 = new User({
        username: "TestUser1",
        email: email,
        password: "password123"
      });
      await user1.save();
      
      // Tenter de créer un deuxième utilisateur avec le même email
      const user2 = new User({
        username: "TestUser2",
        email: email,
        password: "password456"
      });
      
      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // Code pour les erreurs de duplicate key
      
      // Nettoyer après le test
      await User.findByIdAndDelete(user1._id);
    });
  });

  describe("Validation du modèle Card", () => {
    test("La carte est valide avec tous les champs requis", async () => {
      const validCard = new Card({
        name: "Carte de test valide",
        category: "Catégorie de test",
        price: 150
      });
      
      const savedCard = await validCard.save();
      expect(savedCard._id).toBeDefined();
      expect(savedCard.name).toBe(validCard.name);
      expect(savedCard.category).toBe(validCard.category);
      expect(savedCard.price).toBe(validCard.price);
      
      // Nettoyer après le test
      await Card.findByIdAndDelete(savedCard._id);
    });

    test("La carte n'est pas valide sans les champs requis", async () => {
      const cardWithoutRequiredField = new Card({
        name: "Carte sans prix",
        category: "Catégorie de test"
      });
      
      let error;
      try {
        await cardWithoutRequiredField.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    test("La carte n'est pas valide avec un prix non numérique", async () => {
      const cardWithInvalidPrice = new Card({
        name: "Carte avec prix invalide",
        category: "Catégorie de test",
        price: "pas un nombre"
      });
      
      let error;
      try {
        await cardWithInvalidPrice.save();
      } catch (err) {
        error = err;
      }
      
      expect(error).toBeDefined();
    });
  });
});