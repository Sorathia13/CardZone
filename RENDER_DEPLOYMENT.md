# 🚀 Guide de Déploiement sur Render

## Configuration requise pour Render

### 1. Variables d'environnement à configurer sur Render :

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cardzone
JWT_SECRET=votre_secret_jwt_securise_32_caracteres_minimum
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://votre-frontend.onrender.com
```

### 2. Étapes de déploiement :

1. **Connecter votre repository GitHub à Render**
   - Allez sur [render.com](https://render.com)
   - Connectez votre compte GitHub
   - Sélectionnez le repository CardZone

2. **Créer un nouveau Web Service**
   - Cliquez sur "New +" → "Web Service"
   - Choisissez "Build and deploy from a Git repository"
   - Sélectionnez votre repository CardZone

3. **Configuration du service**
   - **Name**: `cardzone-backend`
   - **Environment**: `Docker`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile` (à la racine)

4. **Variables d'environnement**
   - Ajoutez toutes les variables listées ci-dessus dans l'onglet "Environment"
   - **IMPORTANT**: Créez un JWT_SECRET sécurisé (32+ caractères)

5. **Base de données MongoDB**
   - Utilisez MongoDB Atlas (gratuit) : https://www.mongodb.com/atlas
   - Ou créez une base MongoDB sur Render dans l'onglet "Databases"

### 3. URLs après déploiement :

- **Backend API**: `https://cardzone-backend.onrender.com`
- **Endpoint de santé**: `https://cardzone-backend.onrender.com/api/health`
- **API principale**: `https://cardzone-backend.onrender.com/api/`

### 4. Troubleshooting commun :

- **Build failed**: Vérifiez que le Dockerfile est à la racine
- **Connection timeout**: Vérifiez votre MONGODB_URI
- **CORS errors**: Mettez à jour FRONTEND_URL avec votre vraie URL Render

### 5. Plan gratuit Render :

- ✅ 750 heures/mois gratuites
- ⚠️ Le service s'endort après 15min d'inactivité
- ⚠️ Premier démarrage peut prendre 30-60 secondes

---

## 🔧 Commandes utiles pour tester localement :

```bash
# Construire l'image Docker
docker build -t cardzone .

# Lancer avec Docker
docker run -p 5000:5000 --env-file .env cardzone

# Tester l'endpoint de santé
curl http://localhost:5000/api/health
```