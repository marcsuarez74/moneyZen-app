import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormCardComponent } from '../../../../../shared/components/form-card/form-card.component';
import { ExpenseItemComponent } from '../../../../../shared/components/expense-item/expense-item.component';
import { ExpenseFormComponent } from '../../../../../shared/components/expense-form/expense-form.component';
import { Expense, ExpenseCategory } from '../../../../../models/budget.model';

@Component({
  selector: 'app-expenses-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormCardComponent,
    ExpenseItemComponent,
    ExpenseFormComponent
  ],
  templateUrl: './expenses-step.component.html',
  styleUrls: ['./expenses-step.component.scss']
})
export class ExpensesStepComponent {
  readonly expensesArray = input.required<FormArray>();
  
  readonly previousStep = output<void>();
  readonly nextStep = output<void>();
  readonly addExpense = output<{ name: string; category: ExpenseCategory; amount: number; frequency: 'monthly' | 'yearly' }>();
  readonly removeExpense = output<number>();

  onPrevious(): void {
    this.previousStep.emit();
  }

  onNext(): void {
    this.nextStep.emit();
  }

  onAddExpense(expense: { name: string; category: ExpenseCategory; amount: number; frequency: 'monthly' | 'yearly' }): void {
    this.addExpense.emit(expense);
  }

  onRemoveExpense(index: number): void {
    this.removeExpense.emit(index);
  }

  getTotalMonthly(): number {
    return this.expensesArray().controls.reduce((total, control) => {
      const expense = control.value as Expense;
      return total + (expense.monthlyEquivalent || 0);
    }, 0);
  }

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
}
