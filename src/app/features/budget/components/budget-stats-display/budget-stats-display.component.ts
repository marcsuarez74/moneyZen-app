import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { BudgetSummary, UserFinancialData } from '../../../../models/budget.model';
import { BudgetAnalysis } from '../../../../services/budget-advisor.service';
import { PaydayInfo } from '../../../../services/payday-calculator.service';

@Component({
  selector: 'app-budget-stats-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDividerModule, CurrencyPipe],
  templateUrl: './budget-stats-display.component.html',
  styleUrls: ['./budget-stats-display.component.scss']
})
export class BudgetStatsDisplayComponent {
  readonly summary = input.required<BudgetSummary>();
  readonly userData = input<UserFinancialData | null>();
  readonly analysis = input<BudgetAnalysis | null>();
  readonly paydayInfo = input<PaydayInfo | null>();

  formatBalance(balance: number): string {
    return Math.abs(balance).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  getExpensePercentOfIncome(): string {
    const percent = (this.summary().totalExpenses / this.summary().totalIncome) * 100;
    return percent.toFixed(0);
  }

  getBalanceStatus(): string {
    const remaining = this.summary().remainingBudget;
    const income = this.summary().totalIncome;
    const percent = (remaining / income) * 100;

    if (remaining < 0) return 'Déficit';
    if (percent < 10) return 'Serré';
    if (percent < 20) return 'Correct';
    return 'Confortable';
  }

  getHealthColor(): string {
    const health = this.analysis()?.metrics.budgetHealth || 50;
    if (health >= 70) return 'healthy';
    if (health >= 50) return 'warning';
    return 'critical';
  }

  getHealthIcon(): string {
    const health = this.analysis()?.metrics.budgetHealth || 50;
    if (health >= 70) return 'sentiment_satisfied';
    if (health >= 50) return 'sentiment_neutral';
    return 'sentiment_dissatisfied';
  }
}
