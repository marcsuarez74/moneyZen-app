import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MealPlan } from '../../../../models/meal.model';
import { DayCardComponent } from '../../../../ui/components/day-card/day-card.component';

/**
 * DUMB COMPONENT - Affichage du plan de repas
 * Responsabilités :
 * - Afficher un plan de repas existant
 * - Afficher les statistiques (budget, jours, etc.)
 * - Émettre des événements utilisateur vers le parent
 * - AUCUNE logique métier, que de l'affichage pur
 */
@Component({
  selector: 'app-meal-plan-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    CurrencyPipe,
    DayCardComponent
  ],
  template: `
    <div class="plan-container">
      <!-- Header avec stats -->
      <mat-card class="stats-card">
        <div class="stats-content">
          <div class="stat-item">
            <mat-icon class="stat-icon">calendar_today</mat-icon>
            <div class="stat-text">
              <span class="stat-value">{{ plan().days.length }} jours</span>
              <span class="stat-label">de repas</span>
            </div>
          </div>
          
          <mat-divider [vertical]="true"></mat-divider>
          
          <div class="stat-item">
            <mat-icon class="stat-icon" [class.over-budget]="isOverBudget()">account_balance_wallet</mat-icon>
            <div class="stat-text">
              <span class="stat-value" [class.over-budget]="isOverBudget()">
                {{ plan().estimatedCost | currency:'EUR' }}
              </span>
              <span class="stat-label">
                sur {{ plan().totalBudget | currency:'EUR' }}
              </span>
            </div>
          </div>
          
          <mat-divider [vertical]="true"></mat-divider>
          
          <div class="stat-item">
            <mat-icon class="stat-icon">restaurant</mat-icon>
            <div class="stat-text">
              <span class="stat-value">{{ totalMealsCount() }} repas</span>
              <span class="stat-label">au total</span>
            </div>
          </div>
        </div>
        
        @if (isOverBudget()) {
          <div class="budget-warning">
            <mat-icon>warning</mat-icon>
            <span>Dépassement de budget de {{ budgetDifference() | currency:'EUR' }}</span>
          </div>
        }
        
        <mat-divider></mat-divider>
        
        <div class="actions-row">
          <button mat-stroked-button 
                  (click)="regenerate.emit()"
                  [disabled]="isLoading()"
                  matTooltip="Générer un nouveau plan">
            @if (isLoading()) {
              <mat-spinner diameter="16"></mat-spinner>
            } @else {
              <mat-icon>refresh</mat-icon>
            }
            <span>Régénérer</span>
          </button>
          
          <button mat-stroked-button 
                  (click)="showShoppingList.emit()"
                  matTooltip="Voir la liste de courses">
            <mat-icon>shopping_cart</mat-icon>
            <span>Liste de courses</span>
          </button>
          
          <button mat-stroked-button 
                  color="warn"
                  (click)="clear.emit()"
                  matTooltip="Supprimer ce plan">
            <mat-icon>delete</mat-icon>
            <span>Supprimer</span>
          </button>
        </div>
      </mat-card>

      <!-- Grille des jours -->
      <div class="days-grid">
        @for (day of plan().days; track day.day) {
          <app-day-card
            [day]="day"
            [backgroundImage]="getDayImage(day.day)">
          </app-day-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .plan-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .stats-card {
      .stats-content {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 16px;
        gap: 16px;
        
        @media (max-width: 600px) {
          flex-direction: column;
          gap: 12px;
          
          mat-divider[vertical] {
            display: none;
          }
        }
      }
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .stat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: var(--primary-color);
          
          &.over-budget {
            color: #f44336;
          }
        }
        
        .stat-text {
          display: flex;
          flex-direction: column;
          
          .stat-value {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            
            &.over-budget {
              color: #f44336;
            }
          }
          
          .stat-label {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
      }
      
      .budget-warning {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
        margin: 0 16px 16px;
        border-radius: 8px;
        font-size: 14px;
        
        mat-icon {
          font-size: 20px;
        }
      }
      
      .actions-row {
        display: flex;
        gap: 12px;
        padding: 16px;
        flex-wrap: wrap;
        justify-content: center;
        
        button {
          display: flex;
          align-items: center;
          gap: 8px;
          
          mat-spinner {
            display: inline-block;
          }
        }
      }
    }
    
    .days-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
  `]
})
export class MealPlanDisplayComponent {
  // Inputs (données venant du parent)
  readonly plan = input.required<MealPlan>();
  readonly isLoading = input<boolean>(false);
  
  // Outputs (événements vers le parent)
  readonly regenerate = output<void>();
  readonly clear = output<void>();
  readonly showShoppingList = output<void>();
  
  // Computed pour l'affichage
  protected totalMealsCount = () => 
    this.plan().days.reduce((sum, day) => sum + day.meals.length, 0);
  
  protected isOverBudget = () => 
    this.plan().estimatedCost > this.plan().totalBudget;
  
  protected budgetDifference = () => 
    Math.abs(this.plan().estimatedCost - this.plan().totalBudget);
  
  // Images pour chaque jour
  private readonly dayImages: Record<string, string> = {
    'Lundi': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop',
    'Mardi': 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&auto=format&fit=crop',
    'Mercredi': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop',
    'Jeudi': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&auto=format&fit=crop',
    'Vendredi': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop',
    'Samedi': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&auto=format&fit=crop',
    'Dimanche': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop'
  };
  
  getDayImage(day: string): string {
    return this.dayImages[day] || this.dayImages['Lundi'];
  }
}
