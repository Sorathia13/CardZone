# Dockerfile principal pour le déploiement du backend
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json du backend
COPY backend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code du backend
COPY backend/ ./

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["node", "index.js"]