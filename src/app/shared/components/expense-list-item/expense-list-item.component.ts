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
      background: var(--surface-color, #ffffff);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.2s ease;
      border: 1px solid transparent;

      &:hover {
        background: var(--surface-hover, #f5f5f5);
        border-color: var(--border-color, #e0e0e0);
        transform: translateX(4px);
      }

      &.editing {
        border-color: var(--primary-color, #1976d2);
        background: var(--primary-light, #e3f2fd);
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
      font-weight: 500;
      font-size: 1rem;
      color: var(--text-primary, #212121);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .expense-date {
      font-size: 0.875rem;
      color: var(--text-secondary, #757575);
    }

    .expense-amount {
      font-size: 1.125rem;
      font-weight: 600;
      color: #d32f2f;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.5px;
    }

    .expense-actions {
      opacity: 0;
      transition: opacity 0.2s ease;

      .expense-item:hover & {
        opacity: 1;
      }
    }

    .delete-action {
      .warn-text {
        color: #d32f2f;
      }
    }

    @media (max-width: 600px) {
      .expense-item {
        padding: 12px;
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
