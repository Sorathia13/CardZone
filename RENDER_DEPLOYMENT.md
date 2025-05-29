# 🚀 Guide de Déploiement sur Render

## Configuration automatique avec render.yaml

Le fichier `render.yaml` à la racine du projet configure automatiquement :
- Le service backend Docker
- La base de données MongoDB
- Les variables d'environnement nécessaires

### 1. Déploiement automatique :

1. **Connecter votre repository GitHub à Render**
   - Allez sur [render.com](https://render.com)
   - Connectez votre compte GitHub
   - Sélectionnez le repository CardZone

2. **Déployer avec render.yaml**
   - Render détectera automatiquement le fichier `render.yaml`
   - Cliquez sur "Apply" pour créer tous les services
   - La base de données MongoDB sera créée automatiquement
   - Les variables d'environnement seront configurées automatiquement

### 2. Configuration manuelle (alternative) :

Si vous préférez configurer manuellement :

**Variables d'environnement requises :**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cardzone
JWT_SECRET=votre_secret_jwt_securise_32_caracteres_minimum
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://votre-frontend.onrender.com
```

**Étapes :**
1. Créer un Web Service Docker
2. Ajouter les variables d'environnement
3. Créer une base MongoDB (optionnel si vous utilisez MongoDB Atlas)

### 3. URLs après déploiement :

- **Backend API**: `https://cardzone-backend.onrender.com`
- **Endpoint de santé**: `https://cardzone-backend.onrender.com/api/health`
- **API principale**: `https://cardzone-backend.onrender.com/api/`

### 4. Diagnostic des erreurs :

**Erreur "MONGODB_URI undefined" :**
- Vérifiez que la base de données MongoDB est créée sur Render
- Attendez que la variable `MONGODB_URI` soit automatiquement générée
- Redémarrez le service backend si nécessaire

**Autres problèmes courants :**
- **Build failed**: Vérifiez que le Dockerfile est à la racine
- **CORS errors**: Le FRONTEND_URL sera configuré automatiquement
- **Service qui s'endort**: Normal sur le plan gratuit (15min d'inactivité)

### 5. Plan gratuit Render :

- ✅ 750 heures/mois gratuites
- ✅ Base de données MongoDB gratuite (100MB)
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