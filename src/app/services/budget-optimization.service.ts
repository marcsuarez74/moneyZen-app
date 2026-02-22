import { Injectable } from '@angular/core';
import { Expense, ExpenseCategory, BudgetOptimization, Recommendation, EXPENSE_CATEGORIES } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetOptimizationService {
  
  optimizeBudget(salary: number, expenses: Expense[]): BudgetOptimization {
    const recommendations: Recommendation[] = [];
    const optimizedBudget: { category: ExpenseCategory; currentAmount: number; recommendedAmount: number; rationale: string }[] = [];
    
    // Calculate current breakdown
    const currentBreakdown = this.calculateBreakdown(expenses);
    const totalExpenses = Object.values(currentBreakdown).reduce((a, b) => a + b, 0);
    const remaining = salary - totalExpenses;
    
    // Règles de catégories - groupées par type
    const categoryRules: Partial<Record<ExpenseCategory, { maxPercent: number; message: string; priority: Recommendation['priority'] }>> = {
      // Logement - priorité élevée si > 35%
      housing: { maxPercent: 0.30, message: 'Le loyer/devrait être inférieur à 30% du revenu', priority: 'high' },
      mortgage: { maxPercent: 0.30, message: 'Le crédit immobilier devrait être inférieur à 30% du revenu', priority: 'high' },
      condoFees: { maxPercent: 0.08, message: 'Les charges de copropriété sont élevées', priority: 'medium' },
      
      // Transport - priorité élevée si > 15%
      transport: { maxPercent: 0.15, message: 'Le transport devrait être inférieur à 15% du revenu', priority: 'medium' },
      carLoan: { maxPercent: 0.10, message: 'Le crédit voiture ne devrait pas excéder 10% du revenu', priority: 'high' },
      fuel: { maxPercent: 0.08, message: 'Budget carburant élevé', priority: 'medium' },
      
      // Alimentation
      food: { maxPercent: 0.15, message: 'Budget alimentation raisonnable: 10-15%', priority: 'medium' },
      restaurants: { maxPercent: 0.08, message: 'Réduire les restaurants et privilégier les repas maison', priority: 'low' },
      
      // Services
      utilities: { maxPercent: 0.08, message: 'Budget services à surveiller', priority: 'low' },
      streaming: { maxPercent: 0.02, message: 'Trop d\'abonnements streaming ?', priority: 'low' },
      
      // Loisirs
      leisure: { maxPercent: 0.10, message: 'Loisirs: maximum 10% recommandé', priority: 'low' },
      travel: { maxPercent: 0.08, message: 'Budget voyages important', priority: 'low' },
      
      // Crédits - priorité élevée
      consumerLoan: { maxPercent: 0.10, message: 'Crédit consommation élevé - risque d\'endettement', priority: 'high' },
      debtRepayment: { maxPercent: 0.10, message: 'Remboursement dettes prioritaire', priority: 'high' }
    };
    
    Object.entries(currentBreakdown).forEach(([category, amount]) => {
      const percentOfIncome = amount / salary;
      const rule = categoryRules[category as ExpenseCategory];
      
      let recommendedAmount = amount;
      let rationale = 'Budget dans les normes';
      
      if (rule && percentOfIncome > rule.maxPercent) {
        recommendedAmount = salary * rule.maxPercent;
        rationale = rule.message;
        
        // Calculer la priorité basée sur le dépassement
        const overflowRatio = percentOfIncome / rule.maxPercent;
        let priority: Recommendation['priority'] = rule.priority;
        if (overflowRatio > 1.5) priority = 'high';
        
        recommendations.push({
          id: `rec-${category}`,
          type: this.determineRecommendationType(category as ExpenseCategory, percentOfIncome),
          category: category as ExpenseCategory,
          title: `Optimiser ${this.getCategoryLabel(category as ExpenseCategory)}`,
          description: `Vous dépensez ${(percentOfIncome * 100).toFixed(1)}% de vos revenus en ${this.getCategoryLabel(category as ExpenseCategory)}. ${rule.message}`,
          potentialSavings: Math.round(amount - recommendedAmount),
          priority
        });
      }
      
      optimizedBudget.push({
        category: category as ExpenseCategory,
        currentAmount: amount,
        recommendedAmount,
        rationale
      });
    });
    
    // Alertes spécifiques pour les déficits
    if (remaining < 0) {
      const deficitAmount = Math.abs(remaining);
      recommendations.unshift({
        id: 'rec-deficit',
        type: 'suggestion',
        category: 'other',
        title: 'URGENT: Budget en déficit',
        description: `Vos dépenses dépassent vos revenus de ${deficitAmount.toFixed(0)}€/mois. Vous devez agir immédiatement pour éviter l'endettement.`,
        potentialSavings: Math.round(deficitAmount),
        priority: 'high'
      });
      
      // Ajouter suggestion de crédits à réduire
      const creditCategories: ExpenseCategory[] = ['consumerLoan', 'carLoan', 'leisure', 'streaming', 'restaurants'];
      creditCategories.forEach(cat => {
        const catAmount = currentBreakdown[cat];
        if (catAmount && catAmount > 0) {
          recommendations.push({
            id: `rec-reduce-${cat}`,
            type: 'eliminate',
            category: cat,
            title: `Réduire/réduire ${this.getCategoryLabel(cat)}`,
            description: `En situation de déficit, ces dépenses doivent être minimisées ou supprimées.`,
            potentialSavings: Math.round(catAmount * 0.5),
            priority: 'high'
          });
        }
      });
    }
    
    // Alerte épargne
    const totalSavings = (currentBreakdown['savings'] || 0) + 
                        (currentBreakdown['investments'] || 0) + 
                        (currentBreakdown['retirement'] || 0);
    
    if (totalSavings < salary * 0.10) {
      const recommendedSavings = salary * 0.10;
      recommendations.push({
        id: 'rec-savings',
        type: 'suggestion',
        category: 'savings',
        title: 'Constituer une épargne',
        description: 'Il est fortement recommandé d\'épargner au moins 10% de vos revenus pour votre sécurité financière.',
        potentialSavings: 0,
        priority: remaining < 0 ? 'low' : 'medium'
      });
      
      optimizedBudget.push({
        category: 'savings',
        currentAmount: totalSavings,
        recommendedAmount: recommendedSavings,
        rationale: 'Épargne minimum recommandée: 10% du revenu'
      });
    }
    
    // Alerte abonnements
    const subscriptionCategories: ExpenseCategory[] = ['streaming', 'tvStreaming', 'gym'];
    const subscriptionTotal = subscriptionCategories.reduce((sum, cat) => 
      sum + (currentBreakdown[cat] || 0), 0);
    
    if (subscriptionTotal > salary * 0.05) {
      recommendations.push({
        id: 'rec-subscriptions',
        type: 'optimize',
        category: 'streaming',
        title: 'Auditer vos abonnements',
        description: `Vous dépensez ${(subscriptionTotal).toFixed(0)}€/mois en abonnements. Faites le point sur ceux que vous utilisez vraiment.`,
        potentialSavings: Math.round(subscriptionTotal * 0.3),
        priority: 'low'
      });
    }
    
    // Sort recommendations by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.potentialSavings - a.potentialSavings;
    });
    
    const projectedSavings = recommendations.reduce((sum, r) => sum + (r.potentialSavings || 0), 0);
    
    return {
      recommendations,
      optimizedBudget,
      projectedSavings
    };
  }
  
  private calculateBreakdown(expenses: Expense[]): Partial<Record<ExpenseCategory, number>> {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.monthlyEquivalent;
      return acc;
    }, {} as Partial<Record<ExpenseCategory, number>>);
  }
  
  /**
   * Obtient le libellé d'une catégorie
   */
  getCategoryLabel(category: ExpenseCategory): string {
    const catInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
    return catInfo?.label || category;
  }
  
  /**
   * Obtient l'icône d'une catégorie
   */
  getCategoryIcon(category: ExpenseCategory): string {
    const catInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
    return catInfo?.icon || 'help';
  }
  
  private determineRecommendationType(category: ExpenseCategory, percentOfIncome: number): Recommendation['type'] {
    // Catégories discrétionnaires qui peuvent être éliminées
    const canEliminate: ExpenseCategory[] = ['leisure', 'streaming', 'restaurants', 'hobbies', 'travel'];
    
    if (percentOfIncome > 0.5) return 'eliminate';
    if (percentOfIncome > 0.3) return 'reduce';
    if (canEliminate.includes(category)) return 'optimize';
    return 'reduce';
  }
  
  /**
   * Calcule le plan de remboursement pour un solde négatif
   */
  calculateDebtRecoveryPlan(
    negativeBalance: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    availableForRecovery: number
  ): {
    monthsToZero: number;
    monthlyPayment: number;
    remainingAfterPayment: number;
    isRealistic: boolean;
    suggestions: string[];
  } {
    const monthlyPayment = Math.min(availableForRecovery * 0.8, Math.abs(negativeBalance) / 12);
    const monthsToZero = Math.ceil(Math.abs(negativeBalance) / monthlyPayment);
    const remainingAfterPayment = availableForRecovery - monthlyPayment;
    const isRealistic = remainingAfterPayment > monthlyIncome * 0.05; // Au moins 5% du salaire restant
    
    const suggestions: string[] = [];
    
    if (!isRealistic) {
      suggestions.push('Le remboursement risque d\'être difficile. Envisagez de réduire davantage vos dépenses.');
      suggestions.push('Contactez votre banque pour discuter d\'un découvert autorisé ou d\'un prêt.');
    }
    
    if (monthsToZero > 6) {
      suggestions.push('Le remboursement prendra plus de 6 mois. Privilégiez les dépenses essentielles.');
    }
    
    if (remainingAfterPayment < 100) {
      suggestions.push('Votre marge de manoeuvre sera très faible. Prévoyez un fonds d\'urgence.');
    }
    
    return {
      monthsToZero,
      monthlyPayment,
      remainingAfterPayment,
      isRealistic,
      suggestions
    };
  }
}
