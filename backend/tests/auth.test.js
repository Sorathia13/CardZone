const request = require("supertest");
const { app, startServer, connectDB, closeConnections } = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const bcryptjs = require("bcryptjs"); // Remplacé bcrypt par bcryptjs
require('dotenv').config();

let server;

describe("Auth API", () => {
  beforeAll(async () => {
    await connectDB(); // Utiliser la fonction connectDB améliorée
    server = startServer(); // Utiliser la fonction startServer améliorée
  });

  beforeEach(async () => {
    // Supprimer tous les utilisateurs avant chaque test
    await User.deleteMany({});
    
    // Créer un utilisateur de test pour les tests de connexion
    const hashedPassword = await bcryptjs.hash("password123", 10);
    await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: hashedPassword
    });
  });

  afterAll(async () => {
    await closeConnections(); // Fermer MongoDB et le serveur après les tests
  });

  test("Inscription réussie", async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;

    const res = await request(app).post("/api/auth/register").send({
      username: "TestUser",
      email: uniqueEmail,
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Utilisateur créé avec succès");

    // Vérifier que l'utilisateur a été créé dans la base de données
    const user = await User.findOne({ email: uniqueEmail });
    expect(user).not.toBeNull();
    expect(user.username).toBe("TestUser");
  });

  test("Connexion réussie", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
  });
  
  test("Échec de connexion avec des identifiants incorrects", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "mauvais_password",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});