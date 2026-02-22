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
  template: `
    <div class="stats-container">
      <!-- Info paie prioritaire avec date actuelle -->
      @if (paydayInfo(); as payday) {
        <div class="payday-banner" [class.urgent]="payday.daysUntilPayday <= 3 || payday.monthProgressPercent >= 75">
          <mat-icon>event</mat-icon>
          <div class="payday-content">
            <span class="payday-text">
              {{ payday.daysUntilPayday === 0 ? "C'est aujourd'hui !" : 
                 payday.daysUntilPayday === 1 ? "Demain !" : 
                 payday.daysUntilPayday + ' jours avant la paie' }}
              <span class="month-progress">(mois à {{ payday.monthProgressPercent }}%)</span>
            </span>
            <span class="payday-budget" *ngIf="payday.actualDailyBudget > 0">
              Budget réel: {{ payday.actualDailyBudget | currency:'EUR' }}/jour sur {{ payday.remainingDaysInMonth }} jours restants
            </span>
          </div>
        </div>
      }
      
      <div class="stats-grid">
        <mat-card class="stat-card income">
          <mat-card-content>
            <mat-icon class="stat-icon">trending_up</mat-icon>
            <div class="stat-info">
              <span class="stat-label">Revenus mensuels</span>
              <span class="stat-value">{{ summary().totalIncome | currency:'EUR' }}</span>
              @if (userData()?.paydayDay) {
                <span class="stat-sublabel">Payé le {{ userData()?.paydayDay }} du mois</span>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card expense">
          <mat-card-content>
            <mat-icon class="stat-icon">receipt_long</mat-icon>
            <div class="stat-info">
              <span class="stat-label">Dépenses</span>
              <span class="stat-value">{{ summary().totalExpenses | currency:'EUR' }}</span>
              <span class="stat-sublabel">{{ getExpensePercentOfIncome() }}% du revenu</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card balance" 
                  [class.positive]="summary().remainingBudget > 0"
                  [class.negative]="summary().remainingBudget < 0">
          <mat-card-content>
            <mat-icon class="stat-icon">
              {{ summary().remainingBudget >= 0 ? 'account_balance_wallet' : 'warning' }}
            </mat-icon>
            <div class="stat-info">
              <span class="stat-label">Reste à vivre</span>
              <span class="stat-value">{{ summary().remainingBudget | currency:'EUR' }}</span>
              <span class="stat-sublabel" [class.warning]="summary().remainingBudget < 0">
                {{ getBalanceStatus() }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card savings">
          <mat-card-content>
            <mat-icon class="stat-icon">savings</mat-icon>
            <div class="stat-info">
              <span class="stat-label">Capacité d'épargne</span>
              <span class="stat-value">{{ summary().savingsPotential | currency:'EUR' }}</span>
              @if (analysis()) {
                <span class="stat-sublabel" [class.good]="analysis()!.metrics.savingsRate >= 10">
                  {{ analysis()!.metrics.savingsRate.toFixed(1) }}% du salaire
                </span>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Métriques additionnelles -->
      @if (analysis()) {
        <div class="metrics-bar">
          <div class="metric-item">
            <mat-icon [class]="getHealthColor()">favorite</mat-icon>
            <span>Santé: {{ analysis()!.metrics.budgetHealth }}/100</span>
          </div>
          <div class="metric-item">
            <mat-icon>account_balance</mat-icon>
            <span>Charges fixes: {{ analysis()!.metrics.fixedExpensesRatio.toFixed(0) }}%</span>
          </div>
          <div class="metric-item">
            <mat-icon>shopping_bag</mat-icon>
            <span>Variable: {{ analysis()!.metrics.discretionarySpending.toFixed(0) }}%</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .payday-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 8px;
      
      &.urgent {
        background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      
      .payday-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
        
        .payday-text {
          font-weight: 600;
          font-size: 16px;
          
          .month-progress {
            font-size: 13px;
            opacity: 0.85;
            margin-left: 8px;
            font-weight: 500;
          }
        }
        
        .payday-budget {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      
      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
      }
      
      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    
    .stat-card {
      mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
      }
      
      .stat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }
      
      &.income .stat-icon { color: #4caf50; }
      &.expense .stat-icon { color: #ff9800; }
      &.balance.positive .stat-icon { color: #2196f3; }
      &.balance.negative .stat-icon { color: #f44336; }
      &.savings .stat-icon { color: #9c27b0; }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .stat-label {
        font-size: 13px;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 4px 0;
      }
      
      .stat-sublabel {
        font-size: 12px;
        color: var(--text-secondary);
        
        &.warning { color: #f44336; font-weight: 500; }
        &.good { color: #4caf50; font-weight: 500; }
      }
    }
    
    .metrics-bar {
      display: flex;
      gap: 24px;
      padding: 12px 16px;
      background: var(--surface);
      border-radius: 8px;
      flex-wrap: wrap;
      
      .metric-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--text-secondary);
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          
          &.healthy { color: #4caf50; }
          &.warning { color: #ff9800; }
          &.critical { color: #f44336; }
        }
      }
    }
  `]
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
