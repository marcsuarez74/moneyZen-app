import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BudgetSummary, ExpenseCategory, Expense, EXPENSE_CATEGORIES } from '../../../../models/budget.model';

interface BreakdownItem {
  name: string;
  amount: number;
  percent: number;
  icon: string;
  category: ExpenseCategory;
}

// Couleurs modernes pour les catégories
const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  housing: { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%)', text: '#880e4f', bar: '#ff9a9e' },
  mortgage: { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', text: '#4a148c', bar: '#a18cd1' },
  utilities: { bg: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', text: '#00695c', bar: '#84fab0' },
  internet: { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', text: '#1565c0', bar: '#a1c4fd' },
  phone: { bg: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', text: '#6a1b9a', bar: '#fbc2eb' },
  carLoan: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#fff', bar: '#667eea' },
  insurance: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#fff', bar: '#f093fb' },
  food: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#01579b', bar: '#4facfe' },
  restaurants: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#00695c', bar: '#43e97b' },
  transport: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#880e4f', bar: '#fa709a' },
  fuel: { bg: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)', text: '#6a1b9a', bar: '#feca57' },
  healthcare: { bg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', text: '#b71c1c', bar: '#ff6b6b' },
  gym: { bg: 'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)', text: '#fff', bar: '#5f27cd' },
  clothing: { bg: 'linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%)', text: '#01579b', bar: '#00d2d3' },
  streaming: { bg: 'linear-gradient(135deg, #ff9f43 0%, #ee5a6f 100%)', text: '#fff', bar: '#ff9f43' },
  shopping: { bg: 'linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%)', text: '#00695c', bar: '#10ac84' },
  other: { bg: 'linear-gradient(135deg, #c8c8c8 0%, #e8e8e8 100%)', text: '#424242', bar: '#c8c8c8' }
};

/**
 * DUMB COMPONENT - Répartition des dépenses par catégorie (Design Moderne Fintech)
 */
@Component({
  selector: 'app-expense-breakdown',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, CurrencyPipe],
  templateUrl: './expense-breakdown.component.html',
  styleUrls: ['./expense-breakdown.component.scss']
})
export class ExpenseBreakdownComponent {
  readonly summary = input.required<BudgetSummary>();
  readonly expenses = input.required<Expense[]>();
  readonly thresholds = input<Record<ExpenseCategory, { min: number; max: number }>>();
  
  protected totalExpenses = () => this.summary().totalExpenses;
  
  protected breakdownItems = (): BreakdownItem[] => {
    const breakdown = this.summary().expenseBreakdown;
    const totalIncome = this.summary().totalIncome;
    
    return Object.entries(breakdown)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => {
        const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === category);
        const percentOfIncome = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
        
        return {
          name: categoryInfo?.label || category,
          amount,
          percent: percentOfIncome,
          icon: categoryInfo?.icon || 'help',
          category: category as ExpenseCategory
        };
      })
      .sort((a, b) => b.amount - a.amount);
  };
  
  protected isOverBudget = (item: BreakdownItem): boolean => {
    if (!this.thresholds()) return false;
    
    const threshold = this.thresholds()![item.category];
    return (item.percent / 100) > threshold.max;
  };
  
  protected getProgressWidth = (item: BreakdownItem): number => {
    return Math.min(item.percent, 100);
  };
  
  protected getCategoryStyle = (category: ExpenseCategory) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['other'];  // Fixed: using bracket notation
  };
  
  protected hasUncategorizedExpenses = (): boolean => {
    return this.expenses().some(e => e.category === 'other');
  };
}