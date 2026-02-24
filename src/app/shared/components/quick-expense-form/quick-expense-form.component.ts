/**
 * DUMB COMPONENT - Formulaire rapide d'ajout de dépense
 * Fields: montant, catégorie, description (optionnel)
 */
import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { ExpenseCategoryChipComponent } from '../expense-category-chip/expense-category-chip.component';
import { ExpenseCategory, ExpenseRecordFormData, EXPENSE_CATEGORY_LABELS } from '../../../models/expense-record.model';

@Component({
  selector: 'app-quick-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ExpenseCategoryChipComponent
  ],
  providers: [provideNativeDateAdapter()],
  styleUrls: ['./quick-expense-form.component.scss'],
  template: `
    <div class="quick-expense-form">
      <!-- Montant -->
      <mat-form-field appearance="outline" class="amount-field">
        <mat-label>Montant</mat-label>
        <input 
          matInput 
          type="number" 
          [(ngModel)]="amount"
          placeholder="0.00"
          step="0.01"
          min="0.01"
          required
          #amountInput>
        <span matSuffix>€</span>
      </mat-form-field>

      <!-- Catégories -->
      <div class="categories-section">
        <label class="section-label">Catégorie</label>
        <div class="categories-grid">
          @for (category of categories; track category) {
            <app-expense-category-chip
              [category]="category"
              [selectable]="true"
              [selected]="selectedCategory() === category"
              (clicked)="selectCategory($event)">
            </app-expense-category-chip>
          }
        </div>
      </div>

      <!-- Description (optionnel) -->
      <mat-form-field appearance="outline" class="description-field">
        <mat-label>Description (optionnel)</mat-label>
        <input 
          matInput 
          [(ngModel)]="description"
          placeholder="Ex: Déjeuner avec collègues"
          maxlength="100">
        <mat-hint align="end">{{ description().length }}/100</mat-hint>
      </mat-form-field>

      <!-- Date -->
      <mat-form-field appearance="outline" class="date-field">
        <mat-label>Date</mat-label>
        <input 
          matInput 
          [matDatepicker]="picker"
          [(ngModel)]="date"
          required>
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <!-- Bouton Ajouter -->
      <button 
        mat-raised-button 
        color="primary"
        class="add-button"
        [disabled]="!isValid()"
        (click)="onSubmit()">
        <mat-icon>add</mat-icon>
        Ajouter la dépense
      </button>

      @if (showSuccess()) {
        <div class="success-message">
          <mat-icon>check_circle</mat-icon>
          <span>Dépense ajoutée !</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .quick-expense-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      background: var(--surface-color, #ffffff);
      border-radius: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    .amount-field {
      width: 100%;

      input {
        font-size: 1.5rem;
        font-weight: 600;
      }

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    .categories-section {
      .section-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary, #666);
        margin-bottom: 12px;
      }

      .categories-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }

    .description-field,
    .date-field {
      width: 100%;
    }

    .add-button {
      width: 100%;
      padding: 16px 24px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      text-transform: none;
      letter-spacing: 0.5px;

      mat-icon {
        margin-right: 8px;
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    .success-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 8px;
      font-weight: 500;
      animation: fadeIn 0.3s ease;

      mat-icon {
        color: #4caf50;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 600px) {
      .quick-expense-form {
        padding: 16px;
        gap: 16px;
        border-radius: 12px;
      }

      .categories-section .categories-grid {
        gap: 8px;
      }

      .add-button {
        padding: 14px 20px;
      }
    }
  `]
})
export class QuickExpenseFormComponent {
  // Output events
  submitExpense = output<ExpenseRecordFormData>();
  
  // Internal state
  amount = signal<number | null>(null);
  description = signal('');
  date = signal<Date>(new Date());
  selectedCategory = signal<ExpenseCategory | null>(null);
  showSuccess = signal(false);

  // Categories list
  categories: ExpenseCategory[] = [
    'food', 'transport', 'leisure', 'shopping', 'health', 'education', 'other'
  ];

  categoryLabels = EXPENSE_CATEGORY_LABELS;

  isValid = () => {
    const amt = this.amount();
    return amt !== null && amt > 0 && this.selectedCategory() !== null;
  };

  selectCategory(category: ExpenseCategory): void {
    this.selectedCategory.set(category);
  }

  onSubmit(): void {
    if (!this.isValid()) return;

    const formData: ExpenseRecordFormData = {
      amount: this.amount()!,
      category: this.selectedCategory()!,
      description: this.description() || '',
      date: this.date().toISOString().split('T')[0]
    };

    this.submitExpense.emit(formData);
    
    // Show success message briefly
    this.showSuccess.set(true);
    setTimeout(() => this.showSuccess.set(false), 2000);
    
    // Reset form
    this.resetForm();
  }

  private resetForm(): void {
    this.amount.set(null);
    this.description.set('');
    this.date.set(new Date());
    this.selectedCategory.set(null);
  }
}
