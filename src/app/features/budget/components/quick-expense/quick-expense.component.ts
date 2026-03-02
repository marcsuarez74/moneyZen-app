/**
 * SMART COMPONENT - Conteneur pour l'ajout rapide de dépenses
 * Utilise ExpenseRecordStore pour la logique métier
 * S'intègre dans le plan de redressement
 */
import { Component, inject, OnInit, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuickExpenseFormComponent } from '../../../../shared/components/quick-expense-form/quick-expense-form.component';
import { ExpenseCategoryChipComponent } from '../../../../shared/components/expense-category-chip/expense-category-chip.component';
import { ExpenseRecordStore } from '../../../../store/expense-record.store';
import {
  ExpenseRecordFormData,
  calculateExpensesByCategory,
} from '../../../../models/expense-record.model';

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
    ExpenseCategoryChipComponent,
  ],
  template: `
    <mat-card class="quick-expense-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>add_circle</mat-icon>
        <mat-card-title>Ajouter une dépense</mat-card-title>
        <mat-card-subtitle> Mise à jour automatique de votre budget </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Budget actuel -->
        <div class="budget-preview">
          <div class="budget-item">
            <span class="budget-label">Budget mensuel restant</span>
            <span class="budget-value" [class.negative]="remainingMonthlyBudget() < 0">
              {{ remainingMonthlyBudget() | currency: 'EUR' : 'symbol' : '1.2-2' }}
            </span>
          </div>
          <div class="budget-item daily-budget">
            <span class="budget-label">
              Budget quotidien réel
              <span
                class="help-icon"
                matTooltip="Votre budget mensuel restant ({{
                  remainingMonthlyBudget() | currency: 'EUR' : 'symbol' : '1.2-2'
                }}) divisé par les jours restants jusqu'à votre prochaine paie ({{
                  daysUntilPayday()
                }} jours)"
                >ⓘ</span
              >
            </span>
            <div class="budget-value-container">
              <span class="budget-value" [class.negative]="adjustedDailyBudget() < 0">
                {{ adjustedDailyBudget() | currency: 'EUR' : 'symbol' : '1.2-2' }}
              </span>
              <span class="budget-sublabel">/jour pendant {{ daysUntilPayday() }} jours</span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="progress-section">
            <div class="progress-label">
              <span>Dépenses ce mois</span>
              <span>{{ expensePercentage() | number: '1.0-0' }}%</span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="expensePercentage()"
              [color]="expensePercentage() > 80 ? 'warn' : 'primary'"
            >
            </mat-progress-bar>
            <div class="progress-details">
              <span>{{ currentMonthTotal() | currency: 'EUR' : 'symbol' : '1.2-2' }} dépensé</span>
              <span>sur {{ monthlyBudget() | currency: 'EUR' : 'symbol' : '1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Formulaire -->
        <app-quick-expense-form (submitExpense)="addExpense($event)"> </app-quick-expense-form>

        <!-- Répartition par catégorie -->
        @if (sortedExpenses().length > 0) {
          <div class="category-breakdown">
            <h4>Répartition ce mois</h4>
            <div class="category-list">
              @for (item of topCategories(); track item.category) {
                <div class="category-row">
                  <app-expense-category-chip [category]="item.category">
                  </app-expense-category-chip>
                  <span class="category-amount">{{
                    item.amount | currency: 'EUR' : 'symbol' : '1.2-2'
                  }}</span>
                  <span class="category-percent">{{ item.percentage | number: '1.0-0' }}%</span>
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
  styles: [
    `
      .quick-expense-card {
        background: var(--fintech-surface, #ffffff);
        border-radius: 16px;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.1),
          0 2px 4px -1px rgba(0, 0, 0, 0.06);
        overflow: hidden;
        border: 1px solid var(--fintech-border, #e0e0e0);
        width: 100%;
        display: block;
        box-sizing: border-box;
      }

      mat-card-header {
        background: var(--gradient-fintech-primary);
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
        background: var(--fintech-surface-variant, #f5f5f5);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
        border: 1px solid var(--fintech-border, #e0e0e0);
      }

      .budget-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid var(--fintech-border);

        &:last-child {
          border-bottom: none;
        }
      }

      .budget-label {
        font-size: 0.9375rem;
        color: var(--fintech-text-secondary, #666666);
      }

      .budget-value {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--fintech-success, #2e7d32);
        font-variant-numeric: tabular-nums;

        &.negative {
          color: var(--fintech-error, #d32f2f);
        }
      }

      .daily-budget {
        .budget-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: var(--fintech-text-primary, #212121);
        }

        .help-icon {
          font-size: 14px;
          color: var(--fintech-primary, #667eea);
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
          color: var(--fintech-text-tertiary, #9e9e9e);
          font-weight: 400;
        }
      }

      .progress-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--fintech-border);
      }

      .progress-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--fintech-text-primary, #212121);
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
        color: var(--fintech-text-secondary, #666666);
      }

      app-quick-expense-form {
        display: block;
        margin-bottom: 24px;
      }

      .category-breakdown {
        h4 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--fintech-text-primary, #212121);
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
          background: var(--fintech-surface, #ffffff);
          border-radius: 8px;
          border: 1px solid var(--fintech-border, #e0e0e0);

          app-expense-category-chip {
            flex-shrink: 0;
          }

          .category-amount {
            flex: 1;
            text-align: right;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
            color: var(--fintech-text-primary, #212121);
          }

          .category-percent {
            width: 50px;
            text-align: right;
            font-size: 0.875rem;
            color: var(--fintech-text-tertiary, #9e9e9e);
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

      // ============================================
      // DARK THEME
      // ============================================
      :host-context(.dark-theme) {
        .quick-expense-card {
          background: linear-gradient(145deg, #1e1e2e 0%, #252538 100%);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.2);
        }

        .budget-preview {
          background: rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .budget-label {
          color: rgba(255, 255, 255, 0.7);
        }

        .daily-budget {
          .budget-label {
            color: rgba(255, 255, 255, 0.85);
          }
        }

        .progress-label {
          color: rgba(255, 255, 255, 0.85);
        }

        .progress-details {
          color: rgba(255, 255, 255, 0.6);
        }

        .category-breakdown {
          h4 {
            color: rgba(255, 255, 255, 0.85);
          }
        }

        .category-row {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);

          .category-amount {
            color: rgba(255, 255, 255, 0.85);
          }

          .category-percent {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }

      // ============================================
      // RESPONSIVE - Tablette (768px - 1024px)
      // ============================================
      @media (max-width: 1024px) {
        mat-card-content {
          padding: 20px;
        }

        mat-card-header {
          padding: 18px;

          mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
          }

          mat-card-title {
            font-size: 1.125rem;
          }
        }

        .budget-preview {
          padding: 14px;
        }

        .budget-value {
          font-size: 1.0625rem;
        }
      }

      // ============================================
      // RESPONSIVE - Mobile (< 768px)
      // ============================================
      @media (max-width: 768px) {
        mat-card-content {
          padding: 16px;
        }

        mat-card-header {
          padding: 16px;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }

          mat-card-title {
            font-size: 1rem;
          }

          mat-card-subtitle {
            font-size: 0.8125rem;
          }
        }

        .budget-preview {
          padding: 12px;
          margin-bottom: 20px;
        }

        .budget-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 10px 0;
        }

        .budget-label {
          font-size: 0.875rem;
        }

        .budget-value {
          font-size: 1.125rem;
        }

        .daily-budget {
          .budget-value-container {
            flex-wrap: wrap;
            gap: 4px;
          }

          .budget-sublabel {
            font-size: 0.8125rem;
            width: 100%;
          }
        }

        .progress-section {
          margin-top: 12px;
          padding-top: 12px;
        }

        .progress-label {
          font-size: 0.875rem;
        }

        .progress-details {
          font-size: 0.8125rem;
          flex-direction: column;
          gap: 2px;
        }

        .category-breakdown {
          h4 {
            font-size: 0.9375rem;
            margin-bottom: 12px;
          }
        }

        .category-row {
          padding: 10px;
          gap: 8px;
          flex-wrap: wrap;

          .category-amount {
            font-size: 0.9375rem;
          }

          .category-percent {
            display: none;
          }
        }

        mat-card-actions {
          padding: 8px 16px 16px;

          button {
            width: 100%;
            justify-content: center;
          }
        }
      }

      // ============================================
      // RESPONSIVE - Petit mobile (< 480px)
      // ============================================
      @media (max-width: 480px) {
        mat-card-content {
          padding: 12px;
        }

        mat-card-header {
          padding: 12px;

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          mat-card-title {
            font-size: 0.9375rem;
          }

          mat-card-subtitle {
            font-size: 0.75rem;
          }
        }

        .budget-preview {
          padding: 10px;
          border-radius: 8px;
        }

        .budget-value {
          font-size: 1rem;
        }

        .daily-budget {
          .budget-sublabel {
            font-size: 0.75rem;
          }
        }

        .category-row {
          padding: 8px;

          .category-amount {
            font-size: 0.875rem;
          }
        }
      }
    `,
  ],
})
export class QuickExpenseComponent implements OnInit {
  private expenseStore = inject(ExpenseRecordStore);

  // Inputs pour le calcul du budget
  monthlyBudget = input<number>(0);
  dailyBudget = input<number>(0);
  paydayDay = input<number>(1);

  // Output events
  viewAllExpensesClicked = output<void>();

  // Données du store
  currentMonthTotal = this.expenseStore.currentMonthTotal;
  sortedExpenses = this.expenseStore.sortedExpenses;

  // Computed values
  remainingMonthlyBudget = () => this.monthlyBudget() - this.currentMonthTotal();
  remainingDailyBudget = () => this.calculateRemainingDaily();
  daysUntilPayday = () => {
    const today = new Date();
    const paydayDay = this.paydayDay();

    // Calculer la prochaine date de paie
    let nextPayday = new Date(today.getFullYear(), today.getMonth(), paydayDay);

    // Si aujourd'hui est le jour de paie ou si elle est passée, prendre celle du mois prochain
    const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentPayday = new Date(today.getFullYear(), today.getMonth(), paydayDay);

    if (todayWithoutTime.getTime() >= currentPayday.getTime()) {
      nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, paydayDay);
    }

    // Nombre de jours jusqu'à la prochaine paie (incluant aujourd'hui)
    const nextPaydayWithoutTime = new Date(
      nextPayday.getFullYear(),
      nextPayday.getMonth(),
      nextPayday.getDate()
    );
    const diffTime = nextPaydayWithoutTime.getTime() - todayWithoutTime.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  adjustedDailyBudget = () => {
    const monthlyRemaining = this.remainingMonthlyBudget();
    const daysRemaining = this.daysUntilPayday();

    if (monthlyRemaining <= 0) return 0;
    return monthlyRemaining / Math.max(1, daysRemaining);
  };
  expensePercentage = () => {
    const budget = this.monthlyBudget();
    if (budget <= 0) return 0;
    return Math.min(100, (this.currentMonthTotal() / budget) * 100);
  };

  // Top catégories par montant (afficher les 6 premières)
  topCategories = () => {
    const byCategory = calculateExpensesByCategory(this.expenseStore.currentMonthExpenses());
    const total = this.currentMonthTotal();

    return Object.entries(byCategory)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category: category as any,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
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
    this.viewAllExpensesClicked.emit();
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
