export interface Project {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  category: ProjectCategory;
  status: 'planning' | 'in-progress' | 'completed';
  monthlyContribution: number;
  steps: ProjectStep[];
}

export type ProjectCategory =
  | 'emergency-fund'
  | 'travel'
  | 'home'
  | 'vehicle'
  | 'education'
  | 'retirement'
  | 'investment'
  | 'other';

export interface ProjectStep {
  id: string;
  order: number;
  description: string;
  targetAmount: number;
  isCompleted: boolean;
  estimatedCompletionDate?: Date;
}

export interface ProjectPlan {
  project: Project;
  feasibility: 'feasible' | 'challenging' | 'unfeasible';
  estimatedCompletionDate: Date;
  requiredMonthlySavings: number;
  adjustments?: string[];
}

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string; icon: string }[] = [
  { value: 'emergency-fund', label: 'Fond d\'urgence', icon: 'Emergency' },
  { value: 'travel', label: 'Voyage', icon: 'flight' },
  { value: 'home', label: 'Immobilier / Travaux', icon: 'home_work' },
  { value: 'vehicle', label: 'Véhicule', icon: 'directions_car' },
  { value: 'education', label: 'Études / Formation', icon: 'school' },
  { value: 'retirement', label: 'Retraite', icon: 'elderly' },
  { value: 'investment', label: 'Investissement', icon: 'trending_up' },
  { value: 'other', label: 'Autre', icon: 'category' }
];

export const PROJECT_TEMPLATES: Partial<Project>[] = [
  {
    name: 'Fond d\'urgence',
    description: 'Constituer un fonds équivalent à 3-6 mois de charges',
    category: 'emergency-fund',
    priority: 'high'
  },
  {
    name: 'Voyage de rêve',
    description: 'Partir en vacances cet été',
    category: 'travel',
    priority: 'medium'
  },
  {
    name: 'Achat immobilier',
    description: 'Constituer l\'apport pour un achat',
    category: 'home',
    priority: 'high'
  },
  {
    name: 'Nouveau véhicule',
    description: 'Achat d\'une voiture',
    category: 'vehicle',
    priority: 'medium'
  },
  {
    name: 'Formations professionnelles',
    description: 'Investir dans sa carrière',
    category: 'education',
    priority: 'medium'
  },
  {
    name: 'Complement retraite',
    description: 'Préparer sa retraite sereinement',
    category: 'retirement',
    priority: 'high'
  },
  {
    name: 'Investissement boursier',
    description: 'Faire fructifier son épargne',
    category: 'investment',
    priority: 'low'
  }
];
