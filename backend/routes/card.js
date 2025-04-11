const express = require('express');
const Card = require('../models/Card');

const router = express.Router();

// Ajouter une carte
router.post('/', async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const newCard = new Card({ name, category, price });
    await newCard.save();
    res.status(201).json(newCard);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la création de la carte', error: err.message });
  }
});

// Modifier une carte
router.put('/:id', async (req, res) => {
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

// Supprimer une carte
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCard = await Card.findByIdAndDelete(id);
    if (!deletedCard) return res.status(404).json({ message: 'Carte non trouvée' });
    res.json({ message: 'Carte supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la carte', error: err.message });
  }
});

module.exports = router;