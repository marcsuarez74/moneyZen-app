import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { FinancialInsight } from '../../../../services/budget-advisor.service';

/**
 * DUMB COMPONENT - Affichage des insights/priorités budgétaires
 * Affiche les alertes et opportunités importantes en haut du dashboard
 */
@Component({
  selector: 'app-budget-insights',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    @if (insights().length > 0) {
      <div class="insights-container">
        @for (insight of insights(); track insight.title) {
          <mat-card class="insight-card" [class]="insight.type">
            <div class="insight-content">
              <div class="insight-icon-wrapper" [class]="insight.type">
                <mat-icon>{{ insight.icon }}</mat-icon>
              </div>
              
              <div class="insight-body">
                <div class="insight-header">
                  <h3>{{ insight.title }}</h3>
                  <mat-chip-listbox>
                    <mat-chip [class]="insight.type">
                      {{ getPriorityLabel(insight.priority) }}
                    </mat-chip>
                  </mat-chip-listbox>
                </div>
                <p>{{ insight.description }}</p>
              </div>
              
              @if (insight.actionable && insight.actionText) {
                <button mat-stroked-button (click)="actionClicked.emit(insight)">
                  {{ insight.actionText }}
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              }
            </div>
          </mat-card>
        }
      </div>
    }
  `,
  styles: [`
    .insights-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .insight-card {
      border-left: 4px solid;
      
      &.warning {
        border-left-color: #f44336;
        background: rgba(244, 67, 54, 0.02);
      }
      
      &.positive {
        border-left-color: #4caf50;
        background: rgba(76, 175, 80, 0.02);
      }
      
      &.info {
        border-left-color: #2196f3;
        background: rgba(33, 150, 243, 0.02);
      }
      
      &.opportunity {
        border-left-color: #ff9800;
        background: rgba(255, 152, 0, 0.02);
      }
      
      mat-card-content {
        padding: 16px;
      }
    }
    
    .insight-content {
      display: flex;
      align-items: center;
      gap: 16px;
      
      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    
    .insight-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      
      &.warning {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }
      
      &.positive {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }
      
      &.info {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }
      
      &.opportunity {
        background: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }
    }
    
    .insight-body {
      flex: 1;
      
      .insight-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 4px;
        
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        mat-chip {
          font-size: 11px;
          min-height: 20px;
          padding: 4px 8px;
          
          &.warning { background: #f44336; color: white; }
          &.positive { background: #4caf50; color: white; }
          &.info { background: #2196f3; color: white; }
          &.opportunity { background: #ff9800; color: white; }
        }
      }
      
      p {
        margin: 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.5;
      }
    }
    
    button {
      white-space: nowrap;
      
      mat-icon {
        margin-left: 4px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
  `]
})
export class BudgetInsightsComponent {
  readonly insights = input.required<FinancialInsight[]>();
  readonly actionClicked = output<FinancialInsight>();
  
  protected getPriorityLabel(priority: number): string {
    if (priority >= 9) return 'Critique';
    if (priority >= 7) return 'Important';
    if (priority >= 5) return 'Conseillé';
    return 'Info';
  }
}
