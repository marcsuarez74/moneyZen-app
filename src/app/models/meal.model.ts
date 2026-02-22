export interface MealPlan {
  id: string;
  weekStartDate: Date;
  days: DayPlan[];
  totalBudget: number;
  estimatedCost: number;
}

export interface DayPlan {
  day: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi' | 'Dimanche';
  meals: Meal[];
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  ingredients: Ingredient[];
  estimatedCost: number;
  calories: number;
  prepTime: number;
  category: 'vegetarian' | 'meat' | 'fish' | 'poultry' | 'pasta' | 'soup' | 'salad';
  image?: string; // URL de l'image depuis TheMealDB
  sourceUrl?: string; // Lien vers la recette originale (TheMealDB)
  youtubeUrl?: string; // Lien vers la vidéo YouTube si disponible
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: 'produce' | 'meat' | 'poultry' | 'fish' | 'dairy' | 'pantry' | 'frozen' | 'bakery' | 'beverages';
}

export interface ShoppingList {
  items: ShoppingItem[];
  totalEstimatedCost: number;
  generatedAt: Date;
}

export interface ShoppingItem {
  ingredient: Ingredient;
  quantity: number;
  isChecked: boolean;
}

export const DAYS_OF_WEEK: string[] = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
];

export const MEAL_CATEGORIES: { value: Meal['category']; label: string }[] = [
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'meat', label: 'Viande' },
  { value: 'fish', label: 'Poisson' },
  { value: 'poultry', label: 'Volaille' },
  { value: 'pasta', label: 'Pâtes' },
  { value: 'soup', label: 'Soupe' },
  { value: 'salad', label: 'Salade' }
];

export const MEAL_TEMPLATES: Partial<Meal>[] = [
  // Petits déjeuners
  {
    type: 'breakfast',
    name: 'Toast avocat et œuf',
    ingredients: [
      { name: 'Pain de mie', quantity: 2, unit: 'tranches', category: 'bakery', estimatedPrice: 0.3 },
      { name: 'Avocat', quantity: 0.5, unit: 'unité', category: 'produce', estimatedPrice: 1.2 },
      { name: 'Oeuf', quantity: 1, unit: 'unité', category: 'dairy', estimatedPrice: 0.3 }
    ],
    estimatedCost: 1.8,
    calories: 320,
    prepTime: 10,
    category: 'vegetarian'
  },
  {
    type: 'breakfast',
    name: 'Bowl de céréales et fruits',
    ingredients: [
      { name: 'Céréales', quantity: 50, unit: 'g', category: 'pantry', estimatedPrice: 0.4 },
      { name: 'Lait', quantity: 200, unit: 'ml', category: 'dairy', estimatedPrice: 0.3 },
      { name: 'Banane', quantity: 1, unit: 'unité', category: 'produce', estimatedPrice: 0.4 }
    ],
    estimatedCost: 1.1,
    calories: 280,
    prepTime: 5,
    category: 'vegetarian'
  },
  // Déjeuners/Dîners
  {
    type: 'lunch',
    name: 'Pâtes à la bolognaise',
    ingredients: [
      { name: 'Pâtes', quantity: 100, unit: 'g', category: 'pantry', estimatedPrice: 0.5 },
      { name: 'Viande hachée', quantity: 150, unit: 'g', category: 'meat', estimatedPrice: 2.5 },
      { name: 'Sauce tomate', quantity: 100, unit: 'ml', category: 'pantry', estimatedPrice: 0.8 },
      { name: 'Parmesan', quantity: 20, unit: 'g', category: 'dairy', estimatedPrice: 0.6 }
    ],
    estimatedCost: 4.4,
    calories: 650,
    prepTime: 25,
    category: 'meat'
  },
  {
    type: 'lunch',
    name: 'Poulet rôti et légumes',
    ingredients: [
      { name: 'Filet de poulet', quantity: 150, unit: 'g', category: 'poultry', estimatedPrice: 3.0 },
      { name: 'Pommes de terre', quantity: 200, unit: 'g', category: 'produce', estimatedPrice: 0.5 },
      { name: 'Carottes', quantity: 100, unit: 'g', category: 'produce', estimatedPrice: 0.4 },
      { name: 'Herbes de Provence', quantity: 1, unit: 'pincée', category: 'pantry', estimatedPrice: 0.1 }
    ],
    estimatedCost: 4.0,
    calories: 520,
    prepTime: 40,
    category: 'poultry'
  },
  {
    type: 'lunch',
    name: 'Saumon grillé et riz',
    ingredients: [
      { name: 'Pavé de saumon', quantity: 150, unit: 'g', category: 'fish', estimatedPrice: 4.5 },
      { name: 'Riz', quantity: 80, unit: 'g', category: 'pantry', estimatedPrice: 0.4 },
      { name: 'Brocolis', quantity: 150, unit: 'g', category: 'produce', estimatedPrice: 1.0 },
      { name: 'Citron', quantity: 0.5, unit: 'unité', category: 'produce', estimatedPrice: 0.3 }
    ],
    estimatedCost: 6.2,
    calories: 580,
    prepTime: 30,
    category: 'fish'
  },
  {
    type: 'lunch',
    name: 'Curry de légumes',
    ingredients: [
      { name: 'Pois chiches', quantity: 200, unit: 'g', category: 'pantry', estimatedPrice: 1.2 },
      { name: 'Lait de coco', quantity: 200, unit: 'ml', category: 'pantry', estimatedPrice: 1.0 },
      { name: 'Épinards', quantity: 150, unit: 'g', category: 'produce', estimatedPrice: 1.5 },
      { name: 'Curry en poudre', quantity: 1, unit: 'càs', category: 'pantry', estimatedPrice: 0.3 },
      { name: 'Riz', quantity: 80, unit: 'g', category: 'pantry', estimatedPrice: 0.4 }
    ],
    estimatedCost: 4.4,
    calories: 480,
    prepTime: 25,
    category: 'vegetarian'
  },
  {
    type: 'lunch',
    name: 'Salade césar au poulet',
    ingredients: [
      { name: 'Laitue romaine', quantity: 100, unit: 'g', category: 'produce', estimatedPrice: 1.0 },
      { name: 'Filet de poulet', quantity: 100, unit: 'g', category: 'poultry', estimatedPrice: 2.0 },
      { name: 'Croûtons', quantity: 30, unit: 'g', category: 'bakery', estimatedPrice: 0.5 },
      { name: 'Sauce césar', quantity: 30, unit: 'ml', category: 'pantry', estimatedPrice: 0.5 },
      { name: 'Parmesan', quantity: 20, unit: 'g', category: 'dairy', estimatedPrice: 0.6 }
    ],
    estimatedCost: 4.6,
    calories: 420,
    prepTime: 15,
    category: 'salad'
  },
  {
    type: 'lunch',
    name: 'Quiche lorraine',
    ingredients: [
      { name: 'Pâte brisée', quantity: 1, unit: 'unité', category: 'bakery', estimatedPrice: 2.0 },
      { name: 'Lardons', quantity: 100, unit: 'g', category: 'meat', estimatedPrice: 2.0 },
      { name: 'Oeufs', quantity: 3, unit: 'unité', category: 'dairy', estimatedPrice: 0.9 },
      { name: 'Crème fraîche', quantity: 200, unit: 'ml', category: 'dairy', estimatedPrice: 1.5 }
    ],
    estimatedCost: 6.4,
    calories: 680,
    prepTime: 45,
    category: 'meat'
  },
  {
    type: 'dinner',
    name: 'Omelette aux champignons',
    ingredients: [
      { name: 'Oeufs', quantity: 3, unit: 'unité', category: 'dairy', estimatedPrice: 0.9 },
      { name: 'Champignons', quantity: 100, unit: 'g', category: 'produce', estimatedPrice: 1.5 },
      { name: 'Emmental râpé', quantity: 30, unit: 'g', category: 'dairy', estimatedPrice: 0.5 },
      { name: 'Salade verte', quantity: 80, unit: 'g', category: 'produce', estimatedPrice: 1.0 }
    ],
    estimatedCost: 3.9,
    calories: 380,
    prepTime: 15,
    category: 'vegetarian'
  },
  {
    type: 'dinner',
    name: 'Soupe de légumes',
    ingredients: [
      { name: 'Pommes de terre', quantity: 150, unit: 'g', category: 'produce', estimatedPrice: 0.4 },
      { name: 'Carottes', quantity: 100, unit: 'g', category: 'produce', estimatedPrice: 0.4 },
      { name: 'Poireaux', quantity: 1, unit: 'unité', category: 'produce', estimatedPrice: 1.0 },
      { name: 'Bouillon de légumes', quantity: 500, unit: 'ml', category: 'pantry', estimatedPrice: 0.5 },
      { name: 'Pain', quantity: 2, unit: 'tranches', category: 'bakery', estimatedPrice: 0.4 }
    ],
    estimatedCost: 2.7,
    calories: 280,
    prepTime: 35,
    category: 'soup'
  }
];
