/**
 * Modèle pour les dépenses ponctuelles (transactions réelles)
 * Différent des dépenses fixes mensuelles (Expense)
 */

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'leisure'
  | 'shopping'
  | 'health'
  | 'education'
  | 'other';

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

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Alimentation',
  transport: 'Transport',
  leisure: 'Loisirs',
  shopping: 'Shopping',
  health: 'Santé',
  education: 'Éducation',
  other: 'Autre'
};

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: 'restaurant',
  transport: 'directions_car',
  leisure: 'sports_esports',
  shopping: 'shopping_bag',
  health: 'favorite',
  education: 'school',
  other: 'more_horiz'
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: '#FF6B6B',
  transport: '#4ECDC4',
  leisure: '#45B7D1',
  shopping: '#96CEB4',
  health: '#FFEAA7',
  education: '#DDA0DD',
  other: '#B0B0B0'
};

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
  const result: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    leisure: 0,
    shopping: 0,
    health: 0,
    education: 0,
    other: 0
  };

  expenses.forEach(expense => {
    result[expense.category] += expense.amount;
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
