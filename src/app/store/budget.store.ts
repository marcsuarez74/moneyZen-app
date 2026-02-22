import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Expense, UserFinancialData, BudgetSummary, BudgetOptimization } from '../models/budget.model';

export interface BudgetState {
  userData: UserFinancialData | null;
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  userData: null,
  expenses: [],
  isLoading: false,
  error: null
};

export const BudgetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    totalMonthlyExpenses: computed(() => {
      return state.expenses().reduce((sum, expense) => sum + expense.monthlyEquivalent, 0);
    }),
    hasUserData: computed(() => state.userData() !== null),
    hasExpenses: computed(() => state.expenses().length > 0),
    budgetSummary: computed<BudgetSummary | null>(() => {
      const userData = state.userData();
      const expenses = state.expenses();
      
      if (!userData) return null;
      
      const totalExpenses = expenses.reduce((sum, e) => sum + e.monthlyEquivalent, 0);
      const remainingBudget = userData.salary - totalExpenses;
      
      const expenseBreakdown = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.monthlyEquivalent;
        return acc;
      }, {} as Record<string, number>);
      
      return {
        totalIncome: userData.salary,
        totalExpenses,
        remainingBudget,
        savingsPotential: remainingBudget > 0 ? remainingBudget * 0.5 : 0,
        expenseBreakdown
      };
    }),
    isHealthyBudget: computed(() => {
      const userData = state.userData();
      const expenses = state.expenses();
      if (!userData) return false;
      const totalExpenses = expenses.reduce((sum, e) => sum + e.monthlyEquivalent, 0);
      return (userData.salary - totalExpenses) > 0;
    })
  })),
  withMethods((store) => ({
    setUserData(userData: UserFinancialData) {
      patchState(store, { userData });
    },
    addExpense(expense: Expense) {
      patchState(store, (state) => ({
        expenses: [...state.expenses, expense]
      }));
    },
    updateExpense(updatedExpense: Expense) {
      patchState(store, (state) => ({
        expenses: state.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
      }));
    },
    removeExpense(expenseId: string) {
      patchState(store, (state) => ({
        expenses: state.expenses.filter(e => e.id !== expenseId)
      }));
    },
    setExpenses(expenses: Expense[]) {
      patchState(store, { expenses });
    },
    clearBudget() {
      patchState(store, initialState);
    }
  }))
);
