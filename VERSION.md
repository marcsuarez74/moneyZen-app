# Version

## Version actuelle

**1.4.5**

Date de release : 2025-02-23

## Historique des versions

| Version | Date | Description |
|---------|------|-------------|
| 1.4.5 | 2026-02-24 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.4.4 | 2026-02-24 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.4.3 | 2026-02-24 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.4.2 | 2026-02-24 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.4.1 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.3.0 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.1.3 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.1.2 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.1.1 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2026-02-23 | [INSCRIRE LA DESCRIPTION] |
| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-02-23 | Release initiale avec architecture Smart/Dumb Components refactorisée |
| 0.9.0 | 2025-02-20 | Ajout du plan de redressement et système de projets |
| 0.8.0 | 2025-02-15 | Analyse budget complète et métriques de santé |
| 0.7.0 | 2025-02-10 | Structure de base de l'application |

## Calendrier de release

### Prochaines versions planifiées

#### 1.1.0 (Q2 2025)
- [ ] Export des données en JSON/CSV
- [ ] Authentification utilisateur (optionnel)
- [ ] Synchronisation cloud chiffrée
- [ ] Mode hors-ligne avancé

#### 1.2.0 (Q3 2025)
- [ ] Graphiques et visualisations avancées
- [ ] Prédictions basées sur l'historique
- [ ] Alertes intelligentes

#### 2.0.0 (Q4 2025)
- [ ] Support multi-utilisateur
- [ ] Application mobile PWA
- [ ] Intégration bancaire (API)

## Légende des versions

- **x.0.0** : Version majeure - Changements architecturaux significatifs
- **x.y.0** : Version mineure - Nouvelles fonctionnalités
- **x.y.z** : Version patch - Corrections de bugs

## Procédure de release

1. Mettre à jour `package.json` avec la nouvelle version
2. Mettre à jour `CHANGELOG.md` en déplaçant "[Unreleased]" vers une version datée
3. Mettre à jour `VERSION.md` avec les nouvelles informations
4. Créer un tag Git : `git tag -a v1.0.0 -m "Release version 1.0.0"`
5. Pusher le tag : `git push origin v1.0.0`
6. Créer une release GitHub à partir du tag
7. Mettre à jour `CHANGELOG.md` avec une nouvelle section "[Unreleased]"

## Commandes utiles

```bash
# Créer une release patch (1.0.0 → 1.0.1)
npm run release:patch

# Créer une release mineure (1.0.0 → 1.1.0)
npm run release:minor

# Créer une release majeure (1.0.0 → 2.0.0)
npm run release:major

# Créer une release manuelle avec tag Git
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```
