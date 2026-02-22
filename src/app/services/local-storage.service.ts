import { Injectable } from '@angular/core';
import { BudgetState } from '../store/budget.store';
import { ProjectState } from '../store/project.store';
import { MealState } from '../store/meal.store';

const STORAGE_KEYS = {
  BUDGET: 'budget_data',
  PROJECTS: 'projects_data',
  MEALS: 'meals_data',
  THEME: 'theme_preference'
} as const;

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  
  saveBudgetState(state: BudgetState): void {
    this.saveToStorage(STORAGE_KEYS.BUDGET, state);
  }

  loadBudgetState(): BudgetState | null {
    return this.loadFromStorage<BudgetState>(STORAGE_KEYS.BUDGET);
  }

  saveProjectState(state: ProjectState): void {
    this.saveToStorage(STORAGE_KEYS.PROJECTS, state);
  }

  loadProjectState(): ProjectState | null {
    return this.loadFromStorage<ProjectState>(STORAGE_KEYS.PROJECTS);
  }

  saveMealState(state: MealState): void {
    this.saveToStorage(STORAGE_KEYS.MEALS, state);
  }

  loadMealState(): MealState | null {
    return this.loadFromStorage<MealState>(STORAGE_KEYS.MEALS);
  }

  saveThemePreference(isDark: boolean): void {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
  }

  loadThemePreference(): boolean {
    const value = localStorage.getItem(STORAGE_KEYS.THEME);
    return value ? JSON.parse(value) : false;
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
    }
  }

  private loadFromStorage<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading from localStorage [${key}]:`, error);
      return null;
    }
  }
}
