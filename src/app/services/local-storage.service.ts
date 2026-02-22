import { Injectable } from '@angular/core';
import { BudgetState } from '../store/budget.store';
import { ProjectState } from '../store/project.store';

const STORAGE_KEYS = {
  BUDGET: 'budget_data',
  PROJECTS: 'projects_data',
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

  saveThemePreference(isDark: boolean): void {
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(isDark));
  }

  loadThemePreference(): boolean {
    const value = localStorage.getItem(STORAGE_KEYS.THEME);
    return value ? JSON.parse(value) : false;
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage [${key}]:`, error);
    }
  }

  private loadFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : null;
    } catch (error) {
      console.error(`Error loading from localStorage [${key}]:`, error);
      return null;
    }
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.BUDGET);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.THEME);
  }
}
