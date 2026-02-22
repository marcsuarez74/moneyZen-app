# Guide de Release

Ce document explique comment créer et gérer les releases de MoneyZen.

## 🚀 Méthodes de Release

### Méthode 1 : Script Automatique (Recommandé)

Le plus simple et le plus rapide :

```bash
# Release patch (1.0.0 → 1.0.1) - Correction de bug
npm run release:patch

# Release mineure (1.0.0 → 1.1.0) - Nouvelle fonctionnalité
npm run release:minor

# Release majeure (1.0.0 → 2.0.0) - Changement incompatible
npm run release:major
```

Avec push automatique vers GitHub :

```bash
npm run release:patch:push
npm run release:minor:push
npm run release:major:push
```

Le script effectue automatiquement :
1. Mise à jour de `package.json`
2. Mise à jour du `CHANGELOG.md`
3. Mise à jour du `VERSION.md`
4. Mise à jour de `src/assets/version.json`
5. Création du commit Git
6. Création du tag Git (`v1.0.0`)
7. Optionnel : Push vers GitHub
8. Optionnel : Création de la release GitHub (si `gh` CLI est installé)

### Méthode 2 : GitHub Actions (Automatique)

Créez simplement et poussez un tag :

```bash
# Créer le tag
npm version patch  # ou minor, major

# Pousser le tag
git push origin main --tags
```

Le workflow GitHub Actions va automatiquement :
- Vérifier le build
- Exécuter les tests
- Créer une release GitHub avec les notes de release extraites du CHANGELOG
- Déployer sur GitHub Pages (pour les releases stables)

### Méthode 3 : Manuelle

Si vous préférez faire manuellement :

```bash
# 1. Mettre à jour la version dans package.json
# 2. Mettre à jour CHANGELOG.md
# 3. Mettre à jour VERSION.md
# 4. Mettre à jour src/assets/version.json
# 5. Commit
git add .
git commit -m "release: bump version to 1.0.1"

# 6. Créer le tag
git tag -a v1.0.1 -m "Release version 1.0.1"

# 7. Push
git push origin main
git push origin v1.0.1
```

## 📋 Flux de Release Complet

### Standard (Sans PR)

```bash
# 1. S'assurer d'être sur main et à jour
git checkout main
git pull origin main

# 2. Lancer la release
npm run release:patch
# ou
npm run release:minor
# ou
npm run release:major

# 3. Suivre les instructions interactives
# - Confirmer la version
# - Optionnel : Créer la release GitHub via gh CLI

# 4. Push (si ce n'est pas déjà fait par --push)
git push origin main
git push origin v1.0.1

# 5. La CI/CD va automatiquement :
#    - Créer la release GitHub
#    - Déployer sur GitHub Pages
```

### Avec Pull Request (Recommandé pour équipe)

```bash
# 1. Créer une branche de release
git checkout -b release/v1.0.1

# 2. Préparer la release (sans tag pour l'instant)
# Modifier manuellement les fichiers ou utiliser le script partiellement

# 3. Commit et push de la branche
git add .
git commit -m "release: prepare version 1.0.1"
git push origin release/v1.0.1

# 4. Créer une PR sur GitHub
# - Merger après review

# 5. Une fois mergé, créer le tag
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

## 🔧 Prérequis

### Git
```bash
# Configurer Git (une seule fois)
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

### GitHub CLI (Optionnel mais recommandé)

Permet de créer les releases directement depuis le terminal :

```bash
# Installation
brew install gh        # macOS
winget install GitHub.cli  # Windows
apt install gh         # Linux

# Authentification
gh auth login
```

## 📊 Vérifier une Release

```bash
# Voir la version actuelle
npm run version:show

# Voir les tags
git tag -l

# Voir le détail d'un tag
git show v1.0.0

# Checker un tag
git checkout v1.0.0

# Revenir à main
git checkout main
```

## 🔄 Rollback (Annuler une Release)

**⚠️ Attention : Ne pas annuler une release publiée !**

Si vous avez fait une erreur AVANT le push :

```bash
# Supprimer le tag local
git tag -d v1.0.1

# Supprimer le commit de release
git reset --hard HEAD~1

# Ou garder les changements mais modifier
git reset --soft HEAD~1
```

Si déjà poussé, créez une nouvelle release (patch) plutôt que d'annuler.

## 📝 Conventions de Versionnage

Nous suivons [Semantic Versioning](https://semver.org/lang/fr/) :

| Type | Format | Exemple | Quand l'utiliser |
|------|--------|---------|------------------|
| **Patch** | `1.0.x` | `1.0.0` → `1.0.1` | Correction de bug |
| **Mineure** | `1.x.0` | `1.0.0` → `1.1.0` | Nouvelle fonctionnalité (rétrocompatible) |
| **Majeure** | `x.0.0` | `1.0.0` → `2.0.0` | Changement incompatible (breaking change) |

### Exemples de Versionnage

- 🐛 Bugfix : Correction d'un calcul erroné → `1.0.0` → `1.0.1`
- ✨ Feature : Ajout d'un graphique de tendance → `1.0.0` → `1.1.0`
- 💥 Breaking : Changement du format de données nécessitant migration → `1.0.0` → `2.0.0`

## 🌐 Accès aux Releases

- **GitHub Releases** : https://github.com/marcsuarez/budget-app/releases
- **Démo en ligne** : https://marcsuarez74.github.io/moneyZen-app/
- **CHANGELOG** : Voir [CHANGELOG.md](./CHANGELOG.md)

## 🚨 Checklist Pre-Release

Avant de créer une release :

- [ ] Tous les tests passent (`npm test`)
- [ ] Le build est OK (`npm run build:prod`)
- [ ] Le lint n'a pas d'erreurs (`npm run lint`)
- [ ] Le CHANGELOG est à jour
- [ ] Les versions dans les fichiers sont cohérentes
- [ ] Pas de changements non commités (`git status`)

## 📱 Workflow CI/CD

### Déclenchement

Les workflows se déclenchent :

1. **Push sur main** : Build + Tests + Déploiement GitHub Pages
2. **Tag v*** : Build + Tests + Création Release GitHub + Déploiement
3. **Pull Request** : Build + Tests (pas de déploiement)
4. **Manuel** : Via l'interface GitHub (workflow_dispatch)

### Ordre des Étapes

```
Push tag v1.0.0
    │
    ▼
┌──────────────┐
│   Workflow   │
│   Release    │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│  Validation  │────▶│     Tag      │ Invalid ❌
│ (lint, test) │     └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│    Build     │────▶│    Error     │ ❌
│   Web App    │     └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Release    │
│   GitHub     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Déployer   │
│ GitHub Pages │
└──────────────┘
       │
       ▼
      ✅
   Release
   Publiée!
```

## 💡 Astuces

### Prévisualiser les changements

```bash
# Voir ce qui serait changé par une release (sans rien modifier)
node scripts/release.js patch --dry-run  # N'existe pas encore, idée pour le futur
```

### Releases Bêta/Alpha

Pour des versions de test :

```bash
# Version bêta
npm version preminor --preid=beta  # 1.0.0 → 1.1.0-beta.0
git tag -a v1.1.0-beta.0

# La CI créera une release "prerelease"
```

## 🆘 Support

En cas de problème avec une release :

1. Consulter les logs CI/CD sur GitHub Actions
2. Vérifier les erreurs de build : `npm run build:prod`
3. Vérifier l'état Git : `git status`
4. Voir l'historique : `git log --oneline -10`

---

**Dernière mise à jour** : Voir [VERSION.md](./VERSION.md)
