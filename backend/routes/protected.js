const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route protégée
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: 'Bienvenue sur ton profil', userId: req.user.id });
});

module.exports = router;
