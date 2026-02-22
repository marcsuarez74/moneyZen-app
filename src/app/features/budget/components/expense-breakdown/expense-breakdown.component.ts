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
}

/**
 * DUMB COMPONENT - Répartition des dépenses par catégorie
 */
@Component({
  selector: 'app-expense-breakdown',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, CurrencyPipe],
  template: `
    <mat-card class="breakdown-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>pie_chart</mat-icon>
        <mat-card-title>Répartition par catégorie</mat-card-title>
        <mat-card-subtitle>{{ totalExpenses() | currency:'EUR' }} de dépenses</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="breakdown-list">
          @for (item of breakdownItems(); track item.name) {
            <div class="breakdown-item">
              <div class="item-header">
                <div class="item-info">
                  <mat-icon [class.over-budget]="isOverBudget(item)">{{ item.icon }}</mat-icon>
                  <div class="item-details">
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-amount">{{ item.amount | currency:'EUR' }}</span>
                  </div>
                </div>
                <span class="item-percent" [class.over-budget]="isOverBudget(item)">
                  {{ item.percent }}%
                </span>
              </div>
              <div class="item-bar">
                <div class="progress-container" [class.over-budget]="isOverBudget(item)">
                  <div class="progress-fill" [style.width.%]="getProgressWidth(item)"></div>
                </div>
              </div>
            </div>
          }
        </div>
        
        @if (hasUncategorizedExpenses()) {
          <div class="uncategorized-warning">
            <mat-icon>warning</mat-icon>
            <span>Certaines dépenses n'ont pas de catégorie définie</span>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .breakdown-card {
      height: 100%;
      
      mat-card-content {
        padding: 16px;
      }
    }
    
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .breakdown-item {
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          
          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            color: var(--text-secondary);
            
            &.over-budget {
              color: #f44336;
            }
          }
          
          .item-details {
            display: flex;
            flex-direction: column;
            
            .item-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--text-primary);
            }
            
            .item-amount {
              font-size: 12px;
              color: var(--text-secondary);
            }
          }
        }
        
        .item-percent {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          
          &.over-budget {
            color: #f44336;
          }
        }
      }
      
      .item-bar {
        .progress-container {
          height: 8px;
          background: var(--surface-variant);
          border-radius: 4px;
          overflow: hidden;
          
          .progress-fill {
            height: 100%;
            background: var(--primary-color);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          &.over-budget .progress-fill {
            background: #f44336;
          }
        }
      }
    }
    
    .uncategorized-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 8px;
      color: #ff9800;
      font-size: 13px;
      
      mat-icon {
        font-size: 20px;
      }
    }
  `]
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
          icon: categoryInfo?.icon || 'help'
        };
      })
      .sort((a, b) => b.amount - a.amount);
  };
  
  protected isOverBudget = (item: BreakdownItem): boolean => {
    if (!this.thresholds()) return false;
    
    const category = EXPENSE_CATEGORIES.find(c => c.label === item.name)?.value;
    if (!category) return false;
    
    const threshold = this.thresholds()![category];
    return (item.percent / 100) > threshold.max;
  };
  
  protected getProgressWidth = (item: BreakdownItem): number => {
    // Limiter à 100% pour l'affichage visuel
    return Math.min(item.percent, 100);
  };
  
  protected hasUncategorizedExpenses = (): boolean => {
    return this.expenses().some(e => e.category === 'other');
  };
}
