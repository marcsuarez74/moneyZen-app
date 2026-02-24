import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule
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
    const balance = Number(this.incomeForm.get('accountBalance')?.value ?? 0);
    return !isNaN(balance) && balance >= 0;
  });

  readonly balanceStatusText = computed(() => {
    const balance = Number(this.incomeForm.get('accountBalance')?.value ?? 0);
    if (isNaN(balance)) return 'Solde invalide';
    if (balance > 0) return 'Solde positif';
    if (balance < 0) return 'En découvert';
    return 'Solde vide';
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

  toggleBalanceSign(): void {
    const currentValue = Number(this.incomeForm.get('accountBalance')?.value || 0);
    this.incomeForm.get('accountBalance')?.setValue(-currentValue);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.incomeForm.valid) {
      // S'assurer que accountBalance n'est jamais null
      let accountBalance = this.incomeForm.value.accountBalance;
      if (accountBalance === null || accountBalance === undefined || accountBalance === '') {
        accountBalance = 0;
      }
      accountBalance = Number(accountBalance);
      
      const salary = Number(this.incomeForm.value.salary ?? 0);
      const paydayDay = Number(this.incomeForm.value.paydayDay ?? 1);
      
      // Vérifier que les valeurs sont valides
      if (isNaN(accountBalance) || isNaN(salary) || isNaN(paydayDay)) {
        console.error('Valeurs invalides détectées:', { accountBalance, salary, paydayDay });
        return;
      }
      
      const result: UserFinancialData = {
        salary: salary,
        accountBalance: accountBalance,
        isPositiveBalance: accountBalance >= 0,
        paydayDay: paydayDay
      };
      this.dialogRef.close(result);
    }
  }
}