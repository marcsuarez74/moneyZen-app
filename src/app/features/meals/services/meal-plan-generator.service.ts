import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { TheMealDbService, MealDbItem } from '../../../services/themealdb.service';
import { MealPlan, DayPlan, Meal, Ingredient, DAYS_OF_WEEK } from '../../../models/meal.model';

export interface GenerationConfig {
  weeklyBudget: number;
  daysCount: number;
  mealsPerDay: number;
}

export interface MealValidationResult {
  isValid: boolean;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MealPlanGeneratorService {
  private mealDbService = inject(TheMealDbService);

  // Catégories de repas cohérentes par type de repas
  private readonly validMealTypes: Record<string, string[]> = {
    breakfast: ['Breakfast', 'Dessert', 'Side'], // Petit-déj peut être sucré
    lunch: ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Vegetarian', 'Lamb', 'Pork'], // Déjeuner = plat principal
    dinner: ['Beef', 'Chicken', 'Seafood', 'Pasta', 'Vegetarian', 'Lamb', 'Pork', 'Side', 'Starter'] // Dîner = plat principal ou léger
  };

  // Catégories à exclure pour certains repas
  private readonly excludedCategories: Record<string, string[]> = {
    breakfast: [], // Petit-déj accepte tout
    lunch: ['Dessert'], // Pas de dessert au déjeuner
    dinner: ['Dessert'] // Pas de dessert au dîner
  };

  /**
   * Génère un plan de repas complet avec respect du budget
   */
  async generateMealPlan(config: GenerationConfig): Promise<MealPlan> {
    const { weeklyBudget, daysCount } = config;
    const dailyBudget = weeklyBudget / daysCount;

    // Calculer le budget par repas
    const budgetPerMeal = dailyBudget / 3; // 3 repas par jour

    // Récupérer un pool de recettes
    const mealPool = await this.fetchMealPool(60); // Récupérer plus pour avoir du choix

    // Générer les jours
    const days: DayPlan[] = [];
    
    for (let i = 0; i < daysCount; i++) {
      const dayName = DAYS_OF_WEEK[i] as DayPlan['day'];
      const dayBudget = dailyBudget;
      
      const dailyMeals = this.selectMealsForDay(mealPool, dayBudget, budgetPerMeal);
      
      if (dailyMeals.length > 0) {
        days.push({
          day: dayName,
          meals: dailyMeals
        });
      }
    }

    const estimatedCost = this.calculateTotalCost(days);

    return {
      id: 'meal_' + Date.now(),
      weekStartDate: new Date(),
      days,
      totalBudget: weeklyBudget,
      estimatedCost
    };
  }

  /**
   * Récupère un pool de recettes variées
   */
  private async fetchMealPool(count: number): Promise<MealDbItem[]> {
    const meals = await lastValueFrom(this.mealDbService.getMultipleRandomMeals(count));
    return meals.filter(meal => this.isMealValid(meal).isValid);
  }

  /**
   * Valide si une recette est utilisable
   */
  private isMealValid(meal: MealDbItem): MealValidationResult {
    if (!meal || !meal.strMeal || !meal.strCategory) {
      return { isValid: false, reason: 'Données incomplètes' };
    }

    const ingredients = this.mealDbService.extractIngredients(meal);
    if (ingredients.length === 0) {
      return { isValid: false, reason: 'Aucun ingrédient' };
    }

    if (ingredients.length < 3) {
      return { isValid: false, reason: 'Trop peu d\'ingrédients' };
    }

    return { isValid: true };
  }

  /**
   * Sélectionne les repas pour une journée avec respect du budget
   */
  private selectMealsForDay(mealPool: MealDbItem[], dayBudget: number, budgetPerMeal: number): Meal[] {
    const selectedMeals: Meal[] = [];
    let remainingBudget = dayBudget;

    // Petit-déjeuner (priorité : pas trop cher)
    const breakfast = this.selectBestMeal(
      mealPool, 
      'breakfast', 
      remainingBudget * 0.25, // 25% du budget pour le petit-déj
      selectedMeals
    );
    
    if (breakfast) {
      selectedMeals.push(breakfast);
      remainingBudget -= breakfast.estimatedCost;
    }

    // Déjeuner (priorité : plat principal)
    const lunch = this.selectBestMeal(
      mealPool,
      'lunch',
      remainingBudget * 0.45, // 45% pour le déjeuner
      selectedMeals
    );

    if (lunch) {
      selectedMeals.push(lunch);
      remainingBudget -= lunch.estimatedCost;
    }

    // Dîner (priorité : utilise le reste du budget)
    const dinner = this.selectBestMeal(
      mealPool,
      'dinner',
      remainingBudget, // Le reste
      selectedMeals
    );

    if (dinner) {
      selectedMeals.push(dinner);
    }

    return selectedMeals;
  }

  /**
   * Sélectionne le meilleur repas pour un type donné
   */
  private selectBestMeal(
    mealPool: MealDbItem[],
    mealType: 'breakfast' | 'lunch' | 'dinner',
    maxBudget: number,
    alreadySelected: Meal[]
  ): Meal | null {
    const validCategories = this.validMealTypes[mealType];
    const excludedCategories = this.excludedCategories[mealType];

    // Filtrer les repas candidats
    const candidates = mealPool.filter(meal => {
      // Vérifier la catégorie
      const category = meal.strCategory || '';
      const isCategoryValid = validCategories.some(valid => 
        category.toLowerCase().includes(valid.toLowerCase())
      );
      
      // Vérifier qu'on exclut pas cette catégorie
      const isExcluded = excludedCategories.some(excluded =>
        category.toLowerCase().includes(excluded.toLowerCase())
      );

      if (!isCategoryValid || isExcluded) return false;

      // Vérifier qu'on ne l'a pas déjà sélectionné
      const alreadyUsed = alreadySelected.some(selected => 
        selected.name === meal.strMeal
      );

      return !alreadyUsed;
    });

    if (candidates.length === 0) return null;

    // Convertir en Meals pour calculer les coûts
    const mealsWithCosts = candidates.map(meal => 
      this.convertToMeal(meal, mealType)
    );

    // Filtrer ceux qui respectent le budget
    const affordableMeals = mealsWithCosts.filter(meal => 
      meal.estimatedCost <= maxBudget
    );

    if (affordableMeals.length === 0) {
      // Si rien n'est abordable, prendre le moins cher
      const cheapest = mealsWithCosts.reduce((min, meal) => 
        meal.estimatedCost < min.estimatedCost ? meal : min
      );
      return cheapest.estimatedCost <= maxBudget * 1.2 ? cheapest : null; // Tolérance de 20%
    }

    // Sélectionner aléatoirement parmi les abordables
    const randomIndex = Math.floor(Math.random() * affordableMeals.length);
    return affordableMeals[randomIndex];
  }

  /**
   * Convertit une recette TheMealDB en Meal
   */
  private convertToMeal(mealDbItem: MealDbItem, type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal {
    const ingredients = this.mealDbService.extractIngredients(mealDbItem);
    
    const convertedIngredients: Ingredient[] = ingredients.map(ing => {
      const category = this.mealDbService.categorizeIngredient(ing.name) as Ingredient['category'];
      return {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        estimatedPrice: this.mealDbService.estimatePrice(category, ing.quantity, ing.unit, ing.name),
        category
      };
    });

    const estimatedCost = convertedIngredients.reduce((sum, ing) => sum + ing.estimatedPrice, 0);
    const estimatedCalories = Math.round(convertedIngredients.length * 120 + 150);
    
    // Construire l'URL vers la recette TheMealDB
    const sourceUrl = mealDbItem.idMeal 
      ? `https://www.themealdb.com/meal/${mealDbItem.idMeal}` 
      : undefined;

    return {
      type,
      name: mealDbItem.strMeal,
      ingredients: convertedIngredients,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      calories: estimatedCalories,
      prepTime: this.estimatePrepTime(convertedIngredients.length),
      category: this.mapCategory(mealDbItem.strCategory),
      image: mealDbItem.strMealThumb,
      sourceUrl: sourceUrl,
      youtubeUrl: mealDbItem.strYoutube || undefined
    };
  }

  /**
   * Mappe la catégorie TheMealDB vers nos catégories
   */
  private mapCategory(mealDbCategory: string): Meal['category'] {
    const category = mealDbCategory?.toLowerCase() || '';
    
    if (category.includes('beef') || category.includes('pork') || category.includes('lamb')) {
      return 'meat';
    }
    if (category.includes('chicken') || category.includes('poultry')) {
      return 'poultry';
    }
    if (category.includes('seafood') || category.includes('fish')) {
      return 'fish';
    }
    if (category.includes('pasta')) {
      return 'pasta';
    }
    if (category.includes('vegetarian') || category.includes('vegan') || category.includes('side')) {
      return 'vegetarian';
    }
    if (category.includes('dessert') || category.includes('breakfast')) {
      return 'vegetarian'; // Les desserts/petit-déj sont souvent végétariens
    }
    
    return 'meat';
  }

  /**
   * Estime le temps de préparation
   */
  private estimatePrepTime(ingredientCount: number): number {
    return Math.min(10 + (ingredientCount * 5), 90);
  }

  /**
   * Calcule le coût total du plan
   */
  private calculateTotalCost(days: DayPlan[]): number {
    return days.reduce((sum, day) => 
      sum + day.meals.reduce((mealSum, meal) => mealSum + meal.estimatedCost, 0), 0
    );
  }
}
