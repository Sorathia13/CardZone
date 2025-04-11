const express = require('express');
const Card = require('../models/Card');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// Ajouter une carte - Route protégée
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const newCard = new Card({ name, category, price });
    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de la carte', error: err.message });
  }
});

// Modifier une carte - Route protégée
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price } = req.body;
    const updatedCard = await Card.findByIdAndUpdate(id, { name, category, price }, { new: true });
    if (!updatedCard) return res.status(404).json({ message: 'Carte non trouvée' });
    res.json(updatedCard);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la carte', error: err.message });
  }
});

// Supprimer une carte - Route protégée
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCard = await Card.findByIdAndDelete(id);
    if (!deletedCard) return res.status(404).json({ message: 'Carte non trouvée' });
    res.json({ message: 'Carte supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la carte', error: err.message });
  }
});

// Récupérer toutes les cartes - Route accessible à tous
router.get('/', async (req, res) => {
  try {
    const { category, name, minPrice, maxPrice } = req.query;
    let query = {};

    // Filtrer par catégorie si spécifiée
    if (category) {
      query.category = category;
    }

    // Filtrer par nom (recherche partielle) si spécifié
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    // Filtrer par plage de prix si spécifiée
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const cards = await Card.find(query);
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des cartes', error: err.message });
  }
});

// Récupérer une carte par son ID - Route accessible à tous
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    if (!card) return res.status(404).json({ message: 'Carte non trouvée' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la carte', error: err.message });
  }
});

module.exports = router;