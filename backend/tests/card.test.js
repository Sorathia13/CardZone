const request = require("supertest");
const { app, server, closeConnections } = require("../index");
const mongoose = require("mongoose");
const Card = require("../models/Card");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Card API", () => {
  let cardId;
  let authToken;
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Créer un utilisateur de test pour l'authentification
    testUser = await User.create({
      username: `cardtest_user_${Date.now()}`,
      email: `cardtest_${Date.now()}@example.com`,
      password: "password123"
    });

    // Générer un token JWT pour cet utilisateur
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    // Nettoyer après les tests
    await User.findByIdAndDelete(testUser._id);
    await closeConnections(); 
  });

  test("Ajout d'une carte", async () => {
    const res = await request(app)
      .post("/api/cards")
      .set("Authorization", authToken)
      .send({
        name: "Carte Test",
        category: "Catégorie Test",
        price: 100,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Carte Test");
    expect(res.body.category).toBe("Catégorie Test");
    expect(res.body.price).toBe(100);

    cardId = res.body._id; // Stocker l'ID pour les tests suivants
  });

  test("Modification d'une carte", async () => {
    const res = await request(app)
      .put(`/api/cards/${cardId}`)
      .set("Authorization", authToken)
      .send({
        name: "Carte Modifiée",
        category: "Catégorie Modifiée",
        price: 150,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.name).toBe("Carte Modifiée");
    expect(res.body.category).toBe("Catégorie Modifiée");
    expect(res.body.price).toBe(150);
  });

  test("Suppression d'une carte", async () => {
    const res = await request(app)
      .delete(`/api/cards/${cardId}`)
      .set("Authorization", authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Carte supprimée avec succès");

    // Vérifier que la carte a été supprimée
    const card = await Card.findById(cardId);
    expect(card).toBeNull();
  });

  // Tests pour la récupération des cartes
  test("Récupération de toutes les cartes", async () => {
    // Créer plusieurs cartes pour les tests
    await Card.create([
      { name: "Carte A", category: "Catégorie 1", price: 50 },
      { name: "Carte B", category: "Catégorie 2", price: 100 },
      { name: "Carte C", category: "Catégorie 1", price: 150 }
    ]);

    const res = await request(app).get("/api/cards");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  test("Filtrage des cartes par catégorie", async () => {
    const res = await request(app).get("/api/cards?category=Catégorie 1");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Vérifier que toutes les cartes retournées sont de la bonne catégorie
    const allCat1 = res.body.every(card => card.category === "Catégorie 1");
    expect(allCat1).toBe(true);
  });

  test("Filtrage des cartes par plage de prix", async () => {
    const res = await request(app).get("/api/cards?minPrice=75&maxPrice=125");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Vérifier que toutes les cartes retournées sont dans la plage de prix
    const allInPriceRange = res.body.every(card => card.price >= 75 && card.price <= 125);
    expect(allInPriceRange).toBe(true);
  });

  test("Recherche de cartes par nom", async () => {
    const res = await request(app).get("/api/cards?name=Carte");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  test("Récupération d'une carte par ID", async () => {
    // Créer une carte et récupérer son ID
    const card = await Card.create({ 
      name: "Carte Test ID", 
      category: "Test", 
      price: 200 
    });
    const cardId = card._id.toString();

    const res = await request(app).get(`/api/cards/${cardId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Carte Test ID");
    expect(res.body).toHaveProperty("category", "Test");
    expect(res.body).toHaveProperty("price", 200);
  });

  test("Tentative de récupération d'une carte avec un ID invalide", async () => {
    const res = await request(app).get("/api/cards/id_invalide");
    expect(res.statusCode).toBe(500);
  });

  test("Tentative de récupération d'une carte inexistante", async () => {
    const res = await request(app).get("/api/cards/5f7d5f3e9d3e2a1b1c9d1e2f");
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Carte non trouvée");
  });
});