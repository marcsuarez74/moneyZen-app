import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BudgetStore } from '../../../../store/budget.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { BudgetOptimizationService } from '../../../../services/budget-optimization.service';
import { UserFinancialData, Expense, EXPENSE_CATEGORIES } from '../../../../models/budget.model';

@Component({
  selector: 'app-budget-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './budget-setup.component.html',
  styleUrls: ['./budget-setup.component.scss']
})
export class BudgetSetupComponent {
  private fb = inject(FormBuilder);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);
  private optimizationService = inject(BudgetOptimizationService);
  private router = inject(Router);
  
  currentStep = 1;
  
  financialForm: FormGroup = this.fb.group({
    salary: [null, [Validators.required, Validators.min(0)]],
    accountBalance: [0]
  });
  
  expensesForm: FormGroup = this.fb.group({
    expenses: this.fb.array([])
  });
  
  get expensesArray(): FormArray {
    return this.expensesForm.get('expenses') as FormArray;
  }
  
  expenseCategories = EXPENSE_CATEGORIES;
  
  suggestedExpenses = [
    { name: 'Loyer / Prêt immo', category: 'housing', amount: 800, frequency: 'monthly' },
    { name: 'Courses alimentaires', category: 'food', amount: 400, frequency: 'monthly' },
    { name: 'Electricité', category: 'utilities', amount: 80, frequency: 'monthly' },
    { name: 'Internet', category: 'utilities', amount: 30, frequency: 'monthly' },
    { name: 'Téléphone', category: 'utilities', amount: 20, frequency: 'monthly' },
    { name: 'Transport', category: 'transport', amount: 100, frequency: 'monthly' },
    { name: 'Assurance auto', category: 'insurance', amount: 600, frequency: 'yearly' },
    { name: 'Assurance habitation', category: 'insurance', amount: 300, frequency: 'yearly' },
    { name: 'Mutuelle', category: 'health', amount: 50, frequency: 'monthly' },
    { name: 'Loisirs', category: 'leisure', amount: 100, frequency: 'monthly' }
  ];
  
  ngOnInit(): void {
    const savedState = this.storageService.loadBudgetState();
    if (savedState?.userData) {
      this.financialForm.patchValue(savedState.userData);
    }
    if (savedState?.expenses && savedState.expenses.length > 0) {
      savedState.expenses.forEach((exp: Expense) => {
        this.expensesArray.push(this.createExpenseForm(exp));
      });
      this.currentStep = 2;
    }
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
  
  isOverdrawn(): boolean {
    return (this.financialForm.get('accountBalance')?.value || 0) < 0;
  }
  
  goToStep(step: number): void {
    if (step === 2 && this.financialForm.invalid) {
      return;
    }
    this.currentStep = step;
    if (step === 2 && this.expensesArray.length === 0) {
      this.addExpense();
    }
  }
  
  createExpenseForm(expense?: Partial<Expense>): FormGroup {
    return this.fb.group({
      id: [expense?.id || this.generateId()],
      name: [expense?.name || '', Validators.required],
      category: [expense?.category || 'other', Validators.required],
      amount: [expense?.amount || 0, [Validators.required, Validators.min(0)]],
      frequency: [expense?.frequency || 'monthly', Validators.required]
    });
  }
  
  addExpense(): void {
    this.expensesArray.push(this.createExpenseForm());
  }
  
  addSuggestedExpense(expense: any): void {
    this.expensesArray.push(this.createExpenseForm(expense));
  }
  
  removeExpense(index: number): void {
    this.expensesArray.removeAt(index);
  }
  
  calculateMonthlyEquivalent(amount: number, frequency: string): number {
    switch (frequency) {
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  }
  
  calculateTotalExpenses(): number {
    return this.expensesArray.controls.reduce((sum, control) => {
      const amount = control.get('amount')?.value || 0;
      const frequency = control.get('frequency')?.value || 'monthly';
      return sum + this.calculateMonthlyEquivalent(amount, frequency);
    }, 0);
  }
  
  calculateRemaining(): number {
    const salary = this.financialForm.get('salary')?.value || 0;
    return salary - this.calculateTotalExpenses();
  }
  
  saveBudget(): void {
    if (this.financialForm.invalid) return;
    
    const userData: UserFinancialData = this.financialForm.value;
    const expenses: Expense[] = this.expensesArray.value.map((expense: any) => ({
      ...expense,
      monthlyEquivalent: this.calculateMonthlyEquivalent(expense.amount, expense.frequency)
    }));
    
    this.budgetStore.setUserData(userData);
    this.budgetStore.setExpenses(expenses);
    
    this.storageService.saveBudgetState({
      userData,
      expenses,
      isLoading: false,
      error: null
    });
    
    this.router.navigate(['/budget']);
  }
  
  private generateId(): string {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
