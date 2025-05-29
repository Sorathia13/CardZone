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

// Connexion à MongoDB améliorée avec gestion des erreurs et tentatives
const connectDB = async () => {
  if (mongoConnection) return;
  
  // Vérifier que MONGODB_URI est défini
  if (!process.env.MONGODB_URI) {
    console.error('ERREUR: La variable d\'environnement MONGODB_URI n\'est pas définie!');
    console.error('Variables d\'environnement disponibles:', Object.keys(process.env).filter(key => key.includes('MONGO')));
    
    // En production sur Render, attendre que la BD soit provisionnée
    if (process.env.RENDER) {
      console.log('Détection de l\'environnement Render - Attente de 30 secondes avant nouvelle tentative...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Nouvelle tentative après l'attente
      if (!process.env.MONGODB_URI) {
        console.error('La variable MONGODB_URI n\'est toujours pas disponible après attente.');
        
        // En développement, on arrête le serveur
        // En production, on continue avec une URI par défaut (à modifier selon vos besoins)
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        } else {
          console.log('Tentative de connexion avec URI par défaut');
        }
      }
    } else {
      process.exit(1);
    }
  }
  
  try {
    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB avec succès');
    mongoConnection = true;
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    console.error('URI utilisée:', process.env.MONGODB_URI ? 'Définie' : 'Non définie');
    
    // En production sur Render, on réessaie après un délai
    if (process.env.RENDER && process.env.NODE_ENV === 'production') {
      console.log('Nouvelle tentative dans 30 secondes...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      return connectDB(); // Appel récursif pour réessayer
    } else {
      process.exit(1);
    }
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

const startRender = async () => {
  console.log('====== DÉMARRAGE SUR RENDER ======');
  console.log('Variables d\'environnement disponibles:', Object.keys(process.env));
  
  // Vérifier si nous sommes sur Render
  if (!process.env.RENDER) {
    console.log('Environnement local détecté');
    process.env.RENDER = 'true'; // Pour les tests locaux
  }
  
  // Créer un backup de MONGODB_URI à partir de .env si disponible
  if (!process.env.MONGODB_URI && process.env.NODE_ENV !== 'production') {
    console.log('Utilisation de l\'URI de .env comme fallback');
    try {
      const result = dotenv.config();
      if (result.parsed && result.parsed.MONGODB_URI) {
        process.env.MONGODB_URI = result.parsed.MONGODB_URI;
      }
    } catch (e) {
      console.log('Erreur lors de la lecture de .env:', e.message);
    }
  }
  
  // Attendre que les services Render soient prêts
  if (process.env.NODE_ENV === 'production') {
    console.log('Attente initiale pour permettre le provisionnement de la base de données...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  // Lancer les connexions
  try {
    await connectDB();
    startServer();
  } catch (error) {
    console.error('Erreur fatale lors du démarrage:', error);
    process.exit(1);
  }
};

// En mode test, on expose les fonctions mais on ne démarre pas automatiquement
if (process.env.NODE_ENV === 'test') {
  // Ajout des gestionnaires de signal pour fermer proprement
  process.on('SIGINT', closeConnections);
  process.on('SIGTERM', closeConnections);
  
  module.exports = { app, startServer, connectDB, closeConnections };
} else {
  // En production, on connecte et démarre avec notre fonction spéciale
  startRender();
  
  module.exports = app;
}