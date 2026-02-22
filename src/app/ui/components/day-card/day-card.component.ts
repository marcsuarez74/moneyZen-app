import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DayPlan } from '../../../models/meal.model';
import { MealCardComponent } from '../meal-card/meal-card.component';

@Component({
  selector: 'app-day-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MealCardComponent],
  template: `
    <mat-card class="day-card">
      <div class="day-header" [style.background-image]="'url(' + backgroundImage() + ')'">
        <div class="day-overlay">
          <h3>{{ day().day }}</h3>
        </div>
      </div>
      
      <mat-card-content class="day-content">
        <div class="meals-container">
          @for (meal of day().meals; track meal.name) {
            <app-meal-card
              [meal]="meal"
              [imageUrl]="getMealImage(meal)"
              [typeLabel]="getTypeLabel(meal.type)">
            </app-meal-card>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .day-card {
      overflow: hidden;
      border-radius: 16px;
      transition: transform 0.3s, box-shadow 0.3s;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }
    }
    
    .day-header {
      height: 100px;
      background-size: cover;
      background-position: center;
      position: relative;
      
      .day-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
        display: flex;
        align-items: flex-end;
        padding: 16px;
        
        h3 {
          margin: 0;
          color: white;
          font-size: 22px;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      }
    }
    
    .day-content {
      padding: 20px;
    }
    
    .meals-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `]
})
export class DayCardComponent {
  readonly day = input.required<DayPlan>();
  readonly backgroundImage = input.required<string>();
  
  private readonly mealImages: Record<string, string> = {
    'breakfast_vegetarian': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&auto=format&fit=crop',
    'lunch_meat': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=200&auto=format&fit=crop',
    'lunch_poultry': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&auto=format&fit=crop',
    'lunch_fish': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&auto=format&fit=crop',
    'lunch_vegetarian': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop',
    'lunch_pasta': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&auto=format&fit=crop',
    'dinner_meat': 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=200&auto=format&fit=crop',
    'dinner_poultry': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&auto=format&fit=crop',
    'dinner_fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=200&auto=format&fit=crop',
    'dinner_vegetarian': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop',
    'dinner_soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&auto=format&fit=crop',
    'dinner_salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&auto=format&fit=crop'
  };
  
  private readonly defaultImage = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&auto=format&fit=crop';
  
  getMealImage(meal: any): string {
    // Utiliser l'image de TheMealDB si disponible
    if (meal.image) {
      return meal.image;
    }
    
    // Fallback sur les images locales
    const key = `${meal.type}_${meal.category}`;
    return this.mealImages[key] || this.defaultImage;
  }
  
  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      breakfast: 'Petit-déj',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Collation'
    };
    return labels[type] || type;
  }
}
