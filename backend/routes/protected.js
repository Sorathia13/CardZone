const express = require('express');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Route protégée
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Bienvenue sur ton profil', userId: req.userId });
});

module.exports = router;
