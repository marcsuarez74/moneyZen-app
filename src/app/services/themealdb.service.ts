import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface MealDbResponse {
  meals: MealDbItem[];
}

export interface MealDbItem {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string;
  strYoutube: string;
  // Ingrédients (jusqu'à 20)
  strIngredient1: string;
  strIngredient2: string;
  strIngredient3: string;
  strIngredient4: string;
  strIngredient5: string;
  strIngredient6: string;
  strIngredient7: string;
  strIngredient8: string;
  strIngredient9: string;
  strIngredient10: string;
  strIngredient11: string;
  strIngredient12: string;
  strIngredient13: string;
  strIngredient14: string;
  strIngredient15: string;
  strIngredient16: string;
  strIngredient17: string;
  strIngredient18: string;
  strIngredient19: string;
  strIngredient20: string;
  // Mesures (jusqu'à 20)
  strMeasure1: string;
  strMeasure2: string;
  strMeasure3: string;
  strMeasure4: string;
  strMeasure5: string;
  strMeasure6: string;
  strMeasure7: string;
  strMeasure8: string;
  strMeasure9: string;
  strMeasure10: string;
  strMeasure11: string;
  strMeasure12: string;
  strMeasure13: string;
  strMeasure14: string;
  strMeasure15: string;
  strMeasure16: string;
  strMeasure17: string;
  strMeasure18: string;
  strMeasure19: string;
  strMeasure20: string;
}

@Injectable({
  providedIn: 'root'
})
export class TheMealDbService {
  private readonly API_URL = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) {}

  // Rechercher des repas par nom
  searchMeals(query: string): Observable<MealDbItem[]> {
    return this.http.get<MealDbResponse>(`${this.API_URL}/search.php?s=${query}`)
      .pipe(map(response => response.meals || []));
  }

  // Récupérer un repas aléatoire
  getRandomMeal(): Observable<MealDbItem> {
    return this.http.get<MealDbResponse>(`${this.API_URL}/random.php`)
      .pipe(map(response => response.meals?.[0] || null));
  }

  // Récupérer plusieurs repas aléatoires
  getMultipleRandomMeals(count: number): Observable<MealDbItem[]> {
    const requests: Observable<MealDbItem>[] = [];
    for (let i = 0; i < count; i++) {
      requests.push(this.getRandomMeal());
    }
    return new Observable(observer => {
      let completed = 0;
      const results: MealDbItem[] = [];
      
      requests.forEach(req => {
        req.subscribe({
          next: (meal) => {
            if (meal) results.push(meal);
            completed++;
            if (completed === count) {
              observer.next(results);
              observer.complete();
            }
          },
          error: () => {
            completed++;
            if (completed === count) {
              observer.next(results);
              observer.complete();
            }
          }
        });
      });
    });
  }

  // Lister toutes les catégories
  getCategories(): Observable<any[]> {
    return this.http.get<{categories: any[]}>(`${this.API_URL}/list.php?c=list`)
      .pipe(map(response => response.categories || []));
  }

  // Filtrer par catégorie
  filterByCategory(category: string): Observable<MealDbItem[]> {
    return this.http.get<MealDbResponse>(`${this.API_URL}/filter.php?c=${category}`)
      .pipe(map(response => response.meals || []));
  }

  // Récupérer les détails d'un repas par ID
  getMealById(id: string): Observable<MealDbItem> {
    return this.http.get<MealDbResponse>(`${this.API_URL}/lookup.php?i=${id}`)
      .pipe(map(response => response.meals?.[0] || null));
  }

  // Extraire les ingrédients d'un repas
  extractIngredients(meal: MealDbItem): Array<{name: string; measure: string; quantity: number; unit: string}> {
    const ingredients: Array<{name: string; measure: string; quantity: number; unit: string}> = [];
    
    for (let i = 1; i <= 20; i++) {
      const ingredient = (meal as any)[`strIngredient${i}`];
      const measure = (meal as any)[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        const parsed = this.parseMeasure(measure);
        ingredients.push({
          name: ingredient.trim(),
          measure: measure || '1',
          quantity: parsed.quantity,
          unit: parsed.unit
        });
      }
    }
    
    return ingredients;
  }

  // Parser une mesure pour extraire la quantité et l'unité
  private parseMeasure(measure: string | null): {quantity: number; unit: string} {
    if (!measure) return { quantity: 1, unit: 'unité' };
    
    const cleanMeasure = measure.toLowerCase().trim();
    
    // Extraction du nombre
    const numberMatch = cleanMeasure.match(/(\d+\.?\d*)/);
    const quantity = numberMatch ? parseFloat(numberMatch[1]) : 1;
    
    // Détection de l'unité
    let unit = 'unité';
    if (cleanMeasure.includes('g') || cleanMeasure.includes('gram')) unit = 'g';
    else if (cleanMeasure.includes('kg')) unit = 'kg';
    else if (cleanMeasure.includes('ml')) unit = 'ml';
    else if (cleanMeasure.includes('l') || cleanMeasure.includes('litre')) unit = 'L';
    else if (cleanMeasure.includes('cup') || cleanMeasure.includes('tasse')) unit = 'tasse';
    else if (cleanMeasure.includes('tbsp') || cleanMeasure.includes('cuillère à soupe')) unit = 'càs';
    else if (cleanMeasure.includes('tsp') || cleanMeasure.includes('cuillère à café')) unit = 'càc';
    else if (cleanMeasure.includes('oz') || cleanMeasure.includes('once')) unit = 'oz';
    else if (cleanMeasure.includes('lb') || cleanMeasure.includes('pound')) unit = 'lb';
    
    return { quantity, unit };
  }

  // Catégoriser un ingrédient
  categorizeIngredient(name: string): string {
    const lowerName = name.toLowerCase();
    
    // Viandes
    if (lowerName.includes('beef') || lowerName.includes('steak') || lowerName.includes('pork') || 
        lowerName.includes('lamb') || lowerName.includes('bacon') || lowerName.includes('ham') ||
        lowerName.includes('veal') || lowerName.includes('ground meat') || lowerName.includes('minced')) {
      return 'meat';
    }
    
    // Volaille
    if (lowerName.includes('chicken') || lowerName.includes('turkey') || lowerName.includes('duck')) {
      return 'poultry';
    }
    
    // Poisson
    if (lowerName.includes('salmon') || lowerName.includes('tuna') || lowerName.includes('fish') ||
        lowerName.includes('cod') || lowerName.includes('shrimp') || lowerName.includes('prawn') ||
        lowerName.includes('mussel') || lowerName.includes('scallop')) {
      return 'fish';
    }
    
    // Produits laitiers
    if (lowerName.includes('cheese') || lowerName.includes('milk') || lowerName.includes('butter') ||
        lowerName.includes('cream') || lowerName.includes('yogurt') || lowerName.includes('egg') ||
        lowerName.includes('mozzarella') || lowerName.includes('cheddar') || lowerName.includes('parmesan')) {
      return 'dairy';
    }
    
    // Fruits et légumes
    if (lowerName.includes('tomato') || lowerName.includes('onion') || lowerName.includes('garlic') ||
        lowerName.includes('potato') || lowerName.includes('carrot') || lowerName.includes('lettuce') ||
        lowerName.includes('pepper') || lowerName.includes('broccoli') || lowerName.includes('mushroom') ||
        lowerName.includes('lemon') || lowerName.includes('lime') || lowerName.includes('orange') ||
        lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('avocado')) {
      return 'produce';
    }
    
    // Boulangerie
    if (lowerName.includes('bread') || lowerName.includes('flour') || lowerName.includes('yeast') ||
        lowerName.includes('pastry') || lowerName.includes('bun') || lowerName.includes('roll') ||
        lowerName.includes('tortilla')) {
      return 'bakery';
    }
    
    // Boissons
    if (lowerName.includes('wine') || lowerName.includes('beer') || lowerName.includes('juice') ||
        lowerName.includes('soda') || lowerName.includes('water') || lowerName.includes('stock') ||
        lowerName.includes('broth')) {
      return 'beverages';
    }
    
    // Surgelés (difficile à détecter, par défaut épicerie)
    // Épicerie par défaut
    return 'pantry';
  }

  // Estimer le prix d'un ingrédient basé sur sa catégorie et unité
  estimatePrice(category: string, quantity: number, unit: string = 'unité', ingredientName: string = ''): number {
    // Prix de base au kg (ou au litre pour les boissons)
    const basePrices: Record<string, number> = {
      meat: 18,        // ~18€/kg
      poultry: 12,     // ~12€/kg
      fish: 22,        // ~22€/kg
      dairy: 8,        // ~8€/kg
      produce: 4,      // ~4€/kg
      bakery: 6,       // ~6€/kg
      frozen: 15,      // ~15€/kg
      beverages: 3,    // ~3€/L
      pantry: 7        // ~7€/kg
    };
    
    const basePrice = basePrices[category] || 5;
    
    // Conversion de la quantité selon l'unité
    let normalizedQuantity = quantity;
    
    switch (unit.toLowerCase()) {
      case 'g':
      case 'gram':
      case 'grams':
      case 'gr':
        normalizedQuantity = quantity / 1000; // Convertir en kg
        break;
      case 'kg':
      case 'kilo':
        // Déjà en kg
        break;
      case 'ml':
        normalizedQuantity = quantity / 1000; // Convertir en L
        break;
      case 'l':
      case 'litre':
      case 'liter':
        // Déjà en L
        break;
      case 'oz':
      case 'ounce':
        normalizedQuantity = quantity * 0.02835; // Convertir oz en kg
        break;
      case 'lb':
      case 'pound':
        normalizedQuantity = quantity * 0.453592; // Convertir lb en kg
        break;
      case 'unité':
      case 'unit':
      case '':
      case 'pc':
      case 'piece':
        // Pour les unités, on estime selon le type d'ingrédient
        normalizedQuantity = this.estimateUnitWeight(category, ingredientName);
        break;
      case 'càs':
      case 'tbsp':
      case 'tablespoon':
        normalizedQuantity = 0.015; // ~15g
        break;
      case 'càc':
      case 'tsp':
      case 'teaspoon':
        normalizedQuantity = 0.005; // ~5g
        break;
      case 'tasse':
      case 'cup':
        normalizedQuantity = 0.24; // ~240ml ou ~240g selon le produit
        break;
      default:
        // Pour les autres unités, on assume que c'est une unité
        normalizedQuantity = this.estimateUnitWeight(category, ingredientName);
    }
    
    // Si la quantité normalisée est trop faible (ex: 1g au lieu de 100g), on corrige
    if (normalizedQuantity < 0.01 && quantity >= 1) {
      normalizedQuantity = this.estimateUnitWeight(category, ingredientName);
    }
    
    const price = basePrice * normalizedQuantity;
    return Math.round(price * 100) / 100;
  }
  
  // Estime le poids d'une unité selon la catégorie
  private estimateUnitWeight(category: string, ingredientName: string): number {
    const lowerName = ingredientName.toLowerCase();
    
    // Produits laitiers
    if (category === 'dairy') {
      if (lowerName.includes('egg') || lowerName.includes('oeuf')) return 0.06; // 1 oeuf = 60g
      if (lowerName.includes('butter') || lowerName.includes('beurre')) return 0.25; // 1 plaquette = 250g
      if (lowerName.includes('cheese') || lowerName.includes('fromage')) return 0.2; // 1 portion = 200g
      if (lowerName.includes('milk') || lowerName.includes('lait')) return 1; // 1L
      return 0.2;
    }
    
    // Viandes
    if (category === 'meat') {
      if (lowerName.includes('steak') || lowerName.includes('cutlet')) return 0.15; // 150g
      return 0.2; // ~200g par portion
    }
    
    // Volaille
    if (category === 'poultry') {
      if (lowerName.includes('breast') || lowerName.includes('escalope')) return 0.15; // 150g
      if (lowerName.includes('thigh') || lowerName.includes('cuisse')) return 0.12; // 120g
      return 0.15;
    }
    
    // Poisson
    if (category === 'fish') {
      if (lowerName.includes('fillet') || lowerName.includes('pavé')) return 0.15; // 150g
      if (lowerName.includes('shrimp') || lowerName.includes('prawn')) return 0.1; // 100g
      return 0.15;
    }
    
    // Légumes
    if (category === 'produce') {
      if (lowerName.includes('onion') || lowerName.includes('oignon')) return 0.1; // 100g
      if (lowerName.includes('potato') || lowerName.includes('pomme de terre')) return 0.15; // 150g
      if (lowerName.includes('tomato') || lowerName.includes('tomate')) return 0.12; // 120g
      if (lowerName.includes('carrot') || lowerName.includes('carotte')) return 0.08; // 80g
      if (lowerName.includes('garlic') || lowerName.includes('ail')) return 0.005; // 5g
      if (lowerName.includes('lemon') || lowerName.includes('lime')) return 0.07; // 70g
      return 0.1;
    }
    
    // Boulangerie
    if (category === 'bakery') {
      return 0.08; // 80g par portion
    }
    
    // Épicerie
    if (category === 'pantry') {
      return 0.1; // 100g par défaut
    }
    
    // Boissons
    if (category === 'beverages') {
      return 0.25; // 250ml par verre
    }
    
    return 0.1; // 100g par défaut
  }
}
