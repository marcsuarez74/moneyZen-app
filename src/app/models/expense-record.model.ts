/**
 * Modèle pour les dépenses ponctuelles (transactions réelles)
 * Différent des dépenses fixes mensuelles (Expense)
 * Utilise les mêmes catégories que les charges fixes pour la cohérence
 */

import { 
  ExpenseCategory, 
  EXPENSE_CATEGORIES 
} from './budget.model';

// Ré-export du type pour compatibilité
export type { ExpenseCategory };

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // ISO date string
  createdAt: string;
  updatedAt?: string;
}

export interface ExpenseRecordFormData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

// Labels dynamiques basés sur EXPENSE_CATEGORIES
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = 
  EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = cat.label;
    return acc;
  }, {} as Record<ExpenseCategory, string>);

// Icônes dynamiques basées sur EXPENSE_CATEGORIES
export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = 
  EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = cat.icon;
    return acc;
  }, {} as Record<ExpenseCategory, string>);

// Couleurs par groupe de catégories
const CATEGORY_GROUP_COLORS: Record<string, string> = {
  'Logement': '#FF6B6B',
  'Transport': '#4ECDC4',
  'Alimentation': '#FFEAA7',
  'Services': '#96CEB4',
  'Assurances': '#DDA0DD',
  'Santé': '#FFB6C1',
  'Éducation': '#98D8C8',
  'Loisirs': '#45B7D1',
  'Personnel': '#FFD93D',
  'Crédits': '#FF8C94',
  'Épargne': '#95E1D3',
  'Divers': '#B0B0B0'
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = 
  EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = CATEGORY_GROUP_COLORS[cat.group] || '#B0B0B0';
    return acc;
  }, {} as Record<ExpenseCategory, string>);

/**
 * Génère un ID unique pour une dépense
 */
export function generateExpenseId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcule le total des dépenses pour une période donnée
 */
export function calculateTotalExpenses(
  expenses: ExpenseRecord[],
  startDate: Date,
  endDate: Date
): number {
  return expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Calcule les dépenses par catégorie
 */
export function calculateExpensesByCategory(
  expenses: ExpenseRecord[]
): Record<ExpenseCategory, number> {
  // Initialise toutes les catégories à 0
  const result: Record<ExpenseCategory, number> = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = 0;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  expenses.forEach(expense => {
    if (result[expense.category] !== undefined) {
      result[expense.category] += expense.amount;
    }
  });

  return result;
}

/**
 * Filtre les dépenses par mois et année
 */
export function filterExpensesByMonth(
  expenses: ExpenseRecord[],
  year: number,
  month: number // 0-11
): ExpenseRecord[] {
  return expenses.filter(e => {
    const date = new Date(e.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
}

/**
 * Trie les dépenses par date (plus récente en premier)
 */
export function sortExpensesByDate(expenses: ExpenseRecord[]): ExpenseRecord[] {
  return [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
