import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { BudgetSummary, EXPENSE_CATEGORIES, Recommendation } from '../../../../models/budget.model';
import { BudgetAnalysis } from '../../../../services/budget-advisor.service';

/**
 * DUMB COMPONENT - Affichage des recommandations budgétaires
 */
@Component({
  selector: 'app-budget-recommendations',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatBadgeModule, CurrencyPipe],
  template: `
    <mat-card class="recommendations-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>lightbulb</mat-icon>
        <mat-card-title>Recommandations</mat-card-title>
        <mat-card-subtitle>
          {{ analysis()?.recommendations?.length || 0 }} conseils personnalisés
        </mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        @if (highPriorityRecs().length > 0) {
          <div class="priority-section">
            <h4 class="priority-title">
              <mat-icon color="warn">priority_high</mat-icon>
              Actions prioritaires
            </h4>
            
            @for (rec of highPriorityRecs(); track rec.id) {
              <div class="rec-item high-priority">
                <div class="rec-header">
                  <div class="rec-type-icon" [class]="rec.type">
                    <mat-icon>{{ getRecIcon(rec.type) }}</mat-icon>
                  </div>
                  <div class="rec-info">
                    <span class="rec-title">{{ rec.title }}</span>
                    <span class="rec-category">{{ getCategoryLabel(rec.category) }}</span>
                  </div>
                  @if (rec.potentialSavings > 0) {
                    <span class="rec-savings">
                      <mat-icon>savings</mat-icon>
                      {{ rec.potentialSavings | currency:'EUR' }}
                    </span>
                  }
                </div>
                <p class="rec-description">{{ rec.description }}</p>
                <div class="rec-actions">
                  <button mat-button color="primary" (click)="viewDetails.emit(rec)">
                    Détails
                  </button>
                  <button mat-raised-button color="primary" (click)="applyRecommendation.emit(rec)">
                    Appliquer
                  </button>
                </div>
              </div>
            }
          </div>
        }
        
        @if (mediumPriorityRecs().length > 0) {
          <div class="priority-section">
            <h4 class="priority-title">
              <mat-icon>star</mat-icon>
              Optimisations possibles
            </h4>
            
            @for (rec of mediumPriorityRecs().slice(0, 3); track rec.id) {
              <div class="rec-item medium-priority">
                <div class="rec-header">
                  <div class="rec-type-icon" [class]="rec.type">
                    <mat-icon>{{ getRecIcon(rec.type) }}</mat-icon>
                  </div>
                  <div class="rec-info">
                    <span class="rec-title">{{ rec.title }}</span>
                    <span class="rec-category">{{ getCategoryLabel(rec.category) }}</span>
                  </div>
                </div>
                <p class="rec-description">{{ rec.description }}</p>
              </div>
            }
          </div>
        }
        
        @if (!analysis()?.recommendations?.length) {
          <div class="no-recommendations">
            <mat-icon class="success-icon">check_circle</mat-icon>
            <h3>Excellent !</h3>
            <p>Votre budget est bien optimisé. Continuez ainsi !</p>
            <div class="metrics-preview">
              <span>Santé: {{ analysis()?.metrics?.budgetHealth || 0 }}/100</span>
              <span>Épargne: {{ analysis()?.metrics?.savingsRate?.toFixed(1) || 0 }}%</span>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .recommendations-card {
      height: 100%;
      
      mat-card-content {
        padding: 16px;
      }
    }
    
    .priority-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .priority-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }
    
    .rec-item {
      padding: 16px;
      background: var(--surface-variant);
      border-radius: 12px;
      margin-bottom: 12px;
      border-left: 4px solid transparent;
      
      &.high-priority {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.05);
      }
      
      &.medium-priority {
        border-left-color: #ff9800;
      }
      
      .rec-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        .rec-type-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          
          mat-icon {
            font-size: 20px;
            color: var(--text-secondary);
          }
          
          &.reduce { background: rgba(244, 67, 54, 0.1); mat-icon { color: #f44336; } }
          &.eliminate { background: rgba(156, 39, 176, 0.1); mat-icon { color: #9c27b0; } }
          &.optimize { background: rgba(33, 150, 243, 0.1); mat-icon { color: #2196f3; } }
          &.suggestion { background: rgba(76, 175, 80, 0.1); mat-icon { color: #4caf50; } }
        }
        
        .rec-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          
          .rec-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }
          
          .rec-category {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
        
        .rec-savings {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #4caf50;
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          
          mat-icon {
            font-size: 14px;
            width: 14px;
            height: 14px;
          }
        }
      }
      
      .rec-description {
        margin: 0 0 12px 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
      }
      
      .rec-actions {
        display: flex;
        gap: 8px;
        
        button {
          font-size: 13px;
        }
      }
    }
    
    .no-recommendations {
      text-align: center;
      padding: 32px;
      
      .success-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #4caf50;
        margin-bottom: 16px;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
      }
      
      p {
        margin: 0 0 16px 0;
        color: var(--text-secondary);
      }
      
      .metrics-preview {
        display: flex;
        justify-content: center;
        gap: 24px;
        
        span {
          padding: 8px 16px;
          background: var(--surface-variant);
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  `]
})
export class BudgetRecommendationsComponent {
  readonly analysis = input<BudgetAnalysis | null>(null);
  readonly summary = input<BudgetSummary | null>(null);
  
  readonly applyRecommendation = output<Recommendation>();
  readonly viewDetails = output<Recommendation>();
  
  protected highPriorityRecs = () => 
    this.analysis()?.recommendations?.filter(r => r.priority === 'high') || [];
  
  protected mediumPriorityRecs = () => 
    this.analysis()?.recommendations?.filter(r => r.priority === 'medium') || [];
  
  protected getRecIcon(type: string): string {
    const icons: Record<string, string> = {
      'reduce': 'trending_down',
      'eliminate': 'delete',
      'optimize': 'sync',
      'suggestion': 'lightbulb'
    };
    return icons[type] || 'info';
  }
  
  protected getCategoryLabel(category: string): string {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  }
}
