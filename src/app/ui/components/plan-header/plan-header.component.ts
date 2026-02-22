import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MealPlan } from '../../../models/meal.model';

@Component({
  selector: 'app-plan-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule, CurrencyPipe],
  template: `
    <div class="plan-header">
      <div class="plan-info">
        <div class="plan-icon">
          <mat-icon>calendar_today</mat-icon>
        </div>
        <div class="plan-details">
          <h2>Menu de la semaine</h2>
          <div class="plan-stats">
            <span class="stat">
              <mat-icon>account_balance_wallet</mat-icon>
              Budget: {{ plan().totalBudget | currency:'EUR' }}
            </span>
            <span class="divider">|</span>
            <span class="stat">
              <mat-icon>receipt</mat-icon>
              Coût estimé: {{ plan().estimatedCost | currency:'EUR' }}
            </span>
            <span class="divider">|</span>
            <span class="stat" [class.under-budget]="isUnderBudget()" [class.over-budget]="!isUnderBudget()">
              <mat-icon>{{ isUnderBudget() ? 'savings' : 'warning' }}</mat-icon>
              {{ isUnderBudget() ? 'Dans le budget' : 'Dépassement' }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="plan-actions">
        <button 
          mat-stroked-button 
          color="primary"
          (click)="onRegenerate()"
          [disabled]="isLoading()"
          class="regenerate-btn">
          <mat-icon>{{ isLoading() ? 'refresh' : 'autorenew' }}</mat-icon>
          <span class="btn-text">{{ isLoading() ? 'Génération...' : 'Régénérer' }}</span>
        </button>
        
        <button 
          mat-raised-button 
          color="primary"
          (click)="onGenerateShoppingList()"
          [disabled]="isLoading()">
          <mat-icon>shopping_cart</mat-icon>
          <span class="btn-text">Liste de courses</span>
        </button>
        
        <button 
          mat-icon-button 
          color="warn"
          (click)="onClear()"
          matTooltip="Supprimer le plan">
          <mat-icon>delete</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .plan-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 20px 24px;
      background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(255, 64, 129, 0.08) 100%);
      border-radius: 16px;
      border: 1px solid rgba(25, 118, 210, 0.2);
      
      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
      }
    }
    
    .plan-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .plan-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--primary-color) 0%, #ff4081 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      
      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: white;
      }
    }
    
    .plan-details {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 500;
      }
    }
    
    .plan-stats {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      
      .stat {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        color: var(--text-secondary);
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
        
        &.under-budget {
          color: #4caf50;
          font-weight: 500;
        }
        
        &.over-budget {
          color: #f44336;
          font-weight: 500;
        }
      }
      
      .divider {
        color: var(--border);
      }
    }
    
    .plan-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      
      @media (max-width: 768px) {
        justify-content: stretch;
        
        button {
          flex: 1;
        }
      }
    }
    
    .regenerate-btn {
      border-style: dashed;
      
      mat-icon {
        animation: spin 2s linear infinite;
      }
    }
    
    .btn-text {
      @media (max-width: 480px) {
        display: none;
      }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class PlanHeaderComponent {
  readonly plan = input.required<MealPlan>();
  readonly isLoading = input<boolean>(false);
  
  readonly regenerate = output<void>();
  readonly generateShoppingList = output<void>();
  readonly clear = output<void>();
  
  isUnderBudget(): boolean {
    return this.plan().estimatedCost <= this.plan().totalBudget;
  }
  
  onRegenerate(): void {
    this.regenerate.emit();
  }
  
  onGenerateShoppingList(): void {
    this.generateShoppingList.emit();
  }
  
  onClear(): void {
    this.clear.emit();
  }
}
