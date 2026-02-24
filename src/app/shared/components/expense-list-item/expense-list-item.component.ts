/**
 * DUMB COMPONENT - Affichage d'une dépense individuelle
 * Affiche les infos + actions éditer/supprimer
 */
import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ExpenseCategoryChipComponent } from '../expense-category-chip/expense-category-chip.component';
import { ExpenseRecord } from '../../../models/expense-record.model';

@Component({
  selector: 'app-expense-list-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ExpenseCategoryChipComponent
  ],
  template: `
    <div class="expense-item" [class.editing]="isEditing()">
      <div class="expense-main">
        <!-- Icône/Catégorie -->
        <app-expense-category-chip [category]="expense().category">
        </app-expense-category-chip>

        <!-- Info principale -->
        <div class="expense-info">
          <div class="expense-description">
            {{ expense().description || categoryLabel() }}
          </div>
          <div class="expense-date">
            {{ expense().date | date:'dd/MM/yyyy' }}
          </div>
        </div>

        <!-- Montant -->
        <div class="expense-amount">
          -{{ expense().amount | currency:'EUR':'symbol':'1.2-2' }}
        </div>

        <!-- Actions -->
        @if (showActions()) {
          <div class="expense-actions">
            <button 
              mat-icon-button
              [matMenuTriggerFor]="menu"
              aria-label="Actions">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="onEdit()">
                <mat-icon>edit</mat-icon>
                <span>Modifier</span>
              </button>
              <button mat-menu-item (click)="onDelete()" class="delete-action">
                <mat-icon color="warn">delete</mat-icon>
                <span class="warn-text">Supprimer</span>
              </button>
            </mat-menu>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .expense-item {
      background: var(--fintech-surface, #ffffff);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
      border: 1px solid var(--fintech-border, #e0e0e0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

      &:hover {
        background: var(--fintech-surface-variant, #f8f9fa);
        border-color: var(--fintech-primary, #667eea);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      }

      &.editing {
        border-color: var(--fintech-primary, #667eea);
        background: rgba(102, 126, 234, 0.08);
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .expense-main {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .expense-info {
      flex: 1;
      min-width: 0;
    }

    .expense-description {
      font-weight: 600;
      font-size: 1rem;
      color: var(--fintech-text-primary, #212121);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .expense-date {
      font-size: 0.875rem;
      color: var(--fintech-text-secondary, #666666);
      font-weight: 500;
    }

    .expense-amount {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--fintech-error, #d32f2f);
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.5px;
    }

    .expense-actions {
      opacity: 0;
      transition: opacity 0.2s ease;

      button {
        color: var(--fintech-text-secondary, #666666);
        
        &:hover {
          background: rgba(102, 126, 234, 0.1);
          color: var(--fintech-primary, #667eea);
        }
      }

      .expense-item:hover & {
        opacity: 1;
      }
    }

    .delete-action {
      .warn-text {
        color: var(--fintech-error, #d32f2f);
        font-weight: 600;
      }
    }

    // ============================================
    // DARK THEME
    // ============================================
    :host-context(.dark-theme) {
      .expense-item {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
        }

        &.editing {
          background: rgba(102, 126, 234, 0.15);
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
      }

      .expense-description {
        color: rgba(255, 255, 255, 0.9);
      }

      .expense-date {
        color: rgba(255, 255, 255, 0.6);
      }

      .expense-amount {
        color: #ff6b6b;
      }

      .expense-actions {
        button {
          color: rgba(255, 255, 255, 0.6);
          
          &:hover {
            background: rgba(102, 126, 234, 0.2);
            color: #667eea;
          }
        }
      }
    }

    @media (max-width: 600px) {
      .expense-item {
        padding: 12px;
        margin-bottom: 10px;
      }

      .expense-main {
        gap: 12px;
      }

      .expense-description {
        font-size: 0.9375rem;
      }

      .expense-amount {
        font-size: 1rem;
      }

      .expense-actions {
        opacity: 1;
        
        button {
          width: 36px;
          height: 36px;
          line-height: 36px;
        }
      }
    }

    @media (hover: none) {
      .expense-actions {
        opacity: 1;
      }
    }
  `]
})
export class ExpenseListItemComponent {
  expense = input.required<ExpenseRecord>();
  showActions = input(true);
  isEditing = input(false);

  edit = output<ExpenseRecord>();
  delete = output<string>();

  categoryLabel = () => {
    const labels: Record<string, string> = {
      food: 'Alimentation',
      transport: 'Transport',
      leisure: 'Loisirs',
      shopping: 'Shopping',
      health: 'Santé',
      education: 'Éducation',
      other: 'Autre'
    };
    return labels[this.expense().category] || 'Dépense';
  };

  onEdit(): void {
    this.edit.emit(this.expense());
  }

  onDelete(): void {
    this.delete.emit(this.expense().id);
  }
}
