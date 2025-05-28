const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const cardRoutes = require('./routes/card');

dotenv.config();
const app = express();
app.use(express.json());

// Configuration CORS mise à jour pour Render
const corsOptions = {
    origin: [
        'http://localhost:3000', // Développement local
        'https://cardzone-frontend.onrender.com', // Frontend sur Render
        process.env.FRONTEND_URL // URL dynamique depuis les variables d'environnement
    ].filter(Boolean), // Filtrer les valeurs undefined
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true, // Autoriser les cookies et les en-têtes d'autorisation
};
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/cards', cardRoutes);

// Endpoint de santé pour Railway et autres plateformes
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API du site de vente de cartes");
});

let server; // Déclarez le serveur en dehors pour éviter les conflits
let mongoConnection = false;

// Connexion à MongoDB améliorée avec gestion des erreurs
const connectDB = async () => {
  if (mongoConnection) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');
    mongoConnection = true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  
  // Éviter de créer plusieurs serveurs en environnement de test
  if (server) return server;
  
  server = app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
  return server;
};

// Fonction améliorée pour fermer les connexions
const closeConnections = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Connexion MongoDB fermée.');
      mongoConnection = false;
    }
    
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('Serveur arrêté.');
          server = null;
          resolve();
        });
      });
    }
    return true;
  } catch (err) {
    console.error('Erreur lors de la fermeture des connexions:', err);
    return false;
  }
};

// En mode test, on expose les fonctions mais on ne démarre pas automatiquement
if (process.env.NODE_ENV === 'test') {
  // Ajout des gestionnaires de signal pour fermer proprement
  process.on('SIGINT', closeConnections);
  process.on('SIGTERM', closeConnections);
  
  module.exports = { app, startServer, connectDB, closeConnections };
} else {
  // En production, on connecte et démarre automatiquement
  (async () => {
    await connectDB();
    startServer();
  })();
  
  module.exports = app;
}