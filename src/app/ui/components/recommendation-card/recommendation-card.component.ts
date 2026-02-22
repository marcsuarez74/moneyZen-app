import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Recommendation, ExpenseCategory } from '../../../models/budget.model';

@Component({
  selector: 'app-recommendation-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card class="recommendation-card" [class]="'priority-' + recommendation().priority">
      <mat-card-content>
        <div class="rec-header">
          <div class="rec-icon" [class]="recommendation().type">
            <mat-icon>{{ getTypeIcon(recommendation().type) }}</mat-icon>
          </div>
          <div class="rec-title-section">
            <h3 class="rec-title">{{ recommendation().title }}</h3>
            <mat-chip-listbox>
              <mat-chip [color]="getPriorityColor(recommendation().priority)" highlighted>
                {{ getPriorityLabel(recommendation().priority) }}
              </mat-chip>
            </mat-chip-listbox>
          </div>
        </div>
        
        <p class="rec-description">{{ recommendation().description }}</p>
        
        <div class="rec-footer" *ngIf="recommendation().potentialSavings > 0">
          <div class="savings">
            <mat-icon>savings</mat-icon>
            <span>Économie potentielle: <strong>{{ recommendation().potentialSavings | currency:'EUR' }}</strong></span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .recommendation-card {
      margin-bottom: 16px;
      border-left: 4px solid var(--primary-color);
    }
    
    .recommendation-card.priority-high {
      border-left-color: #f44336;
    }
    
    .recommendation-card.priority-medium {
      border-left-color: #ff9800;
    }
    
    .recommendation-card.priority-low {
      border-left-color: #4caf50;
    }
    
    .rec-header {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }
    
    .rec-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-variant);
    }
    
    .rec-icon mat-icon {
      font-size: 24px;
    }
    
    .rec-icon.reduce {
      background: #fff3e0;
      color: #e65100;
    }
    
    .rec-icon.eliminate {
      background: #ffebee;
      color: #c62828;
    }
    
    .rec-icon.optimize {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .rec-icon.suggestion {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .rec-title-section {
      flex: 1;
    }
    
    .rec-title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .rec-description {
      color: var(--text-secondary);
      margin: 0 0 16px 0;
      line-height: 1.5;
    }
    
    .rec-footer {
      padding-top: 12px;
      border-top: 1px solid var(--divider-color);
    }
    
    .savings {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
    }
    
    .savings mat-icon {
      font-size: 20px;
    }
  `]
})
export class RecommendationCardComponent {
  readonly recommendation = input.required<Recommendation>();
  
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      reduce: 'trending_down',
      eliminate: 'delete_forever',
      optimize: 'tune',
      suggestion: 'lightbulb'
    };
    return icons[type] || 'info';
  }
  
  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      high: 'warn',
      medium: 'accent',
      low: 'primary'
    };
    return colors[priority] || 'primary';
  }
  
  getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
      high: 'Priorité haute',
      medium: 'Priorité moyenne',
      low: 'Priorité basse'
    };
    return labels[priority] || priority;
  }
}
