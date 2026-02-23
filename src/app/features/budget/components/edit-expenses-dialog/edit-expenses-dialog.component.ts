import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Expense, EXPENSE_CATEGORIES, ExpenseCategory } from '../../../../models/budget.model';

interface TableExpense extends Expense {
  isEditing?: boolean;
}

@Component({
  selector: 'app-edit-expenses-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatTableModule,
    MatSortModule,
    MatToolbarModule,
    CurrencyPipe
  ],
  templateUrl: './edit-expenses-dialog.component.html',
  styleUrls: ['./edit-expenses-dialog.component.scss']
})
export class EditExpensesDialogComponent {
  private dialogRef = inject(MatDialogRef<EditExpensesDialogComponent>);

  readonly data = inject<{ expenses: Expense[] }>(MAT_DIALOG_DATA);

  readonly expenses = signal<TableExpense[]>([...this.data.expenses]);
  readonly categories = EXPENSE_CATEGORIES;
  readonly displayedColumns = ['name', 'category', 'amount', 'frequency', 'monthlyEquivalent', 'actions'];

  // Tri alphabétique des catégories pour le select
  readonly sortedCategories = computed(() => {
    return [...this.categories].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
  });

  readonly totalMonthly = computed(() =>
    this.expenses().reduce((sum, e) => sum + e.monthlyEquivalent, 0)
  );

  readonly totalAnnual = computed(() => this.totalMonthly() * 12);

  addNewExpense(): void {
    const newExpense: TableExpense = {
      id: 'exp_' + Date.now(),
      name: 'Nouvelle charge',
      category: 'other',
      amount: 0,
      frequency: 'monthly',
      monthlyEquivalent: 0,
      isEditing: true
    };
    this.expenses.update(exp => [...exp, newExpense]);
  }

  removeExpense(id: string): void {
    this.expenses.update(exp => exp.filter(e => e.id !== id));
  }

  toggleEdit(expense: TableExpense): void {
    expense.isEditing = !expense.isEditing;
    if (!expense.isEditing) {
      // Recalculer l'équivalent mensuel quand on quitte l'édition
      expense.monthlyEquivalent = this.calculateMonthlyEquivalent(expense);
    }
  }

  updateExpenseField(expense: TableExpense, field: keyof TableExpense, value: any): void {
    (expense as any)[field] = value;
    expense.monthlyEquivalent = this.calculateMonthlyEquivalent(expense);
  }

  getCategoryLabel(category: ExpenseCategory): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.label || category;
  }

  getCategoryIcon(category: ExpenseCategory): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.icon || 'help';
  }

  sortData(sort: Sort): void {
    const data = this.expenses();
    if (!sort.active || sort.direction === '') {
      return;
    }

    const sorted = [...data].sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'category': return this.compare(this.getCategoryLabel(a.category), this.getCategoryLabel(b.category), isAsc);
        case 'amount': return this.compare(a.amount, b.amount, isAsc);
        case 'frequency': return this.compare(a.frequency, b.frequency, isAsc);
        case 'monthlyEquivalent': return this.compare(a.monthlyEquivalent, b.monthlyEquivalent, isAsc);
        default: return 0;
      }
    });

    this.expenses.set(sorted);
  }

  private compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  getFrequencyLabel(frequency: Expense['frequency']): string {
    const labels: Record<string, string> = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      'one-time': 'Ponctuel'
    };
    return labels[frequency] || frequency;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const updatedExpenses = this.expenses().map(expense => ({
      ...expense,
      monthlyEquivalent: this.calculateMonthlyEquivalent(expense)
    }));
    this.dialogRef.close(updatedExpenses);
  }

  private calculateMonthlyEquivalent(expense: Expense): number {
    switch (expense.frequency) {
      case 'monthly': return expense.amount;
      case 'quarterly': return expense.amount / 3;
      case 'yearly': return expense.amount / 12;
      case 'one-time': return 0;
      default: return expense.amount;
    }
  }
}
