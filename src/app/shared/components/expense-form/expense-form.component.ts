import { Component, inject, input, output, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EXPENSE_CATEGORIES, ExpenseCategory, Expense } from '../../../models/budget.model';

interface ExpenseFormData {
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
}

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent {
  private fb = inject(FormBuilder);

  readonly expenseToEdit = input<Expense | null>(null);
  readonly isOpen = input<boolean>(false);

  readonly saveExpense = output<ExpenseFormData>();
  readonly cancelEdit = output<void>();
  readonly closeForm = output<void>();

  expenseForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: ['other', Validators.required],
    amount: [null, [Validators.required, Validators.min(0)]],
    frequency: ['monthly', Validators.required]
  });

  readonly isEditing = computed(() => this.expenseToEdit() !== null);
  readonly formTitle = computed(() => this.isEditing() ? 'Modifier la charge' : 'Ajouter une charge');
  readonly submitButtonText = computed(() => this.isEditing() ? 'Enregistrer' : 'Ajouter');
  readonly submitButtonIcon = computed(() => this.isEditing() ? 'save' : 'add');

  getAlphabeticalCategories() {
    return [...EXPENSE_CATEGORIES].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  }

  constructor() {
    effect(() => {
      const expense = this.expenseToEdit();
      if (expense) {
        this.expenseForm.patchValue({
          name: expense.name,
          category: expense.category,
          amount: expense.amount,
          frequency: expense.frequency
        });
      } else {
        this.resetForm();
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.saveExpense.emit(this.expenseForm.value);
      if (!this.isEditing()) {
        this.resetForm();
      } else {
        this.closeForm.emit();
      }
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelEdit.emit();
    this.closeForm.emit();
  }

  private resetForm(): void {
    this.expenseForm.reset({
      category: 'other',
      frequency: 'monthly'
    });
  }
}
