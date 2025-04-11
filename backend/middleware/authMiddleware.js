const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Renommer la fonction en 'auth' pour correspondre aux tests
const auth = async (req, res, next) => {
  // Récupérer le token de façon flexible (à partir des headers, des propriétés directes ou d'autres sources)
  const token = req.headers?.authorization || req.header?.('Authorization') || req.authorization;
  
  if (!token) return res.status(401).json({ message: 'Accès refusé' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier si l'utilisateur existe toujours dans la base de données
    const user = await User.findById(verified.id);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    req.userId = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// Exporter sous forme d'objet avec la propriété 'auth'
module.exports = { auth };
