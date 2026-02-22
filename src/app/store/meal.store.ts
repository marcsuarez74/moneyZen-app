import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MealPlan, ShoppingList } from '../models/meal.model';

export interface MealState {
  mealPlans: MealPlan[];
  currentMealPlanId: string | null;
  shoppingLists: ShoppingList[];
}

const initialState: MealState = {
  mealPlans: [],
  currentMealPlanId: null,
  shoppingLists: []
};

export const MealStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    addMealPlan(mealPlan: MealPlan) {
      patchState(store, (state) => ({
        mealPlans: [...state.mealPlans, mealPlan]
      }));
    },
    updateMealPlan(updatedMealPlan: MealPlan) {
      patchState(store, (state) => ({
        mealPlans: state.mealPlans.map(mp => mp.id === updatedMealPlan.id ? updatedMealPlan : mp)
      }));
    },
    removeMealPlan(mealPlanId: string) {
      patchState(store, (state) => ({
        mealPlans: state.mealPlans.filter(mp => mp.id !== mealPlanId)
      }));
    },
    setMealPlans(mealPlans: MealPlan[]) {
      patchState(store, { mealPlans });
    },
    setCurrentMealPlan(mealPlanId: string | null) {
      patchState(store, { currentMealPlanId: mealPlanId });
    },
    addShoppingList(shoppingList: ShoppingList) {
      patchState(store, (state) => ({
        shoppingLists: [...state.shoppingLists, shoppingList]
      }));
    },
    removeShoppingList(index: number) {
      patchState(store, (state) => ({
        shoppingLists: state.shoppingLists.filter((_, i) => i !== index)
      }));
    },
    clearMealPlans() {
      patchState(store, initialState);
    }
  }))
);
