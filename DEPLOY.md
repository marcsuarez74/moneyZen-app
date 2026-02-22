# 🚀 Déploiement GitHub Pages - Guide Complet

Ce guide explique comment déployer MoneyZen sur GitHub Pages avec une landing page professionnelle.

## 📋 Prérequis

- Un compte GitHub
- Le projet MoneyZen initialisé avec Git

## 🔧 Étape 1 : Créer le repository GitHub

1. Connectez-vous sur [github.com](https://github.com)
2. Cliquez sur **New repository**
3. Nommez-le `moneyzen` (ou autre nom)
4. **Ne cochez PAS** "Initialize with README"
5. Créez le repository

## 📤 Étape 2 : Pousser le code

```bash
# Dans le dossier du projet
cd /Users/marcsuarez/Documents/PROJET_DEV/budget-app

# Initialiser Git (si pas déjà fait)
git init

# Ajouter le remote (remplacez USERNAME par votre pseudo)
git remote add origin https://github.com/USERNAME/moneyZen-app.git

# Renommer la branche
git branch -M main

# Commit initial
git add .
git commit -m "Initial commit - MoneyZen avec landing page"

# Push sur GitHub
git push -u origin main
```

## ⚙️ Étape 3 : Activer GitHub Pages

1. Sur votre repo GitHub, allez dans **Settings**
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous **Source**, sélectionnez :
   - **Deploy from a branch**
   - Branch : `gh-pages` / `/(root)`
4. Cliquez sur **Save**

## 🤖 Étape 4 : Vérifier le déploiement automatique

Le workflow GitHub Actions (`.github/workflows/deploy.yml`) se déclenchera automatiquement à chaque push sur `main`.

### Le workflow fait :
1. Checkout du code
2. Installation des dépendances
3. Build de l'application Angular avec `--base-href /moneyZen-app/`
4. Copie de la landing page (docs/) + build Angular
5. Déploiement sur GitHub Pages

## 🌐 Étape 5 : Accéder à votre site

Après le déploiement (2-3 minutes), votre site sera accessible :

- **Landing Page** : `https://USERNAME.github.io/moneyZen-app/`
- **Application** : `https://USERNAME.github.io/moneyZen-app/app/`

> Remplacez `USERNAME` par votre nom d'utilisateur GitHub

## 📝 Personnalisation

### Modifier la landing page

Éditez le fichier `docs/index.html` :
- Remplacez `USERNAME` par votre pseudo GitHub (3 occurrences)
- Personnalisez les textes, couleurs, etc.

### Modifier l'URL de base

Si vous changez le nom du repo, modifiez dans :
1. `.github/workflows/deploy.yml` : ligne `--base-href /NOM_REPO/`
2. `docs/index.html` : tous les liens `https://github.com/USERNAME/NOM_REPO`

## 🔍 Troubleshooting

### Problème : "Page not found"
- Vérifiez que GitHub Pages est bien activé dans Settings > Pages
- Attendez 2-3 minutes après le push

### Problème : "Cannot match any routes"
- Vérifiez que le `base-href` dans le workflow correspond au nom du repo

### Problème : Les assets ne chargent pas
- Vérifiez les chemins dans `angular.json` > `assets`

## 🎨 Personnaliser le thème

Le thème MoneyZen utilise des couleurs sarcelle/teal :
- Primary : `#00796b`
- Accent : `#4db6ac`
- Background : `#f0f7f5`

Modifiable dans `src/styles.scss`

## 📱 Fonctionnalités

L'application déployée comprend :
- ✅ Landing page professionnelle
- ✅ Application Angular complète
- ✅ Mode démo sans installation
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Toutes les fonctionnalités offline

## 🔄 Mises à jour

Pour mettre à jour le site :

```bash
git add .
git commit -m "Description des changements"
git push origin main
```

Le workflow se déclenchera automatiquement !

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans l'onglet **Actions** de votre repo
2. Consultez la [documentation GitHub Pages](https://docs.github.com/pages)
3. Ouvrez une issue sur le repository

---

**MoneyZen** - Maîtrisez vos finances en toute sérénité 🧘‍♀️💰
