const request = require("supertest");
const { app, closeConnections } = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

describe("Routes protégées API", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Créer un utilisateur pour les tests
    const hashedPassword = await require("bcrypt").hash("password123", 10);
    const user = new User({
      username: "TestProtected",
      email: `protected_${Date.now()}@example.com`,
      password: hashedPassword,
    });
    const savedUser = await user.save();
    userId = savedUser._id;
    
    // Générer un token JWT pour cet utilisateur
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  });

  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await closeConnections();
  });

  test("Accès à une route protégée avec un token valide", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("message", "Bienvenue sur ton profil");
  });

  test("Accès refusé sans token", async () => {
    const res = await request(app).get("/api/profile");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Accès refusé");
  });

  test("Accès refusé avec un token invalide", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", "token_invalide");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Token invalide");
  });
});