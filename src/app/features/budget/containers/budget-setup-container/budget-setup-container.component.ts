import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { BudgetStore } from '../../../../store/budget.store';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { UserFinancialData, Expense, ExpenseCategory } from '../../../../models/budget.model';
import { StepIndicatorComponent, Step } from '../../../../shared/components/step-indicator/step-indicator.component';
import { FinancialStepComponent } from '../../components/setup-steps/financial-step/financial-step.component';
import { ExpensesStepComponent } from '../../components/setup-steps/expenses-step/expenses-step.component';

interface NewExpense {
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'monthly' | 'yearly';
}

@Component({
  selector: 'app-budget-setup-container',
  standalone: true,
  imports: [
    CommonModule,
    StepIndicatorComponent,
    FinancialStepComponent,
    ExpensesStepComponent
  ],
  templateUrl: './budget-setup-container.component.html',
  styleUrls: ['./budget-setup-container.component.scss']
})
export class BudgetSetupContainerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private budgetStore = inject(BudgetStore);
  private storageService = inject(LocalStorageService);
  private router = inject(Router);
  
  currentStep = 1;
  
  steps: Step[] = [
    { label: 'Revenus', icon: 'account_balance_wallet', completed: false },
    { label: 'Charges', icon: 'receipt_long', completed: false }
  ];
  
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
  
  isOverdrawn = computed(() => {
    const balance = this.financialForm.get('accountBalance')?.value || 0;
    return balance < 0;
  });
  
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
      this.steps[0].completed = true;
    }
  }
  
  onStepChange(step: number): void {
    this.currentStep = step;
  }
  
  onFinancialNext(): void {
    this.steps[0].completed = true;
    this.currentStep = 2;
  }
  
  onExpensesPrevious(): void {
    this.currentStep = 1;
  }
  
  onExpensesNext(): void {
    this.saveAndNavigate();
  }
  
  onAddExpense(expense: NewExpense): void {
    this.expensesArray.push(this.createExpenseForm(expense));
    this.steps[1].completed = this.expensesArray.length > 0;
  }
  
  onRemoveExpense(index: number): void {
    this.expensesArray.removeAt(index);
  }
  
  private createExpenseForm(expense?: Expense | NewExpense): FormGroup {
    return this.fb.group({
      name: [expense?.name || '', Validators.required],
      category: [expense?.category || 'other', Validators.required],
      amount: [expense?.amount || 0, [Validators.required, Validators.min(0)]],
      frequency: [expense?.frequency || 'monthly', Validators.required],
      monthlyEquivalent: [(expense as Expense)?.monthlyEquivalent || this.calculateMonthly(expense?.amount || 0, expense?.frequency || 'monthly')]
    });
  }
  
  private calculateMonthly(amount: number, frequency: string): number {
    if (frequency === 'yearly') {
      return Math.round((amount / 12) * 100) / 100;
    }
    return amount;
  }
  
  private saveAndNavigate(): void {
    const userData: UserFinancialData = {
      salary: this.financialForm.get('salary')?.value,
      accountBalance: this.financialForm.get('accountBalance')?.value,
      isPositiveBalance: (this.financialForm.get('accountBalance')?.value || 0) >= 0
    };
    
    this.budgetStore.setUserData(userData);
    
    const expenses: Expense[] = this.expensesArray.value.map((exp: any) => ({
      ...exp,
      id: crypto.randomUUID()
    }));
    
    expenses.forEach(exp => this.budgetStore.addExpense(exp));
    
    this.storageService.saveBudgetState({
      userData,
      expenses,
      isLoading: false,
      error: null
    });
    
    this.router.navigate(['/budget/dashboard']);
  }
}
