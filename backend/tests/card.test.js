const request = require("supertest");
const { app, server, closeConnections } = require("../index");
const mongoose = require("mongoose");
const Card = require("../models/Card");
require("dotenv").config();

describe("Card API", () => {
  let cardId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await closeConnections(); // Fermez MongoDB et le serveur après les tests
  });

  test("Ajout d'une carte", async () => {
    const res = await request(app).post("/api/cards").send({
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
    const res = await request(app).put(`/api/cards/${cardId}`).send({
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
    const res = await request(app).delete(`/api/cards/${cardId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Carte supprimée avec succès");

    // Vérifier que la carte a été supprimée
    const card = await Card.findById(cardId);
    expect(card).toBeNull();
  });
});