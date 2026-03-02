import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  ExpenseRecord,
  ExpenseRecordFormData,
  generateExpenseId,
  sortExpensesByDate,
  filterExpensesByMonth,
  calculateTotalExpenses,
} from '../models/expense-record.model';
import { computed, inject } from '@angular/core';
import { PlanStore } from './plan.store';

export interface ExpenseRecordState {
  expenses: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ExpenseRecordState = {
  expenses: [],
  isLoading: false,
  error: null,
};

export const ExpenseRecordStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(state => {
    const planStore = inject(PlanStore);

    return {
      // Toutes les dépenses triées par date (plus récente en premier)
      sortedExpenses: computed(() => sortExpensesByDate(state.expenses())),

      // Dépenses de la période de paie en cours (basée sur le jour de paie)
      currentMonthExpenses: computed(() => {
        const expenses = state.expenses();
        const activePlan = planStore.activePlan();

        // Si pas de plan actif ou pas de jour de paie défini, fallback sur le mois calendaire
        if (!activePlan?.paydayDay) {
          const now = new Date();
          return filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
        }

        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const paydayDay = activePlan.paydayDay;

        // Déterminer la période de paie en cours
        let startDate: Date;
        let endDate: Date;

        if (currentDay >= paydayDay) {
          // On est après la paie : du jour de paie du mois en cours au jour de paie du mois suivant
          startDate = new Date(currentYear, currentMonth, paydayDay);
          endDate = new Date(currentYear, currentMonth + 1, paydayDay);
        } else {
          // On est avant la paie : du jour de paie du mois précédent au jour de paie du mois en cours
          startDate = new Date(currentYear, currentMonth - 1, paydayDay);
          endDate = new Date(currentYear, currentMonth, paydayDay);
        }

        // Inclure la date de fin (jusqu'à la veille de la prochaine paie)
        endDate = new Date(endDate.getTime() - 1);

        return expenses.filter(e => {
          const expDate = new Date(e.date);
          return expDate >= startDate && expDate <= endDate;
        });
      }),

      // Total des dépenses de la période de paie en cours
      currentMonthTotal: computed(() => {
        const activePlan = planStore.activePlan();
        const expenses = state.expenses();

        // Si pas de plan actif ou pas de jour de paie défini, fallback sur le mois calendaire
        if (!activePlan?.paydayDay) {
          const now = new Date();
          const monthExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
          return monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        }

        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const paydayDay = activePlan.paydayDay;

        let startDate: Date;
        let endDate: Date;

        if (currentDay >= paydayDay) {
          startDate = new Date(currentYear, currentMonth, paydayDay);
          endDate = new Date(currentYear, currentMonth + 1, paydayDay);
        } else {
          startDate = new Date(currentYear, currentMonth - 1, paydayDay);
          endDate = new Date(currentYear, currentMonth, paydayDay);
        }

        endDate = new Date(endDate.getTime() - 1);

        return expenses
          .filter(e => {
            const expDate = new Date(e.date);
            return expDate >= startDate && expDate <= endDate;
          })
          .reduce((sum, e) => sum + e.amount, 0);
      }),

      // Dépenses des 7 derniers jours
      last7DaysExpenses: computed(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return state.expenses().filter(e => new Date(e.date) >= sevenDaysAgo);
      }),

      // Total des 7 derniers jours
      last7DaysTotal: computed(() => {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return state
          .expenses()
          .filter(e => new Date(e.date) >= sevenDaysAgo)
          .reduce((sum, e) => sum + e.amount, 0);
      }),

      // Dépenses des 30 derniers jours
      last30DaysExpenses: computed(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return state.expenses().filter(e => new Date(e.date) >= thirtyDaysAgo);
      }),

      // Total des 30 derniers jours
      last30DaysTotal: computed(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return state
          .expenses()
          .filter(e => new Date(e.date) >= thirtyDaysAgo)
          .reduce((sum, e) => sum + e.amount, 0);
      }),

      // Nombre total de dépenses
      totalCount: computed(() => state.expenses().length),

      // Dernières dépenses (limitées)
      recentExpenses: computed((limit = 10) =>
        sortExpensesByDate(state.expenses()).slice(0, limit)
      ),
    };
  }),
  withMethods(store => ({
    /**
     * Ajoute une nouvelle dépense
     */
    addExpense(formData: ExpenseRecordFormData): ExpenseRecord {
      const now = new Date().toISOString();
      const newExpense: ExpenseRecord = {
        id: generateExpenseId(),
        amount: formData.amount,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        createdAt: now,
        updatedAt: now,
      };

      patchState(store, state => ({
        expenses: [...state.expenses, newExpense],
      }));

      return newExpense;
    },

    /**
     * Met à jour une dépense existante
     */
    updateExpense(id: string, formData: Partial<ExpenseRecordFormData>): boolean {
      let updated = false;

      patchState(store, state => ({
        expenses: state.expenses.map(expense => {
          if (expense.id === id) {
            updated = true;
            return {
              ...expense,
              ...(formData.amount !== undefined && { amount: formData.amount }),
              ...(formData.category !== undefined && { category: formData.category }),
              ...(formData.description !== undefined && { description: formData.description }),
              ...(formData.date !== undefined && { date: formData.date }),
              updatedAt: new Date().toISOString(),
            };
          }
          return expense;
        }),
      }));

      return updated;
    },

    /**
     * Supprime une dépense
     */
    removeExpense(id: string): boolean {
      const initialLength = store.expenses().length;

      patchState(store, state => ({
        expenses: state.expenses.filter(e => e.id !== id),
      }));

      return store.expenses().length < initialLength;
    },

    /**
     * Récupère une dépense par son ID
     */
    getExpenseById(id: string): ExpenseRecord | undefined {
      return store.expenses().find(e => e.id === id);
    },

    /**
     * Charge les dépenses depuis le localStorage
     */
    loadExpenses(): void {
      try {
        const stored = localStorage.getItem('expense-records');
        if (stored) {
          const expenses = JSON.parse(stored) as ExpenseRecord[];
          patchState(store, { expenses });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des dépenses:', error);
        patchState(store, { error: 'Impossible de charger les dépenses' });
      }
    },

    /**
     * Sauvegarde les dépenses dans le localStorage
     */
    saveExpenses(): void {
      try {
        localStorage.setItem('expense-records', JSON.stringify(store.expenses()));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des dépenses:', error);
        patchState(store, { error: 'Impossible de sauvegarder les dépenses' });
      }
    },

    /**
     * Efface toutes les dépenses
     */
    clearAllExpenses(): void {
      patchState(store, { expenses: [] });
      localStorage.removeItem('expense-records');
    },

    /**
     * Définit les dépenses (utile pour l'import)
     */
    setExpenses(expenses: ExpenseRecord[]): void {
      patchState(store, { expenses });
    },

    /**
     * Calcule le total des dépenses entre deux dates
     */
    calculateTotalBetweenDates(startDate: Date, endDate: Date): number {
      return calculateTotalExpenses(store.expenses(), startDate, endDate);
    },
  }))
);
