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
  styleUrls: ['./recent-expenses.component.scss'],
  template: `
    <mat-card class="recent-expenses-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>receipt_long</mat-icon>
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
        <button 
          mat-button 
          color="warn"
          *ngIf="filteredExpenses().length > 0"
          (click)="confirmClearAll()">
          <mat-icon>delete_sweep</mat-icon>
          Tout effacer
        </button>
      </mat-card-actions>
    </mat-card>
  `
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

  categories: ExpenseCategory[] = ['food', 'transport', 'leisure', 'shopping', 'health', 'education', 'other'];

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
