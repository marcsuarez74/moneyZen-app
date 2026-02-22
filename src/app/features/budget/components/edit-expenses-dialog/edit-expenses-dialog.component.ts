import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Expense, EXPENSE_CATEGORIES } from '../../../../models/budget.model';

/**
 * DIALOG - Édition des dépenses/charges
 * Permet d'ajouter, modifier et supprimer des dépenses
 */
@Component({
  selector: 'app-edit-expenses-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    CurrencyPipe
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Modifier mes charges
    </h2>
    
    <mat-dialog-content>
      <div class="expenses-list">
        @for (expense of expenses(); track expense.id) {
          <div class="expense-item">
            <div class="expense-fields">
              <mat-form-field appearance="outline" class="field-name">
                <mat-label>Nom</mat-label>
                <input matInput [(ngModel)]="expense.name" placeholder="Loyer">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="field-category">
                <mat-label>Catégorie</mat-label>
                <mat-select [(ngModel)]="expense.category">
                  @for (cat of categories; track cat.value) {
                    <mat-option [value]="cat.value">
                      <mat-icon>{{ cat.icon }}</mat-icon>
                      {{ cat.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="field-amount">
                <mat-label>Montant</mat-label>
                <input matInput type="number" [(ngModel)]="expense.amount">
                <span matSuffix>€</span>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="field-frequency">
                <mat-label>Fréquence</mat-label>
                <mat-select [(ngModel)]="expense.frequency">
                  <mat-option value="monthly">Mensuel</mat-option>
                  <mat-option value="quarterly">Trimestriel</mat-option>
                  <mat-option value="yearly">Annuel</mat-option>
                  <mat-option value="one-time">Ponctuel</mat-option>
                </mat-select>
              </mat-form-field>
              
              <div class="monthly-equivalent">
                <span class="label">Mensuel:</span>
                <span class="value">{{ expense.monthlyEquivalent | currency:'EUR' }}</span>
              </div>
            </div>
            
            <button mat-icon-button 
                    color="warn" 
                    (click)="removeExpense(expense.id)"
                    matTooltip="Supprimer cette charge">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          
          @if (!$last) {
            <mat-divider></mat-divider>
          }
        }
      </div>
      
      <div class="total-section">
        <div class="total-item">
          <span>Total mensuel:</span>
          <strong>{{ totalMonthly() | currency:'EUR' }}</strong>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="addNewExpense()">
        <mat-icon>add</mat-icon>
        Ajouter une charge
      </button>
      <div class="spacer"></div>
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSave()">
        <mat-icon>save</mat-icon>
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      padding: 16px 24px;
      
      mat-icon {
        color: var(--primary-color);
      }
    }
    
    mat-dialog-content {
      min-width: 700px;
      max-height: 60vh;
      padding: 24px;
      overflow-y: auto;
      
      @media (max-width: 768px) {
        min-width: 100%;
        padding: 16px;
      }
    }
    
    .expenses-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .expense-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: var(--surface-variant);
      border-radius: 8px;
      
      &:hover {
        background: var(--surface);
      }
      
      .expense-fields {
        display: grid;
        grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr;
        gap: 12px;
        flex: 1;
        
        @media (max-width: 900px) {
          grid-template-columns: 1fr 1fr;
        }
        
        .field-name { grid-column: 1; }
        .field-category { grid-column: 2; }
        .field-amount { grid-column: 3; }
        .field-frequency { grid-column: 4; }
        
        @media (max-width: 900px) {
          .field-name { grid-column: 1 / -1; }
          .field-category { grid-column: 1; }
          .field-amount { grid-column: 2; }
          .field-frequency { grid-column: 1; }
        }
      }
      
      mat-form-field {
        margin-bottom: -20px;
      }
      
      .monthly-equivalent {
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 8px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 4px;
        min-width: 100px;
        
        .label {
          font-size: 11px;
          color: var(--text-secondary);
        }
        
        .value {
          font-size: 14px;
          font-weight: 600;
          color: #4caf50;
        }
      }
    }
    
    .expense-actions {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    
    .total-section {
      margin-top: 24px;
      padding: 16px;
      background: var(--surface);
      border-radius: 8px;
      
      .total-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          font-size: 16px;
          color: var(--text-secondary);
        }
        
        strong {
          font-size: 20px;
          color: var(--text-primary);
        }
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      
      .spacer {
        flex: 1;
      }
    }
  `]
})
export class EditExpensesDialogComponent {
  private dialogRef = inject(MatDialogRef<EditExpensesDialogComponent>);
  
  readonly data = inject<{ expenses: Expense[] }>(MAT_DIALOG_DATA);
  
  readonly expenses = signal<Expense[]>([...this.data.expenses]);
  readonly categories = EXPENSE_CATEGORIES;
  
  readonly totalMonthly = () => 
    this.expenses().reduce((sum, e) => sum + e.monthlyEquivalent, 0);
  
  addNewExpense(): void {
    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      name: 'Nouvelle charge',
      category: 'other',
      amount: 0,
      frequency: 'monthly',
      monthlyEquivalent: 0
    };
    this.expenses.update(exp => [...exp, newExpense]);
  }
  
  removeExpense(id: string): void {
    this.expenses.update(exp => exp.filter(e => e.id !== id));
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSave(): void {
    // Recalculer les équivalents mensuels
    const updatedExpenses = this.expenses().map(expense => ({
      ...expense,
      monthlyEquivalent: this.calculateMonthlyEquivalent(expense)
    }));
    this.dialogRef.close(updatedExpenses);
  }
  
  private calculateMonthlyEquivalent(expense: Expense): number {
    switch (expense.frequency) {
      case 'monthly':
        return expense.amount;
      case 'quarterly':
        return expense.amount / 3;
      case 'yearly':
        return expense.amount / 12;
      case 'one-time':
        return 0; // On ne compte pas les dépenses ponctuelles dans le mensuel
      default:
        return expense.amount;
    }
  }
}
