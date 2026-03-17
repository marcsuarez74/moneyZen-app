# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

## [1.9.0] - 2026-03-17

## [1.8.5] - 2026-03-02

## [1.8.4] - 2026-03-02

## [1.8.3] - 2026-03-02

## [1.6.3] - 2026-02-24

## [1.6.2] - 2026-02-24

## [1.6.1] - 2026-02-24

## [1.6.0] - 2026-02-24

## [1.5.0] - 2026-02-24

## [1.4.5] - 2026-02-24

## [1.4.4] - 2026-02-24

## [1.4.3] - 2026-02-24

## [1.4.2] - 2026-02-24

## [1.4.1] - 2026-02-23

## [1.3.0] - 2026-02-23

### Added
### Changed

### Fixed

## [1.2.0] - 2026-02-23

### ✨ Nouveautés - Import Bancaire
- Import automatique des transactions bancaires via fichiers CSV et OFX
- Wizard d'import en 4 étapes : Sélection de banque, Guide d'export, Upload, Validation
- Support des banques françaises (BNP, Société Générale, Crédit Agricole, BoursoBank, Revolut, N26)
- Détection automatique du format de fichier
- Catégorisation automatique des transactions par intelligence de pattern
- Détection des doublons potentiels
- Tableau de validation avec sélection/désélection des transactions

### 🎨 Design System Fintech
- Modernisation complète de la section Budget avec style Fintech
- Dégradés violet-violet foncé (#667eea → #764ba2) cohérents sur tous les composants
- Bordures arrondies 16px et ombres modernes
- Animations fluides (slide-up, hover effects)
- Typographie moderne avec titres en dégradé
- Checkboxes stylisées avec dégradés
- Cards avec effets de survol modernes

### 📁 Architecture Composants
- Séparation des composants en fichiers .ts/.html/.scss distincts
- Modularisation du wizard d'import bancaire en 4 composants séparés
- BankSelectionStep : Sélection de la banque avec cards
- ExportGuideStep : Guide d'export personnalisé par banque
- FileUploadStep : Zone d'upload drag-and-drop
- TransactionValidationStep : Validation des transactions avant import
- BankImportDialog : Modal d'import avec design Material

### 🔧 Améliorations Techniques
- Styles SCSS propres avec structure hiérarchique
- Performance optimisée avec détection OnPush
- Responsive design pour mobile et desktop
- Gestion d'erreurs améliorée pour les formats de fichiers
- Validation des extensions CSV/OFX

### Composants modernisés
- BudgetDashboardPage, BudgetStatsDisplay, BudgetInsights
- BudgetRecommendations, BudgetSetup, DashboardHeader
- ExpenseBreakdown, EditExpenseDialog, EditIncomeDialog
- DebtRecoveryPlan, WelcomeCard
- Shared components (FormCard, StepIndicator)

## [1.1.3] - 2026-02-23

### Added
- Test feature for changelog extraction
- Test documentation update

### Changed
- Test change in workflow

### Fixed
- Fixed minor bug in test module

## [1.1.2] - 2026-02-23

### Fixed
- Correction du script changelog

## [1.1.1] - 2026-02-23

### Fixed
- Correction du calcul du budget quotidien (utilise maintenant les jours jusqu'à la paie au lieu des jours restants dans le mois)

## [1.1.0] - 2026-02-23

### Added
- Système de release et changelog automatisé
- Composant VersionDisplay pour afficher la version dans l'application
- CategorySelectComponent avec tri alphabétique et icônes
- Tableau éditable dans EditExpensesDialog avec édition inline
- Support complet des fréquences (monthly, quarterly, yearly, one-time)
- Badges colorés pour les fréquences dans le tableau
- Tri par colonnes dans le tableau des charges

### Changed
- Position du badge de dépenses dans le header (top: -16px, right: -42px)
- Amélioration de l'ExpenseFormComponent avec validation renforcée
- Transformation du EditExpensesDialog en tableau Material complet
- Tri alphabétique des catégories de dépenses

## [1.0.0] - 2025-02-23

### Added
- Refonte complète de l'architecture avec pattern Smart/Dumb Components
- Nouveau composant DashboardHeader pour l'en-tête du tableau de bord
- Extraction du WelcomeCardComponent pour l'état vide
- Séparation des templates inline vers fichiers HTML/SCSS dédiés
- Conversion complète de la syntaxe Angular legacy (*ngIf, *ngFor) vers la nouvelle syntaxe (@if, @for)
- Barils d'export (index.ts) pour des imports propres
- Build optimisé sans erreurs de budget

### Changed
- Mise à jour vers Angular 19 avec détection de changements sans Zone.js
- Thème MoneyZen avec teal (#00796b) et vert (#4caf50)
- Support du mode sombre avec variables CSS
- Structure des composants budget suivant les meilleures pratiques Angular

### Fixed
- Avertissements de budget dans les composants
- Découvert des templates et styles dans des fichiers séparés
- Imports inutilisés (RouterLink) supprimés

## [0.9.0] - 2025-02-20

### Added
- Plan de redressement pour les découverts
- Calculatrice de paie avec infos de budget quotidien
- Système de projets d'épargne avec suivi de progression
- Recommandations personnalisées basées sur l'analyse du budget
- Visualisations graphiques des dépenses

### Changed
- Amélioration de l'UX dans le setup des dépenses avec formulaire manuel
- Refonte du processus d'ajout de dépenses

### Fixed
- Correction des liens GitHub pour le déploiement
- Ajustement du base-href pour GitHub Pages
- Corrections de styles des boutons de navigation

## [0.8.0] - 2025-02-15

### Added
- Analyse complète du budget avec métriques de santé
- Insights prioritaires pour optimiser les finances
- Scénarios de projection (conservateur, réaliste, optimisé)
- Stockage local des données (100% confidentiel)

### Changed
- Migration vers Angular Material v19 avec M2 theming
- Optimisation du bundle (--configuration=production)

### Fixed
- Avertissements SASS deprecation
- Correction des couleurs Material 3

## [0.7.0] - 2025-02-10

### Added
- Structure de base de l'application Angular 17+
- Composants Material Design
- Store NgRx pour la gestion d'état
- Configuration CI/CD avec GitHub Actions

### Tech Stack
- Angular 19 (zoneless)
- Angular Material 19
- NgRx Signals & Store
- TypeScript 5.8
- SCSS avec architecture 7-1 pattern

---

## Guide de versioning

Nous utilisons le [versionnage sémantique](https://semver.org/lang/fr/) :

- **MAJEUR** (X.y.z) : Changements incompatibles avec les versions précédentes
- **MINEUR** (x.Y.z) : Fonctionnalités ajoutées de manière rétrocompatible
- **PATCH** (x.y.Z) : Corrections de bugs rétrocompatibles

## Types de modifications

- **Added** : Nouvelles fonctionnalités
- **Changed** : Modifications de fonctionnalités existantes
- **Deprecated** : Fonctionnalités obsolètes (seront supprimées)
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Corrections de vulnérabilités de sécurité
