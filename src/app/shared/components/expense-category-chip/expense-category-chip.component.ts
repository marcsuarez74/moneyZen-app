/**
 * DUMB COMPONENT - Chip de catégorie de dépense
 * Affiche une catégorie avec son icône et couleur
 */
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { 
  ExpenseCategory, 
  EXPENSE_CATEGORY_LABELS, 
  EXPENSE_CATEGORY_ICONS, 
  EXPENSE_CATEGORY_COLORS 
} from '../../../models/expense-record.model';

@Component({
  selector: 'app-expense-category-chip',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div 
      [style.background-color]="backgroundColor()"
      [style.color]="textColor()"
      (click)="onClick()"
      (keyup.enter)="onClick()"
      (keyup.space)="onClick()"
      class="category-chip"
      [class.selectable]="selectable()"
      [class.selected]="selected()"
      [attr.tabindex]="selectable() ? 0 : -1"
      [attr.role]="selectable() ? 'radio' : 'presentation'"
      [attr.aria-checked]="selectable() ? selected() : null"
      [attr.aria-label]="label()">
      <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
      <span class="label">{{ label() }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: default;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .label {
        white-space: nowrap;
      }

      &.selectable {
        cursor: pointer;

        &:hover, &:focus {
          filter: brightness(1.1);
          transform: translateY(-1px);
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        &:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
        }

        &.selected {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }
      }
    }

    @media (max-width: 600px) {
      .category-chip {
        padding: 4px 10px;
        font-size: 0.75rem;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        .label {
          display: none;
        }
      }
    }
  `]
})
export class ExpenseCategoryChipComponent {
  category = input.required<ExpenseCategory>();
  selectable = input(false);
  selected = input(false);
  
  clicked = output<ExpenseCategory>();

  label = () => EXPENSE_CATEGORY_LABELS[this.category()];
  icon = () => EXPENSE_CATEGORY_ICONS[this.category()];
  backgroundColor = () => EXPENSE_CATEGORY_COLORS[this.category()];
  textColor = () => this.getContrastColor(EXPENSE_CATEGORY_COLORS[this.category()]);

  private getContrastColor(hexColor: string): string {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  }

  onClick(): void {
    if (this.selectable()) {
      this.clicked.emit(this.category());
    }
  }
}
