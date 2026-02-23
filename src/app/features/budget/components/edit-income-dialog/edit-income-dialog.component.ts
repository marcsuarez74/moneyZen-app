import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatIconModule,
    MatSliderModule,
    MatTooltipModule
  ],
  templateUrl: './edit-income-dialog.component.html',
  styleUrls: ['./edit-income-dialog.component.scss']
})
export class EditIncomeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditIncomeDialogComponent>);
  
  readonly data = inject<{ userData: UserFinancialData | null }>(MAT_DIALOG_DATA);
  
  readonly incomeForm: FormGroup = this.fb.group({
    salary: [this.data?.userData?.salary || 0, [Validators.required, Validators.min(0)]],
    accountBalance: [this.data?.userData?.accountBalance || 0, Validators.required],
    paydayDay: [this.data?.userData?.paydayDay || 1, [Validators.required, Validators.min(1), Validators.max(31)]]
  });

  readonly isPositiveBalance = computed(() => {
    const balance = this.incomeForm.get('accountBalance')?.value;
    return balance >= 0;
  });

  readonly balanceStatusText = computed(() => {
    const balance = this.incomeForm.get('accountBalance')?.value;
    if (balance > 0) return 'Compte créditeur';
    if (balance < 0) return 'Compte débiteur';
    return 'Solde nul';
  });

  readonly balanceHint = computed(() => {
    const balance = this.incomeForm.get('accountBalance')?.value;
    if (balance > 0) return '💰 Votre compte est positif';
    if (balance < 0) return '⚠️ Attention : vous êtes en découvert';
    return 'Saisissez votre solde actuel';
  });

  incrementPayday(): void {
    const currentValue = this.incomeForm.get('paydayDay')?.value || 1;
    if (currentValue < 31) {
      this.incomeForm.get('paydayDay')?.setValue(currentValue + 1);
    }
  }

  decrementPayday(): void {
    const currentValue = this.incomeForm.get('paydayDay')?.value || 1;
    if (currentValue > 1) {
      this.incomeForm.get('paydayDay')?.setValue(currentValue - 1);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.incomeForm.valid) {
      const result: UserFinancialData = {
        salary: this.incomeForm.value.salary,
        accountBalance: this.incomeForm.value.accountBalance,
        isPositiveBalance: this.incomeForm.value.accountBalance >= 0,
        paydayDay: this.incomeForm.value.paydayDay
      };
      this.dialogRef.close(result);
    }
  }
}