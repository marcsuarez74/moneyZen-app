/**
 * SMART COMPONENT - Liste des dépenses récentes avec CRUD
 * Utilise ExpenseRecordStore pour la logique métier
 * Affiche les dépenses du mois avec actions éditer/supprimer
 */
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { ExpenseListItemComponent } from '../../../../shared/components/expense-list-item/expense-list-item.component';
import { ExpenseCategoryChipComponent } from '../../../../shared/components/expense-category-chip/expense-category-chip.component';
import { ExpenseRecordStore } from '../../../../store/expense-record.store';
import { ExpenseRecord, ExpenseCategory, ExpenseRecordFormData } from '../../../../models/expense-record.model';
import { EXPENSE_CATEGORIES } from '../../../../models/budget.model';

@Component({
  selector: 'app-recent-expenses',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ExpenseListItemComponent,
    ExpenseCategoryChipComponent
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <mat-card class="recent-expenses-card">
      <mat-card-header>
        <div class="header-icon-wrapper" mat-card-avatar>
          <mat-icon>receipt_long</mat-icon>
        </div>
        <mat-card-title>Mes dépenses</mat-card-title>
        <mat-card-subtitle>
          {{ filteredExpenses().length }} dépense{{ filteredExpenses().length > 1 ? 's' : '' }}
          • Total: {{ currentTotal() | currency:'EUR':'symbol':'1.2-2' }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Filtres par période -->
        <mat-tab-group 
          [selectedIndex]="selectedPeriod()"
          (selectedIndexChange)="selectedPeriod.set($event)"
          class="period-tabs">
          <mat-tab label="Ce mois"></mat-tab>
          <mat-tab label="7 derniers jours"></mat-tab>
          <mat-tab label="30 derniers jours"></mat-tab>
          <mat-tab label="Tout"></mat-tab>
        </mat-tab-group>

        <!-- Liste des dépenses -->
        <div class="expenses-list">
          @if (filteredExpenses().length === 0) {
            <div class="empty-state">
              <mat-icon>inbox</mat-icon>
              <p>Aucune dépense pour cette période</p>
              <button mat-stroked-button (click)="scrollToQuickAdd()">
                <mat-icon>add</mat-icon>
                Ajouter une dépense
              </button>
            </div>
          } @else {
            @for (expense of filteredExpenses(); track expense.id) {
              <app-expense-list-item
                [expense]="expense"
                [isEditing]="editingId() === expense.id"
                (edit)="startEdit($event)"
                (delete)="confirmDelete($event)">
              </app-expense-list-item>
            }
          }
        </div>

        <!-- Formulaire d'édition -->
        @if (editingId()) {
          <div class="edit-panel">
            <h4>Modifier la dépense</h4>
            <div class="edit-form">
              <mat-form-field appearance="outline">
                <mat-label>Montant</mat-label>
                <input matInput type="number" [(ngModel)]="editAmount" step="0.01" min="0.01">
                <span matSuffix>€</span>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Catégorie</mat-label>
                <mat-select [(ngModel)]="editCategory">
                  @for (cat of categories; track cat) {
                    <mat-option [value]="cat">
                      {{ getCategoryLabel(cat) }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="editDescription">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="editPicker" [(ngModel)]="editDate">
                <mat-datepicker-toggle matSuffix [for]="editPicker"></mat-datepicker-toggle>
                <mat-datepicker #editPicker></mat-datepicker>
              </mat-form-field>
            </div>

            <div class="edit-actions">
              <button mat-button (click)="cancelEdit()">Annuler</button>
              <button mat-raised-button color="primary" (click)="saveEdit()">
                <mat-icon>save</mat-icon>
                Enregistrer
              </button>
            </div>
          </div>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        @if (filteredExpenses().length > 0) {
          <button 
            mat-button 
            color="warn"
            (click)="confirmClearAll()">
            <mat-icon>delete_sweep</mat-icon>
            Tout effacer
          </button>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    // ============================================
    // CARD PRINCIPAL
    // ============================================
    .recent-expenses-card {
      background: var(--fintech-surface, #ffffff);
      border-radius: 24px;
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid var(--fintech-border, #e0e0e0);
      overflow: hidden;
    }

    // ============================================
    // HEADER
    // ============================================
    mat-card-header {
      padding: 24px 24px 16px 24px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.02) 100%);
      border-bottom: 1px solid var(--fintech-border, #e0e0e0);
      display: flex;
      align-items: center;
      gap: 16px;

      ::ng-deep .mat-mdc-card-header-text {
        flex: 1;
      }

      ::ng-deep .mat-mdc-card-avatar {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 !important;
      }
    }

    .header-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 12px;

      mat-icon {
        color: var(--fintech-primary, #667eea);
        font-size: 28px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    mat-card-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--fintech-text-primary, #212121);
      margin: 0 0 4px 0;
    }

    mat-card-subtitle {
      color: var(--fintech-text-secondary, #666666);
      font-size: 0.9375rem;
    }

    mat-card-content {
      padding: 0;
    }

    // ============================================
    // ONGLETS
    // ============================================
    .period-tabs {
      background: var(--fintech-surface-variant, #f5f5f5);
      border-bottom: 1px solid var(--fintech-border, #e0e0e0);

      ::ng-deep {
        .mat-mdc-tab {
          height: 56px;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--fintech-text-secondary, #666666);

          &.mdc-tab--active {
            color: var(--fintech-primary, #667eea);
          }
        }

        .mdc-tab__ripple {
          display: none;
        }
      }
    }

    // ============================================
    // LISTE DES DÉPENSES
    // ============================================
    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 500px;
      overflow-y: auto;
      padding: 20px;
      background: var(--fintech-surface, #ffffff);

      app-expense-list-item {
        display: block;
      }
    }

    // ============================================
    // ÉTAT VIDE
    // ============================================
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      text-align: center;
      color: var(--fintech-text-secondary, #666666);

      mat-icon {
        font-size: 72px;
        width: 72px;
        height: 72px;
        margin-bottom: 20px;
        opacity: 0.3;
        color: var(--fintech-primary, #667eea);
      }

      p {
        font-size: 1.125rem;
        margin-bottom: 24px;
      }

      button {
        border-radius: 12px;
        padding: 12px 24px;
        font-weight: 600;
      }
    }

    // ============================================
    // PANEL D'ÉDITION
    // ============================================
    .edit-panel {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.05) 100%);
      border-top: 3px solid var(--fintech-primary, #667eea);
      padding: 24px;
      margin: 0 20px 20px 20px;
      border-radius: 16px;

      h4 {
        margin: 0 0 20px 0;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--fintech-text-primary, #212121);
      }

      .edit-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 20px;

        mat-form-field {
          width: 100%;
        }
      }

      .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        button {
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 600;
        }
      }
    }

    // ============================================
    // ACTIONS
    // ============================================
    mat-card-actions {
      padding: 16px 24px 24px 24px;
      border-top: 1px solid var(--fintech-border, #e0e0e0);

      button {
        border-radius: 12px;
        font-weight: 600;
      }
    }

    // ============================================
    // DARK THEME
    // ============================================
    :host-context(.dark-theme) {
      .recent-expenses-card {
        background: linear-gradient(145deg, #1e1e2e 0%, #252538 100%);
        border-color: rgba(255, 255, 255, 0.08);
      }

      mat-card-header {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-color: rgba(255, 255, 255, 0.08);

        .header-icon-wrapper {
          background: rgba(102, 126, 234, 0.15);
        }

        mat-card-title {
          color: rgba(255, 255, 255, 0.95);
        }

        mat-card-subtitle {
          color: rgba(255, 255, 255, 0.6);
        }
      }

      .period-tabs {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.08);

        ::ng-deep .mat-mdc-tab {
          color: rgba(255, 255, 255, 0.6);

          &.mdc-tab--active {
            color: #667eea;
          }
        }
      }

      .expenses-list {
        background: transparent;
      }

      .empty-state {
        color: rgba(255, 255, 255, 0.6);
      }

      .edit-panel {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%);

        h4 {
          color: rgba(255, 255, 255, 0.95);
        }
      }

      mat-card-actions {
        border-color: rgba(255, 255, 255, 0.08);
      }
    }

    // ============================================
    // RESPONSIVE
    // ============================================
    @media (max-width: 600px) {
      mat-card-header {
        padding: 20px 20px 12px 20px;

        .header-icon-wrapper {
          width: 42px;
          height: 42px;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }

        mat-card-title {
          font-size: 1.25rem;
        }
      }

      .expenses-list {
        max-height: 400px;
        padding: 16px;
      }

      .edit-panel {
        margin: 0 16px 16px 16px;
        padding: 20px;

        .edit-form {
          grid-template-columns: 1fr;
        }
      }

      mat-card-actions {
        padding: 12px 16px 20px 16px;
      }
    }
  `]
})
export class RecentExpensesComponent implements OnInit {
  private expenseStore = inject(ExpenseRecordStore);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // State
  selectedPeriod = signal(0);
  editingId = signal<string | null>(null);

  // Edit form state
  editAmount = signal<number>(0);
  editCategory = signal<ExpenseCategory>('food');
  editDescription = signal('');
  editDate = signal<Date>(new Date());

  // Toutes les catégories disponibles pour l'édition
  categories: ExpenseCategory[] = EXPENSE_CATEGORIES.map(cat => cat.value);

  // Computed expenses based on selected period
  filteredExpenses = () => {
    switch (this.selectedPeriod()) {
      case 0: // Ce mois
        return this.expenseStore.currentMonthExpenses();
      case 1: // 7 derniers jours
        return this.expenseStore.last7DaysExpenses();
      case 2: // 30 derniers jours
        return this.expenseStore.last30DaysExpenses();
      case 3: // Tout
        return this.expenseStore.sortedExpenses();
      default:
        return this.expenseStore.currentMonthExpenses();
    }
  };

  currentTotal = () => {
    switch (this.selectedPeriod()) {
      case 0:
        return this.expenseStore.currentMonthTotal();
      case 1:
        return this.expenseStore.last7DaysTotal();
      case 2:
        return this.expenseStore.last30DaysTotal();
      default:
        return this.expenseStore.currentMonthTotal();
    }
  };

  ngOnInit(): void {
    this.expenseStore.loadExpenses();
  }

  startEdit(expense: ExpenseRecord): void {
    this.editingId.set(expense.id);
    this.editAmount.set(expense.amount);
    this.editCategory.set(expense.category);
    this.editDescription.set(expense.description);
    this.editDate.set(new Date(expense.date));
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;

    const formData: Partial<ExpenseRecordFormData> = {
      amount: this.editAmount(),
      category: this.editCategory(),
      description: this.editDescription(),
      date: this.editDate().toISOString().split('T')[0]
    };

    this.expenseStore.updateExpense(id, formData);
    this.expenseStore.saveExpenses();
    this.editingId.set(null);

    this.snackBar.open('Dépense mise à jour', 'OK', { duration: 3000 });
  }

  confirmDelete(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      this.expenseStore.removeExpense(id);
      this.expenseStore.saveExpenses();
      this.snackBar.open('Dépense supprimée', 'OK', { duration: 3000 });
    }
  }

  confirmClearAll(): void {
    if (confirm('Attention ! Cette action supprimera TOUTES les dépenses. Êtes-vous sûr ?')) {
      this.expenseStore.clearAllExpenses();
      this.snackBar.open('Toutes les dépenses ont été effacées', 'OK', { duration: 3000 });
    }
  }

  scrollToQuickAdd(): void {
    // Scroll vers le composant d'ajout rapide
    const element = document.querySelector('app-quick-expense');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const labels: Record<string, string> = {
      food: 'Alimentation',
      transport: 'Transport',
      leisure: 'Loisirs',
      shopping: 'Shopping',
      health: 'Santé',
      education: 'Éducation',
      other: 'Autre'
    };
    return labels[category] || category;
  }
}
