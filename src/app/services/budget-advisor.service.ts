import { Injectable } from '@angular/core';
import { 
  Expense, 
  ExpenseCategory, 
  BudgetSummary, 
  UserFinancialData,
  Recommendation,
  EXPENSE_CATEGORIES 
} from '../models/budget.model';

export interface FinancialInsight {
  type: 'warning' | 'positive' | 'info' | 'opportunity';
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  icon: string;
  priority: number;
}

export { Recommendation } from '../models/budget.model';

export interface BudgetAnalysis {
  insights: FinancialInsight[];
  recommendations: Recommendation[];
  metrics: {
    budgetHealth: number; // 0-100
    savingsRate: number; // % du salaire épargné
    fixedExpensesRatio: number; // % des dépenses fixes
    discretionarySpending: number; // % des dépenses discrétionnaires
    debtToIncomeRatio: number; // Ratio dette/revenu
  };
  scenarios: {
    worstCase: BudgetScenario;
    realistic: BudgetScenario;
    optimized: BudgetScenario;
  };
}

export interface BudgetScenario {
  name: string;
  description: string;
  monthlySavings: number;
  yearlyProjection: number;
  timelineToGoal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetAdvisorService {
  
  // Seuils recommandés par catégorie (% du revenu)
  private readonly categoryThresholds: Record<ExpenseCategory, { min: number; max: number; ideal: number }> = {
    // Logement (avec crédit immo + taxes) - max 35%
    housing: { min: 0, max: 0.30, ideal: 0.25 },
    mortgage: { min: 0, max: 0.30, ideal: 0.28 },
    propertyTax: { min: 0, max: 0.05, ideal: 0.03 },
    condoFees: { min: 0, max: 0.08, ideal: 0.05 },
    housingServices: { min: 0, max: 0.03, ideal: 0.02 },
    
    // Transport - max 15%
    transport: { min: 0, max: 0.15, ideal: 0.10 },
    carLoan: { min: 0, max: 0.10, ideal: 0.08 },
    carInsurance: { min: 0, max: 0.05, ideal: 0.03 },
    fuel: { min: 0, max: 0.08, ideal: 0.05 },
    carMaintenance: { min: 0, max: 0.04, ideal: 0.02 },
    publicTransport: { min: 0, max: 0.05, ideal: 0.03 },
    
    // Alimentation - max 15%
    food: { min: 0, max: 0.15, ideal: 0.12 },
    restaurants: { min: 0, max: 0.08, ideal: 0.05 },
    
    // Services - max 10%
    utilities: { min: 0, max: 0.08, ideal: 0.06 },
    internet: { min: 0, max: 0.02, ideal: 0.015 },
    phone: { min: 0, max: 0.02, ideal: 0.015 },
    tvStreaming: { min: 0, max: 0.02, ideal: 0.01 },
    energy: { min: 0, max: 0.05, ideal: 0.04 },
    water: { min: 0, max: 0.02, ideal: 0.01 },
    
    // Assurances - max 8%
    insurance: { min: 0, max: 0.08, ideal: 0.06 },
    homeInsurance: { min: 0, max: 0.03, ideal: 0.02 },
    healthInsurance: { min: 0, max: 0.04, ideal: 0.03 },
    lifeInsurance: { min: 0, max: 0.03, ideal: 0.02 },
    
    // Santé - max 8% (santé = priorité)
    health: { min: 0, max: 0.08, ideal: 0.05 },
    medicalExpenses: { min: 0, max: 0.05, ideal: 0.03 },
    pharmacy: { min: 0, max: 0.03, ideal: 0.02 },
    
    // Éducation - max 10%
    education: { min: 0, max: 0.10, ideal: 0.08 },
    tuition: { min: 0, max: 0.08, ideal: 0.06 },
    schoolSupplies: { min: 0, max: 0.02, ideal: 0.01 },
    
    // Loisirs & Sport - max 10%
    leisure: { min: 0, max: 0.10, ideal: 0.08 },
    sport: { min: 0, max: 0.05, ideal: 0.03 },
    gym: { min: 0, max: 0.03, ideal: 0.02 },
    streaming: { min: 0, max: 0.02, ideal: 0.01 },
    hobbies: { min: 0, max: 0.05, ideal: 0.03 },
    culture: { min: 0, max: 0.04, ideal: 0.03 },
    travel: { min: 0, max: 0.08, ideal: 0.05 },
    
    // Services personnels - max 8%
    personalServices: { min: 0, max: 0.05, ideal: 0.03 },
    beauty: { min: 0, max: 0.03, ideal: 0.02 },
    clothing: { min: 0, max: 0.05, ideal: 0.03 },
    
    // Crédits - max 10% (hors crédit immo/voiture déjà comptés)
    consumerLoan: { min: 0, max: 0.10, ideal: 0.05 },
    debtRepayment: { min: 0, max: 0.10, ideal: 0.05 },
    
    // Épargne - min 10%, pas de max
    savings: { min: 0.10, max: 1, ideal: 0.20 },
    investments: { min: 0.05, max: 1, ideal: 0.15 },
    retirement: { min: 0.05, max: 1, ideal: 0.10 },
    
    // Divers - max 5-8%
    pets: { min: 0, max: 0.05, ideal: 0.03 },
    gifts: { min: 0, max: 0.03, ideal: 0.02 },
    donations: { min: 0, max: 0.05, ideal: 0.03 },
    taxes: { min: 0, max: 0.05, ideal: 0.03 },
    other: { min: 0, max: 0.08, ideal: 0.05 }
  };

  /**
   * Analyse complète du budget et génération d'insights
   */
  analyzeBudget(
    userData: UserFinancialData, 
    expenses: Expense[], 
    summary: BudgetSummary
  ): BudgetAnalysis {
    const metrics = this.calculateMetrics(userData, expenses, summary);
    const insights = this.generateInsights(userData, expenses, summary, metrics);
    const recommendations = this.generateRecommendations(userData, expenses, summary, metrics);
    const scenarios = this.generateScenarios(userData, expenses, summary, metrics);

    return {
      insights,
      recommendations,
      metrics,
      scenarios
    };
  }

  /**
   * Calcule les métriques clés du budget
   */
  private calculateMetrics(
    userData: UserFinancialData,
    expenses: Expense[],
    summary: BudgetSummary
  ) {
    const salary = userData.salary;
    const totalExpenses = summary.totalExpenses;
    
    // Taux d'épargne (si l'utilisateur a une catégorie savings)
    const savingsExpense = expenses.find(e => e.category === 'savings');
    const savingsRate = savingsExpense ? (savingsExpense.monthlyEquivalent / salary) * 100 : 0;
    
    // Dépenses fixes (housing + transport + insurance + utilities)
    const fixedCategories: ExpenseCategory[] = ['housing', 'transport', 'insurance', 'utilities'];
    const fixedExpenses = expenses
      .filter(e => fixedCategories.includes(e.category))
      .reduce((sum, e) => sum + e.monthlyEquivalent, 0);
    const fixedExpensesRatio = (fixedExpenses / totalExpenses) * 100;
    
    // Dépenses discrétionnaires
    const discretionaryExpenses = totalExpenses - fixedExpenses;
    const discretionarySpending = (discretionaryExpenses / totalExpenses) * 100;
    
    // Health score basé sur plusieurs facteurs
    let budgetHealth = 100;
    if (summary.remainingBudget < 0) budgetHealth -= 40;
    if (summary.remainingBudget < salary * 0.10) budgetHealth -= 20;
    if (savingsRate < 10) budgetHealth -= 15;
    if (!userData.isPositiveBalance) budgetHealth -= 10;
    
    // Détecter les catégories surchargées
    const overloadedCategories = this.getOverloadedCategories(summary);
    budgetHealth -= (overloadedCategories.length * 5);

    // Ratio dette/revenu (simplifié - basé sur loyers/prêts)
    const debtExpenses = expenses.filter(e => 
      e.name.toLowerCase().includes('prêt') || 
      e.name.toLowerCase().includes('crédit')
    );
    const debtToIncomeRatio = debtExpenses.reduce((sum, e) => sum + e.monthlyEquivalent, 0) / salary;

    return {
      budgetHealth: Math.max(0, budgetHealth),
      savingsRate,
      fixedExpensesRatio,
      discretionarySpending,
      debtToIncomeRatio
    };
  }

  /**
   * Génère des insights intelligents basés sur l'analyse
   */
    private generateInsights(
    userData: UserFinancialData,
    expenses: Expense[],
    summary: BudgetSummary,
    metrics: { savingsRate: number; budgetHealth: number; fixedExpensesRatio: number }
  ): FinancialInsight[] {
    const insights: FinancialInsight[] = [];

    // 1. Analyse du solde
    if (!userData.isPositiveBalance) {
      insights.push({
        type: 'warning',
        title: 'Solde bancaire négatif',
        description: `Votre solde est de ${userData.accountBalance.toLocaleString('fr-FR')}€. C'est un signal d'alerte qui nécessite une action immédiate.`,
        actionable: true,
        actionText: 'Voir les économies possibles',
        icon: 'warning',
        priority: 10
      });
    }

    // 2. Analyse du reste à vivre
    if (summary.remainingBudget < 0) {
      insights.push({
        type: 'warning',
        title: 'Déficit budgétaire critique',
        description: `Vos dépenses (${summary.totalExpenses.toLocaleString('fr-FR')}€) dépassent votre salaire (${summary.totalIncome.toLocaleString('fr-FR')}€) de ${Math.abs(summary.remainingBudget).toLocaleString('fr-FR')}€. Vous êtes en train de vous endetter à chaque mois.`,
        actionable: true,
        actionText: 'Reduire les dépenses',
        icon: 'trending_down',
        priority: 9
      });
    } else if (summary.remainingBudget < summary.totalIncome * 0.10) {
      insights.push({
        type: 'warning',
        title: 'Marge de manoeuvre faible',
        description: `Il ne vous reste que ${summary.remainingBudget.toLocaleString('fr-FR')}€ par mois. En cas d'imprévu (dépannage voiture, appareil cassé), vous serez dans le rouge.`,
        actionable: true,
        actionText: 'Créer un fonds d\'urgence',
        icon: 'warning_amber',
        priority: 8
      });
    }

    // 3. Analyse par catégorie
    const overloaded = this.getOverloadedCategories(summary);
    overloaded.forEach(categoryInfo => {
      const category = EXPENSE_CATEGORIES.find(c => c.value === categoryInfo.category);
      const percentOfIncome = ((categoryInfo.amount / summary.totalIncome) * 100).toFixed(1);
      insights.push({
        type: 'warning',
        title: `${category?.label || categoryInfo.category} trop élevé`,
        description: `Vous dépensez ${categoryInfo.amount.toLocaleString('fr-FR')}€ (${percentOfIncome}% de vos revenus) en ${category?.label?.toLowerCase() || categoryInfo.category}. Le maximum recommandé est ${(this.categoryThresholds[categoryInfo.category].max * 100).toFixed(0)}%.`,
        actionable: true,
        actionText: 'Optimiser cette catégorie',
        icon: category?.icon || 'info',
        priority: 7
      });
    });

    // 4. Taux d'épargne
    if (metrics.savingsRate < 10) {
      insights.push({
        type: 'opportunity',
        title: 'Épargne insuffisante',
        description: `Vous épargnez ${metrics.savingsRate.toFixed(1)}% de vos revenus. Pour construire un patrimoine et préparer votre retraite, il est recommandé d'épargner au moins 10-20%.`,
        actionable: true,
        actionText: 'Mettre en place une épargne automatique',
        icon: 'savings',
        priority: 6
      });
    } else if (metrics.savingsRate >= 20) {
      insights.push({
        type: 'positive',
        title: 'Excellente discipline d\'épargne',
        description: `Bravo ! Vous épargnez ${metrics.savingsRate.toFixed(1)}% de vos revenus. Vous êtes sur la bonne voie pour atteindre vos objectifs financiers.`,
        actionable: false,
        icon: 'emoji_events',
        priority: 4
      });
    }

    // 5. Abonnements multiples
    const subscriptions = expenses.filter(e => 
      e.frequency === 'monthly' && 
      (e.name.includes('Netflix') || 
       e.name.includes('Spotify') || 
       e.name.includes('Disney') ||
       e.name.includes('Amazon Prime') ||
       e.name.includes('Canal') ||
       e.name.includes('Abonnement'))
    );
    
    if (subscriptions.length >= 3) {
      const totalSubscriptions = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
      insights.push({
        type: 'opportunity',
        title: 'Nombreux abonnements détectés',
        description: `Vous avez ${subscriptions.length} abonnements mensuels pour un total de ${totalSubscriptions.toFixed(0)}€/mois. Avez-vous vraiment besoin de tous ?`,
        actionable: true,
        actionText: 'Auditer mes abonnements',
        icon: 'subscriptions',
        priority: 5
      });
    }

    // 6. Charge financière (loyer + crédits)
    if (metrics.fixedExpensesRatio > 60) {
      insights.push({
        type: 'warning',
        title: 'Charges fixes trop lourdes',
        description: `${metrics.fixedExpensesRatio.toFixed(0)}% de votre budget part en dépenses fixes. Cela vous laisse peu de flexibilité pour les loisirs et imprévus.`,
        actionable: true,
        actionText: 'Analyser les charges fixes',
        icon: 'account_balance',
        priority: 6
      });
    }

    // 7. Santé financière globale
    if (metrics.budgetHealth >= 80) {
      insights.push({
        type: 'positive',
        title: 'Excellent équilibre financier',
        description: `Votre score de santé financière est de ${metrics.budgetHealth}/100. Continuez sur cette voie !`,
        actionable: false,
        icon: 'verified',
        priority: 3
      });
    }

    // Trier par priorité
    return insights.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private generateRecommendations(
    userData: UserFinancialData,
    expenses: Expense[],
    summary: BudgetSummary,
    metrics: any
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let recId = 1;

    // 1. Réduction des catégories surchargées
    const overloaded = this.getOverloadedCategories(summary);
    overloaded.forEach(cat => {
      const category = EXPENSE_CATEGORIES.find(c => c.value === cat.category);
      const currentPercent = (cat.amount / summary.totalIncome) * 100;
      const targetPercent = this.categoryThresholds[cat.category].max * 100;
      const reductionNeeded = cat.amount - (summary.totalIncome * (targetPercent / 100));

      recommendations.push({
        id: `rec-${recId++}`,
        type: 'reduce',
        category: cat.category,
        title: `Réduire les ${category?.label || cat.category}`,
        description: `Passez de ${currentPercent.toFixed(1)}% à maximum ${targetPercent.toFixed(0)}% de votre revenu.`,
        potentialSavings: Math.round(reductionNeeded),
        priority: 'high'
      });
    });

    // 2. Créer un fonds d'urgence si pas d'épargne
    if (metrics.savingsRate === 0) {
      // Fond d'urgence de 20% du salaire
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'suggestion',
        category: 'savings',
        title: 'Créer un fonds d\'urgence',
        description: 'Prévoyez au moins 3 mois de salaire en cas de coup dur (perte d\'emploi, imprévu).',
        potentialSavings: 0,
        priority: 'high'
      });
    }

    // 3. Optimiser les dépenses de loisirs si nécessaire
    const leisure = expenses.filter(e => e.category === 'leisure');
    const leisureAmount = leisure.reduce((sum, e) => sum + e.monthlyEquivalent, 0);
    const leisurePercent = (leisureAmount / summary.totalIncome) * 100;
    
    if (summary.remainingBudget < 0 && leisurePercent > 5) {
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'eliminate',
        category: 'leisure',
        title: 'Réduire les loisirs temporairement',
        description: `Vous dépensez ${leisureAmount.toFixed(0)}€/mois en loisirs alors que votre budget est déficitaire.`,
        potentialSavings: Math.round(leisureAmount * 0.5),
        priority: 'high'
      });
    }

    // 4. Épargne automatique
    if (metrics.savingsRate < 10) {
      const suggestedSavings = summary.totalIncome * 0.10;
      const suggestions = this.getSavingsSuggestions(expenses, suggestedSavings);
      
      if (suggestions.length > 0) {
        recommendations.push({
          id: `rec-${recId++}`,
          type: 'optimize',
          category: 'savings',
          title: 'Automatiser l\'épargne',
          description: `Mettez en place un virement automatique de ${suggestedSavings.toFixed(0)}€ dès réception du salaire.`,
          potentialSavings: 0,
          priority: 'medium'
        });
      }
    }

    // 5. Auditer les abonnements
    const subscriptions = expenses.filter(e => 
      e.frequency === 'monthly' && 
      e.name.toLowerCase().match(/netflix|spotify|amazon|disney|canal|abonnement/)
    );
    
    if (subscriptions.length > 0) {
      const totalSub = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'optimize',
        category: 'leisure',
        title: 'Auditer les abonnements',
        description: 'Faites le point : utilisez-vous tous vos abonnements mensuels ?',
        potentialSavings: Math.round(totalSub * 0.3), // Estimation 30% d'économies
        priority: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Génère des scénarios budgétaires
   */
  private generateScenarios(
    userData: UserFinancialData,
    expenses: Expense[],
    summary: BudgetSummary,
    metrics: any
  ): { worstCase: BudgetScenario; realistic: BudgetScenario; optimized: BudgetScenario } {
    const currentSavings = summary.savingsPotential;
    
    // Scénario pessimiste (perte de 10% de revenus, augmentation 5% dépenses)
    const worstCaseSavings = (summary.totalIncome * 0.9) - (summary.totalExpenses * 1.05);
    
    // Scénario réaliste (maintien actuel avec inflation 2%)
    const realisticSavings = currentSavings * 0.95; // -2% d'inflation
    
    // Scénario optimisé (application des recommandations)
    const recommendations = this.generateRecommendations(userData, expenses, summary, metrics);
    const potentialSavings = recommendations.reduce((sum, r) => sum + (r.potentialSavings || 0), 0);
    const optimizedSavings = currentSavings + potentialSavings;

    return {
      worstCase: {
        name: 'Conservateur',
        description: 'Préparation aux imprévus (-10% revenus, +5% dépenses)',
        monthlySavings: Math.max(0, worstCaseSavings),
        yearlyProjection: Math.max(0, worstCaseSavings) * 12,
        timelineToGoal: worstCaseSavings > 0 ? 'Objectif atteignable avec prudence' : 'Budget à risque'
      },
      realistic: {
        name: 'Réaliste',
        description: 'Projection actuelle avec inflation (2%/an)',
        monthlySavings: realisticSavings,
        yearlyProjection: realisticSavings * 12,
        timelineToGoal: `Épargne annuelle: ${(realisticSavings * 12).toLocaleString('fr-FR')}€`
      },
      optimized: {
        name: 'Optimisé',
        description: 'Après application des recommandations d\'optimisation',
        monthlySavings: optimizedSavings,
        yearlyProjection: optimizedSavings * 12,
        timelineToGoal: `Potentiel d'économies: ${potentialSavings.toLocaleString('fr-FR')}€/mois`
      }
    };
  }

  /**
   * Récupère les catégories qui dépassent les seuils recommandés
   */
  private getOverloadedCategories(summary: BudgetSummary): { category: ExpenseCategory; amount: number; overBudget: number }[] {
    const overloaded: { category: ExpenseCategory; amount: number; overBudget: number }[] = [];
    
    (Object.keys(summary.expenseBreakdown) as ExpenseCategory[]).forEach(category => {
      const amount = summary.expenseBreakdown[category];
      const percentOfIncome = amount / summary.totalIncome;
      const threshold = this.categoryThresholds[category].max;
      
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

  /**
   * Suggère où trouver l'argent pour épargner
   */
  private getSavingsSuggestions(expenses: Expense[], _targetAmount: number): { category: string; suggestion: string; potential: number }[] {
    const suggestions: { category: string; suggestion: string; potential: number }[] = [];
    
    // Analyser chaque catégorie pour des opportunités
    expenses.forEach(expense => {
      if (expense.category === 'leisure') {
        suggestions.push({
          category: 'Loisirs',
          suggestion: `Réduire "${expense.name}" de 20%`,
          potential: expense.monthlyEquivalent * 0.2
        });
      }
      if (expense.category === 'food') {
        suggestions.push({
          category: 'Alimentation',
          suggestion: 'Cuisiner plus maison',
          potential: expense.monthlyEquivalent * 0.15
        });
      }
    });
    
    return suggestions.sort((a, b) => b.potential - a.potential).slice(0, 3);
  }

  /**
   * Génère un message personnalisé basé sur la situation
   */
  getPersonalizedMessage(userData: UserFinancialData, summary: BudgetSummary): string {
    if (summary.remainingBudget < 0) {
      return "Votre budget est en déficit. Il est urgent de réduire vos dépenses ou d'augmenter vos revenus.";
    }
    
    if (summary.remainingBudget < summary.totalIncome * 0.10) {
      return "Vous vivez au jour le jour. Essayez de créer un coussin d'épargne pour les imprévus.";
    }
    
    if (summary.remainingBudget >= summary.totalIncome * 0.20) {
      return "Excellent ! Vous avez une belle marge de manoeuvre pour épargner et investir.";
    }
    
    if (summary.remainingBudget >= summary.totalIncome * 0.10) {
      return "Votre budget est équilibré. Pensez à augmenter votre épargne progressivement.";
    }
    
    return "Continuez à surveiller vos dépenses pour maintenir cet équilibre.";
  }
}
