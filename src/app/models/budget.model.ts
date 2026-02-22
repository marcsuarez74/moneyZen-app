export interface UserFinancialData {
  salary: number;
  accountBalance: number;
  isPositiveBalance: boolean;
  paydayDay?: number; // Jour du mois de la paie (1-31)
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  monthlyEquivalent: number;
}

// Catégories enrichies avec plus de détails
export type ExpenseCategory =
  // Logement et crédits
  | 'housing'           // Loyer/Prêt immobilier
  | 'mortgage'          // Crédit immobilier spécifique
  | 'propertyTax'       // Taxe foncière
  | 'condoFees'         // Charges de copropriété
  | 'housingServices'   // Services liés au logement (ménage, jardinage, etc.)
  
  // Transport et crédits véhicule
  | 'transport'         // Transport général
  | 'carLoan'           // Crédit voiture
  | 'carInsurance'      // Assurance auto spécifique
  | 'fuel'              // Carburant
  | 'carMaintenance'    // Entretien véhicule
  | 'publicTransport'   // Transport en commun
  
  // Alimentation
  | 'food'              // Courses alimentaires
  | 'restaurants'       // Restauration extérieure
  
  // Services et utilities
  | 'utilities'         // Services génériques
  | 'internet'          // Internet
  | 'phone'             // Téléphone mobile
  | 'tvStreaming'       // TV et streaming
  | 'energy'            // Électricité/Gaz
  | 'water'             // Eau
  
  // Assurances (autres que auto)
  | 'insurance'         // Assurances génériques
  | 'homeInsurance'     // Assurance habitation
  | 'healthInsurance'   // Assurance santé/Mutuelle
  | 'lifeInsurance'     // Assurance vie
  
  // Santé
  | 'health'            // Santé générale
  | 'medicalExpenses'   // Frais médicaux
  | 'pharmacy'          // Pharmacie
   
  // Éducation
  | 'education'         // Éducation générale
  | 'tuition'           // Scolarité/Frais d'études
  | 'schoolSupplies'    // Fournitures scolaires
  
  // Loisirs et sport
  | 'leisure'           // Loisirs génériques
  | 'sport'             // Sport et activités physiques
  | 'gym'               // Salle de sport
  | 'streaming'         // Abonnements streaming
  | 'hobbies'           // Passions et hobbies
  | 'culture'           // Culture (cinéma, musée, etc.)
  | 'travel'            // Voyages et vacances
  
  // Services personnels
  | 'personalServices'  // Services personnels
  | 'beauty'            // Beauté et soins
  | 'clothing'          // Vêtements
   
  // Crédits et dettes
  | 'consumerLoan'      // Crédit consommation
  | 'debtRepayment'     // Remboursement dettes
  
  // Épargne et investissement
  | 'savings'           // Épargne
  | 'investments'       // Investissements
  | 'retirement'        // Retraite/PEA
  
  // Autres
  | 'pets'              // Animaux
  | 'gifts'             // Cadeaux
  | 'donations'         // Dons et associations
  | 'taxes'             // Autres taxes
  | 'other';            // Autres dépenses

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number;
  savingsPotential: number;
  expenseBreakdown: Record<ExpenseCategory, number>;
}

export interface BudgetOptimization {
  recommendations: Recommendation[];
  optimizedBudget: OptimizedCategory[];
  projectedSavings: number;
}

export interface Recommendation {
  id: string;
  type: 'reduce' | 'eliminate' | 'optimize' | 'suggestion';
  category: ExpenseCategory;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OptimizedCategory {
  category: ExpenseCategory;
  currentAmount: number;
  recommendedAmount: number;
  rationale: string;
}

// Catégories avec icônes et regroupement logique
export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string; group: string }[] = [
  // Groupe: Logement
  { value: 'housing', label: 'Loyer / Logement', icon: 'home', group: 'Logement' },
  { value: 'mortgage', label: 'Crédit immobilier', icon: 'account_balance', group: 'Logement' },
  { value: 'propertyTax', label: 'Taxe foncière', icon: 'receipt', group: 'Logement' },
  { value: 'condoFees', label: 'Charges copropriété', icon: 'apartment', group: 'Logement' },
  { value: 'housingServices', label: 'Services logement', icon: 'cleaning_services', group: 'Logement' },
  
  // Groupe: Transport
  { value: 'transport', label: 'Transport (général)', icon: 'commute', group: 'Transport' },
  { value: 'carLoan', label: 'Crédit voiture', icon: 'directions_car', group: 'Transport' },
  { value: 'carInsurance', label: 'Assurance auto', icon: 'local_car_wash', group: 'Transport' },
  { value: 'fuel', label: 'Carburant', icon: 'local_gas_station', group: 'Transport' },
  { value: 'carMaintenance', label: 'Entretien véhicule', icon: 'build', group: 'Transport' },
  { value: 'publicTransport', label: 'Transport en commun', icon: 'train', group: 'Transport' },
  
  // Groupe: Alimentation
  { value: 'food', label: 'Courses alimentaires', icon: 'shopping_cart', group: 'Alimentation' },
  { value: 'restaurants', label: 'Restaurants / Traiteur', icon: 'restaurant', group: 'Alimentation' },
  
  // Groupe: Services
  { value: 'utilities', label: 'Services (général)', icon: 'miscellaneous_services', group: 'Services' },
  { value: 'internet', label: 'Internet', icon: 'wifi', group: 'Services' },
  { value: 'phone', label: 'Téléphone', icon: 'phone_android', group: 'Services' },
  { value: 'tvStreaming', label: 'TV / Streaming', icon: 'tv', group: 'Services' },
  { value: 'energy', label: 'Électricité / Gaz', icon: 'bolt', group: 'Services' },
  { value: 'water', label: 'Eau', icon: 'water_drop', group: 'Services' },
  
  // Groupe: Assurances
  { value: 'insurance', label: 'Assurances (général)', icon: 'verified_user', group: 'Assurances' },
  { value: 'homeInsurance', label: 'Assurance habitation', icon: 'home_work', group: 'Assurances' },
  { value: 'healthInsurance', label: 'Mutuelle santé', icon: 'local_hospital', group: 'Assurances' },
  { value: 'lifeInsurance', label: 'Assurance vie', icon: 'favorite', group: 'Assurances' },
  
  // Groupe: Santé
  { value: 'health', label: 'Santé (général)', icon: 'healing', group: 'Santé' },
  { value: 'medicalExpenses', label: 'Frais médicaux', icon: 'medical_services', group: 'Santé' },
  { value: 'pharmacy', label: 'Pharmacie', icon: 'local_pharmacy', group: 'Santé' },
  
  // Groupe: Éducation
  { value: 'education', label: 'Éducation (général)', icon: 'school', group: 'Éducation' },
  { value: 'tuition', label: 'Scolarité / Études', icon: 'menu_book', group: 'Éducation' },
  { value: 'schoolSupplies', label: 'Fournitures', icon: 'edit', group: 'Éducation' },
  
  // Groupe: Loisirs & Sport
  { value: 'leisure', label: 'Loisirs (général)', icon: 'sports_esports', group: 'Loisirs' },
  { value: 'sport', label: 'Sport / Activités', icon: 'fitness_center', group: 'Loisirs' },
  { value: 'gym', label: 'Salle de sport', icon: 'sports_gymnastics', group: 'Loisirs' },
  { value: 'streaming', label: 'Abonnements (Netflix, etc.)', icon: 'subscriptions', group: 'Loisirs' },
  { value: 'hobbies', label: 'Passions / Hobbies', icon: 'palette', group: 'Loisirs' },
  { value: 'culture', label: 'Culture (cinéma, musée)', icon: 'theaters', group: 'Loisirs' },
  { value: 'travel', label: 'Voyages / Vacances', icon: 'flight', group: 'Loisirs' },
  
  // Groupe: Services personnels
  { value: 'personalServices', label: 'Services personnels', icon: 'spa', group: 'Personnel' },
  { value: 'beauty', label: 'Beauté / Coiffure', icon: 'face', group: 'Personnel' },
  { value: 'clothing', label: 'Habillement', icon: 'checkroom', group: 'Personnel' },
  
  // Groupe: Crédits
  { value: 'consumerLoan', label: 'Crédit consommation', icon: 'credit_card', group: 'Crédits' },
  { value: 'debtRepayment', label: 'Remboursement dettes', icon: 'money_off', group: 'Crédits' },
  
  // Groupe: Épargne
  { value: 'savings', label: 'Épargne', icon: 'savings', group: 'Épargne' },
  { value: 'investments', label: 'Investissements', icon: 'trending_up', group: 'Épargne' },
  { value: 'retirement', label: 'Retraite / PEA', icon: 'elderly', group: 'Épargne' },
  
  // Groupe: Divers
  { value: 'pets', label: 'Animaux', icon: 'pets', group: 'Divers' },
  { value: 'gifts', label: 'Cadeaux', icon: 'redeem', group: 'Divers' },
  { value: 'donations', label: 'Dons / Associations', icon: 'volunteer_activism', group: 'Divers' },
  { value: 'taxes', label: 'Autres taxes', icon: 'account_balance', group: 'Divers' },
  { value: 'other', label: 'Autres dépenses', icon: 'more_horiz', group: 'Divers' }
];

// Définitions de dépenses prédéfinies
export const PREDEFINED_EXPENSES: Partial<Expense>[] = [
  // Logement
  { name: 'Loyer', category: 'housing', frequency: 'monthly' },
  { name: 'Crédit immobilier', category: 'mortgage', frequency: 'monthly' },
  { name: 'Taxe foncière', category: 'propertyTax', frequency: 'yearly' },
  { name: 'Charges de copropriété', category: 'condoFees', frequency: 'monthly' },
  { name: 'Femme de ménage', category: 'housingServices', frequency: 'monthly' },
  { name: 'Jardinier', category: 'housingServices', frequency: 'monthly' },
  
  // Transport
  { name: 'Crédit voiture', category: 'carLoan', frequency: 'monthly' },
  { name: 'Assurance auto', category: 'carInsurance', frequency: 'monthly' },
  { name: 'Carburant', category: 'fuel', frequency: 'monthly' },
  { name: 'Entretien véhicule', category: 'carMaintenance', frequency: 'quarterly' },
  { name: 'Transport en commun', category: 'publicTransport', frequency: 'monthly' },
  { name: 'Parking', category: 'transport', frequency: 'monthly' },
  
  // Services
  { name: 'Abonnement internet', category: 'internet', frequency: 'monthly' },
  { name: 'Forfait mobile', category: 'phone', frequency: 'monthly' },
  { name: 'Box TV / Streaming', category: 'tvStreaming', frequency: 'monthly' },
  { name: 'Électricité', category: 'energy', frequency: 'monthly' },
  { name: 'Gaz', category: 'energy', frequency: 'monthly' },
  { name: 'Eau', category: 'water', frequency: 'quarterly' },
  
  // Assurances
  { name: 'Assurance habitation', category: 'homeInsurance', frequency: 'yearly' },
  { name: 'Mutuelle santé', category: 'healthInsurance', frequency: 'monthly' },
  { name: 'Assurance vie', category: 'lifeInsurance', frequency: 'yearly' },
  
  // Alimentation
  { name: 'Courses alimentaires', category: 'food', frequency: 'monthly' },
  { name: 'Restaurants', category: 'restaurants', frequency: 'monthly' },
  { name: 'Cantine', category: 'restaurants', frequency: 'monthly' },
  
  // Loisirs & Sport
  { name: 'Abonnement salle de sport', category: 'gym', frequency: 'monthly' },
  { name: 'Netflix / Streaming', category: 'streaming', frequency: 'monthly' },
  { name: 'Sport (cours, équipement)', category: 'sport', frequency: 'monthly' },
  { name: 'Cinéma, concerts, musées', category: 'culture', frequency: 'monthly' },
  { name: 'Voyages / Vacances', category: 'travel', frequency: 'yearly' },
  
  // Santé
  { name: 'Frais médicaux', category: 'medicalExpenses', frequency: 'monthly' },
  { name: 'Pharmacie', category: 'pharmacy', frequency: 'monthly' },
  
  // Éducation
  { name: 'Frais de scolarité', category: 'tuition', frequency: 'monthly' },
  { name: 'Fournitures scolaires', category: 'schoolSupplies', frequency: 'yearly' },
  { name: 'Cours particuliers', category: 'education', frequency: 'monthly' },
  
  // Personnel
  { name: 'Coiffeur / Esthétique', category: 'beauty', frequency: 'monthly' },
  { name: 'Vêtements', category: 'clothing', frequency: 'quarterly' },
  
  // Crédits
  { name: 'Crédit consommation', category: 'consumerLoan', frequency: 'monthly' },
  { name: 'Remboursement dettes', category: 'debtRepayment', frequency: 'monthly' },
  
  // Divers
  { name: 'Animaux de compagnie', category: 'pets', frequency: 'monthly' },
  { name: 'Cadeaux', category: 'gifts', frequency: 'monthly' },
  { name: 'Dons / Associations', category: 'donations', frequency: 'monthly' },
  
  // Épargne
  { name: 'Épargne régulière', category: 'savings', frequency: 'monthly' },
  { name: 'Investissements', category: 'investments', frequency: 'monthly' },
  { name: 'Retraite / PEA', category: 'retirement', frequency: 'monthly' }
];

// Fonction utilitaire pour obtenir les catégories groupées
export function getCategoriesByGroup(): Record<string, typeof EXPENSE_CATEGORIES> {
  const grouped: Record<string, typeof EXPENSE_CATEGORIES> = {};
  
  EXPENSE_CATEGORIES.forEach(cat => {
    if (!grouped[cat.group]) {
      grouped[cat.group] = [];
    }
    grouped[cat.group].push(cat);
  });
  
  return grouped;
}
