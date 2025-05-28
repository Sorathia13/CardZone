# CardZone

## 📋 Description

CardZone est une application web de vente de cartes à collectionner. Ce projet comprend une API backend Node.js avec Express et MongoDB pour la gestion des utilisateurs et des cartes.

## 🚀 Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcryptjs** - Chiffrement des mots de passe
- **CORS** - Gestion des requêtes cross-origin

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration des services
- **GitHub Actions** - CI/CD

## 📦 Installation et Configuration

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- MongoDB (local ou cloud)
- Docker (optionnel)

### 1. Cloner le projet
```bash
git clone <url-du-repository>
cd CardZone
```

### 2. Configuration des variables d'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env
```

Modifier le fichier `.env` avec vos propres valeurs :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cardzone?retryWrites=true&w=majority
JWT_SECRET=votre_clé_secrète_jwt_très_longue_et_sécurisée
PORT=5000
```

### 3. Installation des dépendances

#### Pour le projet principal
```bash
npm install
```

#### Pour le backend
```bash
cd backend
npm install
```

## 🏃‍♂️ Lancement du projet

### Méthode 1: Lancement en développement

1. **Démarrer le backend** :
```bash
cd backend
npm run dev
```
Le serveur démarre sur `http://localhost:5000`

### Méthode 2: Lancement en production
```bash
cd backend
npm start
```

### Méthode 3: Avec Docker Compose
```bash
# À la racine du projet
docker-compose up -d
```

## 🧪 Tests

### Lancer les tests
```bash
cd backend
npm test
```

Les tests utilisent Jest et Supertest pour tester les endpoints API.

### Structure des tests
- Tests d'authentification
- Tests des routes protégées
- Tests CRUD des cartes
- Tests de middleware

## 🌐 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion utilisateur

### Cartes (routes protégées)
- `GET /api/cards` - Récupérer toutes les cartes
- `POST /api/cards` - Créer une nouvelle carte
- `PUT /api/cards/:id` - Modifier une carte
- `DELETE /api/cards/:id` - Supprimer une carte

### Routes protégées
- `GET /api/protected` - Route test nécessitant une authentification

## 🏗️ Architecture du projet

```
CardZone-main/
├── backend/                    # API Backend
│   ├── models/                # Modèles de données
│   │   ├── User.js           # Modèle utilisateur
│   │   └── Card.js           # Modèle carte
│   ├── middleware/           # Middlewares
│   │   └── authMiddleware.js # Authentification JWT
│   ├── routes/              # Routes API (à implémenter)
│   ├── index.js             # Point d'entrée de l'API
│   ├── package.json         # Dépendances backend
│   └── Dockerfile           # Configuration Docker
├── docker-compose.yml       # Orchestration des services
├── package.json            # Dépendances globales
└── .env.example           # Variables d'environnement d'exemple
```

## 🎯 Fonctionnalités

### ✅ Actuellement implémentées
- **Gestion des utilisateurs** : Inscription et connexion avec chiffrement des mots de passe
- **Authentification JWT** : Sécurisation des routes avec tokens
- **Modèles de données** : Structure pour utilisateurs et cartes
- **Configuration Docker** : Prêt pour le déploiement en conteneurs
- **CI/CD** : Pipeline GitHub Actions configuré

### 🚧 À développer
- **Routes API** : Implémentation complète des routes CRUD
- **Frontend** : Interface utilisateur (prévu dans docker-compose)
- **Tests** : Suite de tests complète
- **Validation** : Validation des données d'entrée
- **Gestion d'erreurs** : Middleware de gestion d'erreurs global

## 🔧 Développement

### Ajouter de nouvelles fonctionnalités

1. **Créer un nouveau modèle** dans `backend/models/`
2. **Créer les routes** correspondantes dans `backend/routes/`
3. **Ajouter les tests** dans `backend/tests/`
4. **Mettre à jour la documentation**

### Variables d'environnement disponibles
- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `PORT` : Port du serveur (défaut: 5000)
- `NODE_ENV` : Environnement (development/production/test)

## 🚀 Déploiement

### Avec Docker
```bash
# Build et lancement
docker-compose up -d --build

# Arrêt
docker-compose down
```

### CI/CD avec GitHub Actions
Le pipeline CI/CD se déclenche automatiquement sur push vers la branche `main` :
1. Build de l'image Docker
2. Exécution des tests avec MongoDB
3. Déploiement (à configurer)

## 🐛 Problèmes connus

- Les routes API ne sont pas encore implémentées (référencées dans index.js mais fichiers manquants)
- Frontend non développé
- Tests unitaires à compléter
