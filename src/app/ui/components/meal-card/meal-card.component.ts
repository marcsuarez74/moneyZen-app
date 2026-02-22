import { Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Meal } from '../../../models/meal.model';

@Component({
  selector: 'app-meal-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, CurrencyPipe],
  template: `
    <div class="meal-card">
      <div class="meal-image">
        <img [src]="imageUrl()" [alt]="meal().name">
        <div class="meal-type-badge">{{ typeLabel() }}</div>
      </div>
      
      <div class="meal-content">
        <div class="meal-header">
          <h3 class="meal-name">{{ meal().name }}</h3>
          <span class="meal-price">{{ meal().estimatedCost | currency:'EUR' }}</span>
        </div>
        
        <div class="meal-meta">
          <span class="meta-item">
            <mat-icon>schedule</mat-icon>
            {{ meal().prepTime }} min
          </span>
          <span class="meta-item">
            <mat-icon>local_fire_department</mat-icon>
            {{ meal().calories }} kcal
          </span>
        </div>
        
        @if (meal().sourceUrl) {
          <a [href]="meal().sourceUrl" 
             target="_blank" 
             rel="noopener noreferrer"
             class="recipe-link">
            <mat-icon>open_in_new</mat-icon>
            <span>Voir la recette</span>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .meal-card {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--surface);
      border-radius: 12px;
      border: 1px solid var(--border);
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }
    
    .meal-image {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .meal-type-badge {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 4px 8px;
      background: rgba(25, 118, 210, 0.9);
      color: white;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    
    .meal-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .meal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    
    .meal-name {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      line-height: 1.3;
    }
    
    .meal-price {
      font-weight: 600;
      color: #4caf50;
      font-size: 14px;
      white-space: nowrap;
    }
    
    .meal-meta {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-secondary);
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
    
    .recipe-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 6px 12px;
      background: var(--primary-light);
      color: var(--primary-color);
      text-decoration: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
      align-self: flex-start;
      
      &:hover {
        background: var(--primary-color);
        color: white;
      }
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class MealCardComponent {
  readonly meal = input.required<Meal>();
  readonly imageUrl = input.required<string>();
  readonly typeLabel = input.required<string>();
}
