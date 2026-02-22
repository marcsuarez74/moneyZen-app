# MoneyZen - Application de Gestion de Budget

## Lancer l'application

### Prérequis
- Node.js 20.x (voir `.nvmrc`)
- npm 10.x

### Installation

```bash
# Se placer dans le dossier du projet
cd /Users/marcsuarez/Documents/PROJET_DEV/budget-app

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

### Accéder à l'application

Ouvrir le navigateur à l'adresse : **http://localhost:4200**

⚠️ **IMPORTANT** : Ne pas ouvrir directement le fichier index.html dans le navigateur. 
L'application doit être servie par un serveur web (le serveur de développement Angular fait ça automatiquement).

### Build pour production

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/budget-app/browser/`.

Pour tester le build en local :
```bash
npx http-server dist/budget-app/browser -p 8080
```
Puis ouvrir http://localhost:8080

## Fonctionnalités

- **Gestion de Budget** : Saisie des revenus et charges avec recommandations
- **Projets** : Planification et suivi d'objectifs financiers  
- **Repas** : Menus hebdomadaires avec liste de courses

## Architecture

- Angular 17 avec standalone components
- Angular Material pour l'UI
- NgRx SignalStore pour la gestion d'état
- LocalStorage pour la persistance
- Cypress pour les tests E2E
