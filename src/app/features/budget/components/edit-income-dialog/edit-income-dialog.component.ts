import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { UserFinancialData } from '../../../../models/budget.model';

@Component({
  selector: 'app-edit-income-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSliderModule,
    CurrencyPipe
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Modifier mes revenus
    </h2>
    
    <mat-dialog-content [formGroup]="incomeForm">
      <div class="form-section">
        <h3>
          <mat-icon>payments</mat-icon>
          Revenus mensuels
        </h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Salaire mensuel net</mat-label>
          <input matInput type="number" formControlName="salary" placeholder="2500">
          <span matSuffix>€</span>
          <mat-hint>Votre revenu principal après impôts</mat-hint>
        </mat-form-field>
      </div>
      
      <div class="form-section">
        <h3>
          <mat-icon>event</mat-icon>
          Jour de paie
        </h3>
        <div class="payday-control">
          <mat-slider min="1" max="31" step="1" discrete showTickMarks>
            <input matSliderThumb formControlName="paydayDay">
          </mat-slider>
          <div class="payday-display">
            <span class="day-number">{{ incomeForm.get('paydayDay')?.value }}</span>
            <span class="day-label">
              {{ incomeForm.get('paydayDay')?.value === 1 ? 'er' : '' }} 
              du mois
            </span>
          </div>
        </div>
        <p class="payday-help">
          Le jour où vous recevez votre salaire nous aide à calculer votre budget quotidien.
        </p>
      </div>
      
      <div class="form-section">
        <h3>
          <mat-icon>account_balance</mat-icon>
          Situation bancaire actuelle
        </h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Solde bancaire actuel</mat-label>
          <input matInput type="number" formControlName="accountBalance" placeholder="0">
          <span matSuffix>€</span>
          <mat-hint>Positif = créditeur, Négatif = débiteur</mat-hint>
        </mat-form-field>
        
        <div class="balance-indicator">
          <mat-slide-toggle formControlName="isPositiveBalance" color="primary">
            Mon solde est positif
          </mat-slide-toggle>
          <span class="balance-status" 
                [class.positive]="incomeForm.get('isPositiveBalance')?.value"
                [class.negative]="!incomeForm.get('isPositiveBalance')?.value">
            {{ incomeForm.get('isPositiveBalance')?.value ? '✓ Compte créditeur' : '⚠ Compte débiteur' }}
          </span>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="!incomeForm.valid">
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
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      
      mat-icon {
        color: var(--primary-color);
      }
    }
    
    mat-dialog-content {
      min-width: 450px;
      padding: 24px;
    }
    
    .form-section {
      margin-bottom: 28px;
      
      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px 0;
        font-size: 15px;
        color: var(--text-secondary);
        font-weight: 500;
        
        mat-icon {
          font-size: 20px;
          color: var(--primary-color);
        }
      }
    }
    
    .full-width {
      width: 100%;
    }
    
    .payday-control {
      background: var(--surface-variant);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 8px;
      
      mat-slider {
        width: 100%;
      }
      
      .payday-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 4px;
        margin-top: 8px;
        
        .day-number {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary-color);
        }
        
        .day-label {
          font-size: 16px;
          color: var(--text-secondary);
        }
      }
    }
    
    .payday-help {
      margin: 8px 0 0 0;
      font-size: 13px;
      color: var(--text-secondary);
      font-style: italic;
    }
    
    .balance-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16px;
      padding: 16px;
      background: var(--surface-variant);
      border-radius: 8px;
      
      .balance-status {
        font-size: 14px;
        font-weight: 600;
        
        &.positive { color: #4caf50; }
        &.negative { color: #f44336; }
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
    }
  `]
})
export class EditIncomeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditIncomeDialogComponent>);
  
  readonly data = inject<{ userData: UserFinancialData | null }>(MAT_DIALOG_DATA);
  
  readonly incomeForm: FormGroup = this.fb.group({
    salary: [this.data?.userData?.salary || 0, [Validators.required, Validators.min(0)]],
    accountBalance: [this.data?.userData?.accountBalance || 0, Validators.required],
    isPositiveBalance: [this.data?.userData?.isPositiveBalance ?? true],
    paydayDay: [this.data?.userData?.paydayDay || 1, [Validators.required, Validators.min(1), Validators.max(31)]]
  });
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSave(): void {
    if (this.incomeForm.valid) {
      const result: UserFinancialData = {
        salary: this.incomeForm.value.salary,
        accountBalance: this.incomeForm.value.accountBalance,
        isPositiveBalance: this.incomeForm.value.isPositiveBalance,
        paydayDay: this.incomeForm.value.paydayDay
      };
      this.dialogRef.close(result);
    }
  }
}
