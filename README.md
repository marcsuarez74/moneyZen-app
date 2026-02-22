# MoneyZen - Application de Gestion de Budget Personnel

Une application web moderne et intelligente de gestion de budget personnel, conçue pour accompagner chacun vers une meilleure santé financière. Que vous souhaitiez simplement suivre vos dépenses, remonter d'un découvert bancaire, ou optimiser votre épargne, MoneyZen vous guide pas à pas.

## 🎯 Vision et Problématiques Résolues

MoneyZen répond aux défis financiers quotidiens auxquels font face la majorité des ménages :

### Problèmes Identifiés
- **Endettement progressif** : Découvert bancaire qui s'aggrave mois après mois sans stratégie de sortie claire
- **Budget mensuel difficile à tenir** : Impossible de savoir combien on peut réellement dépenser chaque jour
- **Absence de traçabilité** : Où passe l'argent ? Quelles sont les fuites budgétaires ?
- **Manque de culture financière** : Peu de gens connaissent les règles de base (50/30/20, taux d'endettement)
- **Charges fixes écrasantes** : Loyers et crédits qui absorbent tout le salaire
- **Épargne inexistante** : Pas de provisions pour les imprévus ou la retraite
- **Procrastination** : On reporte toujours à plus tard la mise en place d'un budget

### Solutions Apportées
- **Plan de redressement personnalisé** : Pour sortir du découvert en respectant son niveau de vie
- **Budget quotidien calculé automatiquement** : Basé sur le reste à vivre réel et les jours restants dans le mois
- **Visualisation claire et instantanée** : Graphiques, alertes et recommandations intelligentes
- **Éducation financière intégrée** : Conseils et seuils recommandés directement dans l'app
- **Optimisation automatique** : Identification des dépenses superflues et suggestions d'économies
- **Suivi de projets d'épargne** : Transformation de l'épargne en objectifs concrets et motivants

## 📦 Fonctionnalités Principales

### 💰 Module Budget Intelligent

Le cœur de l'application, détaillé plus bas dans ce document.

**Pour l'utilisateur :**
- Saisie intuitive du salaire, solde et jour de paie
- Catalogue de 40+ catégories de dépenses pré-définies
- Plan de redressement interactif si découvert bancaire
- Budget quotidien calculé en temps réel
- Alertes intelligentes selon l'avancement du mois
- Notifications des charges à venir

**Pour le développeur/contributor :**
- Architecture basée sur NgRx SignalStore
- Calculs financiers complexes encapsulés dans des services
- Système de recommandations extensible
- Sauvegarde automatique dans le LocalStorage

### 🎯 Planification de Projets
- Création et suivi de projets d'épargne (voyage, achat immobilier, fonds d'urgence...)
- Templates pré-configurés avec estimations réalistes
- Suivi de progression visuel avec graphiques
- Calculs de faisabilité basés sur le budget mensuel réel
- Notifications de jalons atteints

## 🏦 Module Budget - Documentation Complète

### 📊 Règles Financières de Référence

MoneyZen s'appuie sur des standards financiers reconnus :

#### 1. Règle des 50/30/20 (Elizabeth Warren)
| Catégorie | Pourcentage | Description |
|-----------|-------------|-------------|
| **Besoins** | 50% | Charges fixes incontournables (logement, transports, alimentation de base) |
| **Envies** | 30% | Loisirs, restaurants, shopping, abonnements |
| **Épargne** | 20% | Épargne de précaution, investissements, retraite |

**Implémentation** : L'application calcule automatiquement ces ratios et alerte l'utilisateur s'il dévie significativement.

#### 2. Seuils Recommandés par Catégorie

| Catégorie | Max Recommandé | Idéal | Référence |
|-----------|---------------|-------|-----------|
| **Logement seul** | 30% du revenu | 25% | Taux d'effort recommandé par les banques |
| **Logement + Crédit immo** | 35% du revenu | 33% | Taux d'endettement maximal français |
| **Transport total** | 15% du revenu | 10% | Incluant crédit, essence, assurance |
| **Alimentation** | 15% du revenu | 12% | INSEE/OMR - Panier de consommation moyen |
| **Services (internet, énergie...)** | 10% du revenu | 8% | Forfaits moyens français |
| **Assurances** | 8% du revenu | 6% | Assurance vie, habitation, santé |
| **Loisirs & Sorties** | 10% du revenu | 8% | Standard FIRE (Financial Independence) |
| **Santé** | 8% du revenu | 5% | Mutuelles et frais médicaux |
| **Épargne** | Min 10% du revenu | 20% | Conseillers financiers / Livre "The Richest Man in Babylon" |

**Implémentation** : `src/app/services/budget-advisor.service.ts` - lignes 54-127

#### 3. Indicateurs de Santé Financière

**Budget Health Score** (0-100) :
```typescript
let budgetHealth = 100;
if (budgetDéficit) budgetHealth -= 40;
if (marge < 10% salaire) budgetHealth -= 20;
if (tauxÉpargne < 10%) budgetHealth -= 15;
if (découvertBancaire) budgetHealth -= 10;
if (catégorieSurchargée) budgetHealth -= 5 x nombreDeCatégories;
```

**Seuils d'interprétation :**
- 80-100 : Excellente santé financière 🟢
- 60-79 : Budget maîtrisé avec optimisations possibles 🟡
- 40-59 : Vigilance requise 🔴
- 0-39 : Situation critique ⚠️

### 🚨 Gestion du Découvert Bancaire

#### Problématique Spécifique
Le découvert bancaire ("découvert autorisé") est une situation où le compte passe en négatif. Contrairement à un prêt classique :
- **Pas de durée définie** : Peut durer des mois/années
- **Intérêts élevés** : Souvent 8-15% selon les banques
- **Effet boule de neige** : Les agios s'accumulent et creusent le trou
- **Stress permanent** : L'utilisateur ne sait pas comment en sortir

#### Solution : Plan de Redressement Progressif

**Objectif** : Remonter progressivement à zéro en maintenant un niveau de vie décent.

**Algorithme de calcul :**
```typescript
// Budget minimum pour vivre (courses basiques, transport, imprévus)
minimumLivingCost = max(300€, 15% du salaire)

// Budget mensuel utilisable
availableBudget = resteÀVivre - (découvertActuel / nombreDeMois)

// Budget quotidien réel
actualDailyBudget = availableBudget / joursRestantsDansLeMois

// Si après le 20 du mois (> 66% du mois écoulé)
if (monthProgressPercent > 66%) {
  // Budget ajusté pour les jours restants uniquement
  dailyBudget = remainingBudget / remainingDaysInMonth
}
```

**Phases du Plan :**
1. **Évaluation** : Calcul du découvert, des revenus, des charges fixes
2. **Simulation** : Budget mensuel disponible selon différentes durées (3-12 mois)
3. **Mensualités adaptatives** : Pas de montant fixe, mais un budget de vie calculé
4. **Suivi mois par mois** : Progression visuelle de la remontée à zéro
5. **Ajustement** : Possibilité d'allonger/shorten la durée selon les difficultés

**Implémentation** : `src/app/features/budget/components/debt-recovery-plan/debt-recovery-plan.component.ts`

### 📅 Calcul du Budget Quotidien Intelligent

#### Problématique : Le Classique Piège Mental
> "J'ai 800€ de reste à vivre, donc je peux dépenser 26€ par jour..."

**FAUX !** Le 21 février avec 10 jours restants avant la paie, le calcul doit être :
```
Budget réel par jour = 800€ / 10 jours = 80€/jour
```

#### Algorithme Complet (PaydayCalculatorService)

```typescript
calculatePaydayInfo(salary, paydayDay, remainingBudget) {
  const today = new Date().getDate();
  const daysInMonth = 30; // Ou calcul réel selon le mois
  const remainingDays = daysInMonth - today;
  const monthProgressPercent = (today / daysInMonth) * 100;
  
  // Budget théorique sur tout le mois
  const theoreticalDailyBudget = remainingBudget / daysInMonth;
  
  // Budget réel pour les jours restants (CRUCIAL !)
  const actualDailyBudget = remainingBudget / remainingDays;
  
  // Messages adaptatifs selon la progression
  if (monthProgressPercent >= 66) {
    return "Fin de mois à ${percentage}% - Plus que ${remainingDays} jours";
  }
  
  return actualDailyBudget;
}
```

**Exemple concret (21 février 2026) :**
- Revenus : 2500€
- Charges fixes : 1700€
- Reste à vivre : 800€
- Jours restants : 10 (jusqu'au 1er mars)

**Messages affichés :**
- 📊 "Mois à 75% d'écoulé"
- 💰 "Budget réel : 80€/jour pour les 10 jours restants"
- ⚠️ Si budget < 20€/jour : "Budget très serré - Priorisez l'essentiel"

### 🔔 Système d'Alertes et Notifications

#### Alertes de Charges à Venir
**Problème** : "Oups, j'ai oublié que mon prêt voiture était prélevé demain !"

**Solution** : Détection automatique des charges fixes restant à prélever dans le mois.

**Dates estimées de prélèvement :**
| Type de charge | Jour estimé |
|----------------|-------------|
| Loyer / Crédit immobilier | 5 du mois |
| Crédit voiture | 10 du mois |
| Assurances | 12 du mois |
| Factures énergie/eau | 15 du mois |
| Internet / Téléphone | 20 du mois |

**Calcul :**
```typescript
const fixedCategories = ['housing', 'mortgage', 'carLoan', 'insurance', 'utilities'];
const upcomingCharges = expenses.filter(expense => {
  const chargeDay = getEstimatedChargeDay(expense.category);
  return chargeDay >= today && chargeDay <= lastDayOfMonth;
});

if (upcomingCharges.total > 500€) {
  // Notification orange/rouge dans le header
}
```

#### Alertes de Budget Serré
**Seuils déclencheurs :**
- Budget quotidien < 25€/jour : Avertissement
- Budget quotidien < 15€/jour : Alerte active
- Budget quotidien < 10€/jour : Alerte critique + animation

### 🧮 Algorithmes d'Optimisation

#### 1. Détection des Catégories Surchargées
```typescript
getOverloadedCategories(summary: BudgetSummary) {
  const overloaded = [];
  
  Object.entries(summary.expenseBreakdown).forEach(([category, amount]) => {
    const percentOfIncome = amount / summary.totalIncome;
    const threshold = categoryThresholds[category].max;
    
    if (percentOfIncome > threshold) {
      overloaded.push({
        category,
        amount,
        overBudget: amount - (summary.totalIncome * threshold)
      });
    }
  });
  
  return overloaded.sort((a, b) => b.overBudget - a.overBudget);
}
```

#### 2. Génération de Recommandations Intelligentes
**Types de recommandations :**
- ** reduce** : Réduire une catégorie (ex: restaurants de 200€ à 150€)
- **eliminate** : Supprimer temporairement (ex: abonnements en période de déficit)
- **optimize** : Optimiser sans sacrifier (ex: comparer assurances)
- **suggestion** : Créer une nouvelle habitude (ex: épargne automatique)

**Priorisation :**
```typescript
const priorityOrder = { high: 0, medium: 1, low: 2 };
recommendations.sort((a, b) => {
  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }
  return b.potentialSavings - a.potentialSavings;
});
```

#### 3. Scénarios Budgétaires
**Trois projections générées automatiquement :**

| Scénario | Hypothèses | Usage |
|----------|------------|-------|
| **Conservateur** | -10% revenus, +5% dépenses | Stress-test, préparation aux imprévus |
| **Réaliste** | Inflation 2%/an | Projection réelle sur 12 mois |
| **Optimisé** | Application des recommandations | Potentiel maximal d'économies |

### 📱 Interface Utilisateur (UX/UI)

#### Dashboard Budget
**Structure de la page :**
1. **Header** : Info temps réel sur la paie et budget quotidien
   - Badge "charges à venir" si charges > 500€ dans le mois
   - Badge "solde négatif" si découvert bancaire
2. **Plan de redressement** : Si découvert détecté (composant conditionnel)
3. **Insights prioritaires** : Alertes et opportunités (max 3 affichées)
4. **Stats cards** : Revenus, dépenses, reste à vivre, capacité d'épargne
5. **Tabs** : Répartition graphique, Conseils, Projections sur 12 mois

#### Calculs en Temps Réel
Tous les calculs sont effectués via des `computed()` signals Angular :
- Instantanés (pas de refresh nécessaire)
- Réactifs (modification d'une dépense = tout recalculé)
- Mémorisés (pas de recalcul inutile)

### 💾 Persistance des Données

```typescript
// Structure stockée dans LocalStorage
interface BudgetState {
  userData: {
    salary: number;
    accountBalance: number;
    isPositiveBalance: boolean;
    paydayDay: number; // Jour du mois (1-31)
  };
  expenses: Expense[];
}
```

**Vie privée** : 
- Aucune donnée ne quitte le navigateur
- Pas de backend, pas de tracking
- Données stockées localement chiffrées (si HTTPS)

### 🔒 Sécurité et Fiabilité

- **Validation** : Tous les montants sont validés (positifs, pas de NaN)
- **Plages cohérentes** : Impossible de déclarer un salaire négatif
- **Calculs précis** : Aucune approximation, tous les calculs en centimes
- **Fallback** : Valeurs par défaut si données corrompues

## 🛠️ Stack Technique

### Core
- **Framework** : Angular 17+ (Standalone Components)
- **Langage** : TypeScript 5+
- **State Management** : NgRx SignalStore
- **UI Components** : Angular Material

### Services Métier Clés
| Service | Responsabilité | Fichier |
|---------|---------------|---------|
| `BudgetAdvisorService` | Analyse complète et génération d'insights | `src/app/services/budget-advisor.service.ts` |
| `BudgetOptimizationService` | Recommandations d'optimisation | `src/app/services/budget-optimization.service.ts` |
| `PaydayCalculatorService` | Calculs liés à la paie et budget quotidien | `src/app/services/payday-calculator.service.ts` |
| `LocalStorageService` | Persistance des données | `src/app/services/local-storage.service.ts` |

### Architecture

#### Smart / Dumb Components
- **Smart Components** (Containers) : Gèrent l'état et la logique
  - `BudgetDashboardPageComponent` - Dashboard principal
  - `BudgetSetupComponent` - Configuration initiale
  - `DebtRecoveryPlanComponent` - Plan de redressement

- **Dumb Components** (Présentation) : Représentation pure
  - `StatCardComponent` - Carte de statistique
  - `BudgetInsightsComponent` - Liste d'alertes
  - `ExpenseBreakdownComponent` - Graphiques de dépenses

#### Structure des Composants Budget
```
src/app/features/budget/
├── components/
│   ├── budget-dashboard-page/    # Page principale
│   ├── budget-setup/             # Configuration initiale
│   ├── debt-recovery-plan/       # Plan de redressement ⭐
│   ├── budget-stats-display/     # Affichage des stats
│   ├── budget-insights/          # Alertes et notifications
│   ├── budget-recommendations/   # Liste des recommandations
│   ├── expense-breakdown/        # Graphiques et répartition
│   ├── edit-income-dialog/       # Modification revenus
│   └── edit-expenses-dialog/     # Modification charges
├── budget.routes.ts              # Routes
└── budget-feature.component.ts   # Entry point
```

## 🌐 Démo en ligne

**Essayez l'application maintenant !** 👉 [https://marcsuarez74.github.io/moneyZen-app/](https://marcsuarez74.github.io/moneyZen-app/)

L'application est une PWA (Progressive Web App) fonctionnant directement dans votre navigateur.

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm 9+
- Angular CLI 17+ (optionnel, `npx ng` fonctionne aussi)

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd budget-app

# Installer les dépendances
npm install

# Lancer l'application
npm start
# ou
ng serve
```

L'application sera accessible à l'adresse `http://localhost:4200/`.

### Scripts Disponibles

```bash
npm start              # Serveur de développement
npm run build          # Build de production
npm test               # Tests unitaires (Karma/Jest)
npm run e2e            # Tests E2E avec Cypress (mode interactif)
npm run e2e:ci         # Tests E2E avec Cypress (mode CI)
npm run lint           # Linting ESLint
npm run lint:fix       # Linting + auto-fix
```

## 🧪 Tests

### Tests Unitaires
Tests des services métier et calculs financiers :
```bash
npm test
```

**Couverture critique :**
- Calculs des budgets quotidiens
- Algorithmes de recommandations
- Détection des catégories surchargées
- Plan de redressement

### Tests E2E (Cypress)
Parcours utilisateur complets :
```bash
npm run e2e
```

**Scénarios testés :**
1. Création d'un budget complet
2. Configuration du plan de redressement
3. Modification des dépenses et recalcul
4. Navigation entre les tabs

## 🔄 Pipeline CI/CD (GitHub Actions)

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Unit tests
        run: npm test -- --watch=false --browsers=ChromeHeadless
      
      - name: Build
        run: npm run build
      
      - name: E2E tests
        run: npm run e2e:ci
      
      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/budget-app/browser
```

## 📱 PWA (Progressive Web App)

MoneyZen fonctionne hors-ligne comme une application native :

- **Manifest** : Installation sur écran d'accueil (Android/iOS)
- **Service Workers** : Mise en cache des assets et données
- **Offline** : Consultation du budget même sans connexion
- **Responsive** : Adapté mobile, tablette et desktop

## 🎨 Personnalisation

### Thèmes
Deux thèmes disponibles :
- **Light Mode** : Interface claire (par défaut)
- **Dark Mode** : Interface sombre pour les environnements faiblement éclairés

Changement via le composant `ThemeToggleComponent`.

### Catégories de Dépenses
40+ catégories pré-définies, extensibles dans :
```typescript
// src/app/models/budget.model.ts
EXPENSE_CATEGORIES
```

## 🔮 Roadmap

### Fonctionnalités Planifiées
- [ ] Import bancaire (OFX, CSV)
- [ ] Mode couple/famille (partage du budget)
- [ ] Prédictions ML des dépenses futures
- [ ] Notifications push (charges à venir)
- [ ] Export PDF du bilan mensuel
- [ ] Widget mobile (Android/iOS natif)

### Optimisations Techniques
- [ ] Migration vers IndexedDB (pour gros volumes)
- [ ] Compression des données LocalStorage
- [ ] PWA offline complète (同步 quand reconnecté)

## 🤝 Contribution

### Guide de Contribution
1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit avec messages conventionnels (`git commit -am 'feat: ajout de la feature'`)
4. Push la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

### Standards de Code
- **Linting** : ESLint avec configuration Angular
- **Formatage** : Prettier (2 espaces, single quotes)
- **Tests** : Couverture > 80% pour les services métier
- **Documentation** : JSDoc pour les fonctions complexes

## 👥 Équipe et Remerciements

Développé avec passion pour aider chacun à mieux gérer son budget.

## 📄 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support et Contact

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions** : Pour les questions et partages d'expérience
- **Email** : [votre-email@example.com]

---

<p align="center">
  <strong>MoneyZen</strong> - Prenez le contrôle de vos finances, un euro à la fois. 💪
</p>

<p align="center">
  <sub>Développé avec Angular, TypeScript et ❤️</sub>
</p>
