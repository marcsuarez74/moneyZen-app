import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EXPENSE_CATEGORIES, ExpenseCategory } from '../../../models/budget.model';

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
    MatIconModule
  ],
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.scss']
})
export class ExpenseFormComponent {
  private fb = inject(FormBuilder);
  
  readonly isEditing = input<boolean>(false);
  readonly expenseCategories = EXPENSE_CATEGORIES;
  
  readonly saveExpense = output<{ name: string; category: ExpenseCategory; amount: number; frequency: 'monthly' | 'yearly' }>();
  readonly cancelEdit = output<void>();

  expenseForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['other', Validators.required],
    amount: [null, [Validators.required, Validators.min(0)]],
    frequency: ['monthly', Validators.required]
  });

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      housing: 'home',
      transport: 'directions_car',
      food: 'restaurant',
      utilities: 'bolt',
      insurance: 'shield',
      health: 'healing',
      education: 'school',
      leisure: 'sports_esports',
      savings: 'savings',
      other: 'more_horiz'
    };
    return icons[category] || 'help';
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.saveExpense.emit(this.expenseForm.value);
      this.expenseForm.reset({ category: 'other', frequency: 'monthly' });
    }
  }

  onCancel(): void {
    this.expenseForm.reset({ category: 'other', frequency: 'monthly' });
    this.cancelEdit.emit();
  }
}
