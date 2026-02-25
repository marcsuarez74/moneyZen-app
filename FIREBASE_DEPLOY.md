# 🚀 Déploiement Firebase

Ce projet est maintenant configuré pour être déployé sur **Firebase Hosting** (au lieu de GitHub Pages).

## 📝 Configuration requise

### 1. Installer Firebase CLI localement

```bash
# Installer globalement
npm install -g firebase-tools

# Se connecter à Firebase
firebase login
```

### 2. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet (ex: `moneyzen-app`)
3. Notez le **Project ID** (ex: `moneyzen-app-12345`)

### 3. Initialiser le projet localement

```bash
# Dans le dossier du projet
firebase init hosting

# Questions à répondre :
# - Sélectionnez votre projet
# - Public directory : dist/budget-app/browser (déjà configuré dans firebase.json)
# - Configure as single-page app : Yes
# - Overwrite index.html : No
```

### 4. Obtenir le Firebase Token pour CI/CD

```bash
# Générer un token
firebase login:ci

# Copiez le token affiché (commence par 1//...)
```

### 5. Configurer les GitHub Secrets

Dans votre repository GitHub :

1. Allez dans **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Créez ces secrets :

| Secret                         | Valeur                       | Où trouver                                            |
| ------------------------------ | ---------------------------- | ----------------------------------------------------- |
| `FIREBASE_TOKEN`               | Token CI                     | `firebase login:ci`                                   |
| `FIREBASE_API_KEY`             | Web API Key                  | Firebase Console → Project Settings → General         |
| `FIREBASE_AUTH_DOMAIN`         | your-project.firebaseapp.com | Firebase Console → Project Settings → General         |
| `FIREBASE_PROJECT_ID`          | your-project-id              | Firebase Console → Project Settings → General         |
| `FIREBASE_STORAGE_BUCKET`      | your-project.appspot.com     | Firebase Console → Project Settings → General         |
| `FIREBASE_MESSAGING_SENDER_ID` | 123456789                    | Firebase Console → Project Settings → General         |
| `FIREBASE_APP_ID`              | 1:xxx:web:xxx                | Firebase Console → Project Settings → General         |
| `FIREBASE_VAPID_KEY`           | Clé VAPID                    | Firebase Console → Project Settings → Cloud Messaging |

### 6. Activer les services Firebase

Dans Firebase Console :

1. **Hosting** : Activé automatiquement au premier déploiement
2. **Cloud Functions** : Cliquez sur "Get started"
3. **Cloud Messaging** : Cliquez sur "Get started" (nécessaire pour les notifications)

### 7. Configurer GitHub Actions

Le workflow est déjà créé : `.github/workflows/firebase-deploy.yml`

Il s'exécutera automatiquement à chaque push sur `main` ou `master`.

## 🔧 Déploiement manuel (optionnel)

```bash
# Build
npm run config
npm run build:prod

# Déployer Hosting uniquement
firebase deploy --only hosting

# Déployer Functions uniquement
firebase deploy --only functions

# Déployer tout
firebase deploy
```

## 🌐 URLs de l'application

- **Production** : `https://[PROJECT_ID].web.app`
- **Alternative** : `https://[PROJECT_ID].firebaseapp.com`

## 🔥 Firebase Functions

Les Cloud Functions sont dans `firebase/functions/src/index.ts` :

- `sendPushNotification` : Envoie une notification push à un utilisateur
- `helloWorld` : Endpoint de test

Les Functions sont déployées automatiquement avec le workflow GitHub Actions.

## ⚠️ Important

1. **Premier déploiement** : Le workflow GitHub Actions peut échouer si le projet Firebase n'est pas correctement configuré. Faites un premier déploiement manuel avec `firebase deploy`.

2. **Notifications Push** : Nécessite un navigateur supportant les Service Workers (Chrome, Edge, Firefox). Sur mobile, l'application doit être installée comme PWA.

3. **Plan Firebase** : Le plan Spark (gratuit) permet :
   - 10GB de stockage Hosting
   - 10GB/mois de transfert
   - 2 millions de requêtes Functions/mois
   - Messaging illimité

## 🆘 Dépannage

### Erreur : "Permission denied"

- Vérifiez que `FIREBASE_TOKEN` est correct
- Regénérez le token avec `firebase login:ci`

### Erreur : "Project not found"

- Vérifiez que `FIREBASE_PROJECT_ID` correspond bien à votre projet
- Le projet doit exister dans Firebase Console

### Erreur : "Functions deployment failed"

- Vérifiez que Cloud Functions est activé dans Firebase Console
- Vérifiez le plan de facturation (Spark gratuit est suffisant)

## 📚 Ressources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
