const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 🔹 Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (process.env.NODE_ENV !== 'test') {
      console.log("Données reçues pour l'inscription :", req.body);
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email déjà utilisé :", email);
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer et enregistrer l'utilisateur
    const newUser = new User({ username, email, password: hashedPassword });
    try {
      const savedUser = await newUser.save();
      if (process.env.NODE_ENV !== 'test') {
        console.log("Utilisateur créé avec succès :", savedUser);
      }
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur :", err);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Connexion
router.post('/login', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      console.log("Données reçues pour la connexion :", req.body);
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      if (process.env.NODE_ENV !== 'test') {
        console.log("Utilisateur non trouvé pour l'email :", req.body.email);
      }
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Mot de passe incorrect pour l'utilisateur :", email);
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    console.log("Connexion réussie pour l'utilisateur :", email);

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
