import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BudgetSummary, UserFinancialData } from '../../../../models/budget.model';
import { BudgetAnalysis } from '../../../../services/budget-advisor.service';
import { PaydayInfo } from '../../../../services/payday-calculator.service';

@Component({
  selector: 'app-budget-stats-display',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, CurrencyPipe],
  templateUrl: './budget-stats-display.component.html',
  styleUrls: ['./budget-stats-display.component.scss']
})
export class BudgetStatsDisplayComponent {
  readonly summary = input.required<BudgetSummary>();
  readonly userData = input<UserFinancialData | null>();
  readonly analysis = input<BudgetAnalysis | null>();
  readonly paydayInfo = input<PaydayInfo | null>();

  getExpensePercentOfIncome(): string {
    const percent = (this.summary().totalExpenses / this.summary().totalIncome) * 100;
    return percent.toFixed(1);
  }

  getBalanceStatus(): string {
    const remaining = this.summary().remainingBudget;
    const income = this.summary().totalIncome;
    const percent = (remaining / income) * 100;

    if (remaining < 0) return `Déficit de ${Math.abs(remaining).toFixed(0)}€`;
    if (percent < 10) return 'Budget serré';
    if (percent < 20) return 'Budget correct';
    return 'Budget confortable';
  }

  getHealthColor(): string {
    const health = this.analysis()?.metrics.budgetHealth || 50;
    if (health >= 80) return 'healthy';
    if (health >= 60) return 'warning';
    return 'critical';
  }
}
