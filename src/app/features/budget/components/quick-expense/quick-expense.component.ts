/**
 * SMART COMPONENT - Conteneur pour l'ajout rapide de dépenses
 * Utilise ExpenseRecordStore pour la logique métier
 * S'intègre dans le plan de redressement
 */
import { Component, inject, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuickExpenseFormComponent } from '../../../../shared/components/quick-expense-form/quick-expense-form.component';
import { ExpenseCategoryChipComponent } from '../../../../shared/components/expense-category-chip/expense-category-chip.component';
import { ExpenseRecordStore } from '../../../../store/expense-record.store';
import { ExpenseRecordFormData, calculateExpensesByCategory } from '../../../../models/expense-record.model';

@Component({
  selector: 'app-quick-expense',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    QuickExpenseFormComponent,
    ExpenseCategoryChipComponent
  ],
  template: `
    <mat-card class="quick-expense-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>add_circle</mat-icon>
        <mat-card-title>Ajouter une dépense</mat-card-title>
        <mat-card-subtitle>
          Mise à jour automatique de votre budget
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Budget actuel -->
        <div class="budget-preview">
          <div class="budget-item">
            <span class="budget-label">Budget mensuel restant</span>
            <span class="budget-value" [class.negative]="remainingMonthlyBudget() < 0">
              {{ remainingMonthlyBudget() | currency:'EUR':'symbol':'1.2-2' }}
            </span>
          </div>
          <div class="budget-item daily-budget">
            <span class="budget-label">
              Budget quotidien réel
              <span class="help-icon" matTooltip="Calculé à partir de votre budget mensuel restant divisé par les jours restants dans le mois">ⓘ</span>
            </span>
            <div class="budget-value-container">
              <span class="budget-value" [class.negative]="adjustedDailyBudget() < 0">
                {{ adjustedDailyBudget() | currency:'EUR':'symbol':'1.2-2' }}
              </span>
              <span class="budget-sublabel">/jour</span>
            </div>
          </div>
          
          <!-- Barre de progression -->
          <div class="progress-section">
            <div class="progress-label">
              <span>Dépenses ce mois</span>
              <span>{{ expensePercentage() | number:'1.0-0' }}%</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="expensePercentage()"
              [color]="expensePercentage() > 80 ? 'warn' : 'primary'">
            </mat-progress-bar>
            <div class="progress-details">
              <span>{{ currentMonthTotal() | currency:'EUR':'symbol':'1.2-2' }} dépensé</span>
              <span>sur {{ monthlyBudget() | currency:'EUR':'symbol':'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <app-quick-expense-form (submitExpense)="addExpense($event)">
        </app-quick-expense-form>

        <!-- Répartition par catégorie -->
        @if (sortedExpenses().length > 0) {
          <div class="category-breakdown">
            <h4>Répartition ce mois</h4>
            <div class="category-list">
              @for (item of topCategories(); track item.category) {
                <div class="category-row">
                  <app-expense-category-chip [category]="item.category">
                  </app-expense-category-chip>
                  <span class="category-amount">{{ item.amount | currency:'EUR':'symbol':'1.2-2' }}</span>
                  <span class="category-percent">{{ item.percentage | number:'1.0-0' }}%</span>
                </div>
              }
            </div>
          </div>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        <button mat-button (click)="viewAllExpenses()">
          Voir toutes les dépenses
          <mat-icon>arrow_forward</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .quick-expense-card {
      background: var(--surface-color, #ffffff);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    mat-card-header {
      background: linear-gradient(135deg, var(--primary-color, #1976d2) 0%, var(--primary-dark, #1565c0) 100%);
      color: white;
      padding: 20px;

      mat-icon {
        color: white;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      mat-card-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0;
      }

      mat-card-subtitle {
        color: rgba(255, 255, 255, 0.9);
        margin: 4px 0 0 0;
      }
    }

    mat-card-content {
      padding: 24px;
    }

    .budget-preview {
      background: var(--surface-variant, #f5f5f5);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .budget-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color, #e0e0e0);

      &:last-child {
        border-bottom: none;
      }
    }

    .budget-label {
      font-size: 0.9375rem;
      color: var(--text-secondary, #666);
    }

    .budget-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--success-color, #2e7d32);
      font-variant-numeric: tabular-nums;

      &.negative {
        color: #d32f2f;
      }
    }

    .daily-budget {
      .budget-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .help-icon {
        font-size: 14px;
        color: var(--primary-color, #1976d2);
        cursor: help;
        opacity: 0.7;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }

      .budget-value-container {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }

      .budget-sublabel {
        font-size: 0.875rem;
        color: var(--text-secondary, #757575);
        font-weight: 400;
      }
    }

    .progress-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--text-primary, #212121);
    }

    mat-progress-bar {
      height: 8px;
      border-radius: 4px;
    }

    .progress-details {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 0.875rem;
      color: var(--text-secondary, #757575);
    }

    app-quick-expense-form {
      display: block;
      margin-bottom: 24px;
    }

    .category-breakdown {
      h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary, #212121);
        margin: 0 0 16px 0;
      }

      .category-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .category-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 12px;
        background: var(--surface-color, #ffffff);
        border-radius: 8px;
        border: 1px solid var(--border-color, #e0e0e0);

        app-expense-category-chip {
          flex-shrink: 0;
        }

        .category-amount {
          flex: 1;
          text-align: right;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .category-percent {
          width: 50px;
          text-align: right;
          font-size: 0.875rem;
          color: var(--text-secondary, #757575);
        }
      }
    }

    mat-card-actions {
      padding: 8px 24px 24px;

      button {
        mat-icon {
          margin-left: 4px;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    @media (max-width: 600px) {
      mat-card-content {
        padding: 16px;
      }

      mat-card-header {
        padding: 16px;
      }

      .budget-preview {
        padding: 12px;
      }

      .budget-value {
        font-size: 1rem;
      }

      .category-row {
        .category-percent {
          display: none;
        }
      }
    }
  `]
})
export class QuickExpenseComponent implements OnInit {
  private expenseStore = inject(ExpenseRecordStore);

  // Inputs pour le calcul du budget
  monthlyBudget = input<number>(0);
  dailyBudget = input<number>(0);

  // Données du store
  currentMonthTotal = this.expenseStore.currentMonthTotal;
  sortedExpenses = this.expenseStore.sortedExpenses;

  // Computed values
  remainingMonthlyBudget = () => this.monthlyBudget() - this.currentMonthTotal();
  remainingDailyBudget = () => this.calculateRemainingDaily();
  adjustedDailyBudget = () => {
    const monthlyRemaining = this.remainingMonthlyBudget();
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();
    const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);
    
    if (monthlyRemaining <= 0) return 0;
    return monthlyRemaining / daysRemaining;
  };
  expensePercentage = () => {
    const budget = this.monthlyBudget();
    if (budget <= 0) return 0;
    return Math.min(100, (this.currentMonthTotal() / budget) * 100);
  };

  // Top 3 catégories par montant
  topCategories = () => {
    const byCategory = calculateExpensesByCategory(this.expenseStore.currentMonthExpenses());
    const total = this.currentMonthTotal();
    
    return Object.entries(byCategory)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  };

  ngOnInit(): void {
    // Charger les dépenses depuis le localStorage
    this.expenseStore.loadExpenses();
  }

  addExpense(formData: ExpenseRecordFormData): void {
    this.expenseStore.addExpense(formData);
    this.expenseStore.saveExpenses();
  }

  viewAllExpenses(): void {
    // Émettre un événement ou naviguer vers la page des dépenses
    // Pour l'instant, on peut utiliser un router ou un event
  }

  private calculateRemainingDaily(): number {
    const monthlyRemaining = this.remainingMonthlyBudget();
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();
    
    // Jours restants dans le mois (incluant aujourd'hui)
    const daysRemaining = Math.max(1, lastDayOfMonth - currentDay + 1);
    
    // Si on est déjà à découvert, retourner 0
    if (monthlyRemaining <= 0) {
      return 0;
    }
    
    // Budget quotidien = budget restant / jours restants
    return Math.max(0, monthlyRemaining / daysRemaining);
  }
}
