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

// Configuration CORS correcte
const corsOptions = {
    origin: 'http://localhost:3000', // Autoriser uniquement cette origine
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
    credentials: true, // Autoriser les cookies et les en-têtes d'autorisation
};
app.use(cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/cards', cardRoutes);

app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API du site de vente de cartes');
});

try {
    console.log(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');
} catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
}

let server; // Déclarez le serveur en dehors pour éviter les conflits

const startServer = () => {
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
};

if (!server || process.env.NODE_ENV !== 'test') {
  startServer();
}

// Ajout pour fermer MongoDB et le serveur proprement
const closeConnections = async () => {
  await mongoose.connection.close();
  console.log('Connexion MongoDB fermée.');
  if (server) {
    await new Promise((resolve) => {
      server.close(() => {
        console.log('Serveur arrêté.');
        resolve();
      });
    });
  }
};

if (process.env.NODE_ENV === 'test') {
  process.on('SIGINT', closeConnections);
  process.on('SIGTERM', closeConnections);
  module.exports = { app, server, closeConnections };
  console.log(process.env.NODE_ENV);
} else {
  module.exports = app;
}