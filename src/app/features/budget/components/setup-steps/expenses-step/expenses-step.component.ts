import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormCardComponent } from '../../../../../shared/components/form-card/form-card.component';
import { ExpenseItemComponent } from '../../../../../shared/components/expense-item/expense-item.component';
import { Expense } from '../../../../../models/budget.model';

export type SuggestedExpense = Omit<Expense, 'id' | 'monthlyEquivalent'>;

@Component({
  selector: 'app-expenses-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    FormCardComponent,
    ExpenseItemComponent
  ],
  templateUrl: './expenses-step.component.html',
  styleUrls: ['./expenses-step.component.scss']
})
export class ExpensesStepComponent {
  readonly expensesArray = input.required<FormArray>();
  readonly suggestedExpenses = input<SuggestedExpense[]>([]);
  
  readonly previousStep = output<void>();
  readonly nextStep = output<void>();
  readonly addExpense = output<SuggestedExpense>();
  readonly removeExpense = output<number>();
  readonly editExpense = output<{ index: number; expense: Expense }>();

  onPrevious(): void {
    this.previousStep.emit();
  }

  onNext(): void {
    this.nextStep.emit();
  }

  onAddSuggested(expense: SuggestedExpense): void {
    this.addExpense.emit(expense);
  }

  onRemoveExpense(index: number): void {
    this.removeExpense.emit(index);
  }

  onEditExpense(index: number, expense: Expense): void {
    this.editExpense.emit({ index, expense });
  }

  getIcon(category: string): string {
    const icons: Record<string, string> = {
      housing: 'home',
      mortgage: 'home',
      transport: 'directions_car',
      food: 'restaurant',
      utilities: 'bolt',
      insurance: 'shield',
      health: 'healing',
      education: 'school',
      leisure: 'sports_esports',
      savings: 'savings',
      internet: 'wifi',
      phone: 'smartphone',
      other: 'more_horiz'
    };
    return icons[category] || 'help';
  }
}
