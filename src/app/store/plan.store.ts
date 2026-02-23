import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { MonthlyTarget } from '../features/budget/components/debt-recovery-plan/debt-recovery-plan.component';

export interface MonthlyHistory {
  month: number;
  monthName: string;
  plannedBudget: number;
  actualSpending?: number;
  completedAt?: Date;
  notes?: string;
}

export interface ActivePlan {
  id: string;
  type: 'debt-recovery' | 'savings';
  createdAt: Date;
  durationMonths: number;
  monthlyBudget: number;
  dailyBudget: number;
  paydayDay: number;
  currentMonth: number;
  targets: MonthlyTarget[];
  history: MonthlyHistory[];
  isActive: boolean;
}

export interface PlanState {
  activePlan: ActivePlan | null;
  pastPlans: ActivePlan[];
}

const initialState: PlanState = {
  activePlan: null,
  pastPlans: []
};

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isPlanActive: computed(() => state.activePlan()?.isActive ?? false),
    currentMonthProgress: computed(() => {
      const plan = state.activePlan();
      return plan ? (plan.currentMonth / plan.durationMonths) * 100 : 0;
    }),
    monthsRemaining: computed(() => {
      const plan = state.activePlan();
      return plan ? plan.durationMonths - plan.currentMonth + 1 : 0;
    }),
    isLastMonth: computed(() => {
      const plan = state.activePlan();
      return plan ? plan.currentMonth >= plan.durationMonths : false;
    })
  })),
  withMethods((store) => ({
    createPlan(plan: Omit<ActivePlan, 'id' | 'createdAt' | 'currentMonth' | 'history' | 'isActive'>) {
      const newPlan: ActivePlan = {
        ...plan,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        currentMonth: 1,
        history: [],
        isActive: true
      };
      patchState(store, { activePlan: newPlan });
    },

    completeCurrentMonth(actualSpending?: number, notes?: string) {
      const plan = store.activePlan();
      if (!plan || !plan.isActive) return;

      const currentTarget = plan.targets.find(t => t.month === plan.currentMonth);

      const newHistory: MonthlyHistory = {
        month: plan.currentMonth,
        monthName: currentTarget?.monthName || `Mois ${plan.currentMonth}`,
        plannedBudget: plan.monthlyBudget,
        actualSpending,
        completedAt: new Date(),
        notes
      };

      if (plan.currentMonth >= plan.durationMonths) {
        patchState(store, (state) => ({
          activePlan: null,
          pastPlans: [...state.pastPlans, { ...plan, isActive: false, history: [...plan.history, newHistory] }]
        }));
      } else {
        patchState(store, {
          activePlan: {
            ...plan,
            currentMonth: plan.currentMonth + 1,
            history: [...plan.history, newHistory]
          }
        });
      }
    },

    cancelPlan() {
      patchState(store, (state) => {
        if (!state.activePlan) return state;
        const cancelledPlan = { ...state.activePlan, isActive: false };
        return {
          activePlan: null,
          pastPlans: [...state.pastPlans, cancelledPlan]
        };
      });
    },

    loadPlan(activePlan: ActivePlan | null, pastPlans: ActivePlan[] = []) {
      patchState(store, { activePlan, pastPlans });
    },

    clearPlans() {
      patchState(store, { activePlan: null, pastPlans: [] });
    },

    updatePlanBudgets(monthlyBudget: number, dailyBudget: number) {
      const plan = store.activePlan();
      if (!plan || !plan.isActive) return;

      patchState(store, {
        activePlan: {
          ...plan,
          monthlyBudget,
          dailyBudget
        }
      });
    }
  }))
);
